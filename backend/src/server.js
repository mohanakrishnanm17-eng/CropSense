const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const otpStore = {};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CropSense backend is running' });
});

app.get('/api/ml-check', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    res.json({ backend_status: 'ok', ml_service_response: data });
  } catch (error) {
    res.status(500).json({ backend_status: 'ok', ml_service_response: 'unreachable', error: error.message });
  }
});

app.get('/api/db-check', async (req, res) => {
  try {
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    if (error && error.code !== 'PGRST205') {
      throw error;
    }
    res.json({ db_status: 'connected', message: 'Supabase connection successful' });
  } catch (error) {
    res.status(500).json({ db_status: 'error', message: error.message });
  }
});

app.post('/api/predict', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const mlResponse = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      body: formData,
    });

    const result = await mlResponse.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Prediction failed', details: error.message });
  }
});

app.post('/api/auth/send-otp', (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number || phone_number.length < 10) {
    return res.status(400).json({ error: 'Please provide a valid phone number' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpStore[phone_number] = { otp, expiresAt };

  res.json({
    message: 'OTP generated (demo mode - not sent via real SMS)',
    demo_otp: otp
  });
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { phone_number, otp } = req.body;

  const record = otpStore[phone_number];

  if (!record) {
    return res.status(400).json({ error: 'No OTP was requested for this number' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[phone_number];
    return res.status(400).json({ error: 'OTP expired, please request a new one' });
  }

  if (otp !== record.otp) {
    return res.status(400).json({ error: 'Incorrect OTP' });
  }

  delete otpStore[phone_number];

  try {
    let { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phone_number)
      .single();

    let user = existingUser;

    if (!existingUser) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ phone_number }])
        .select()
        .single();

      if (insertError) throw insertError;
      user = newUser;
    }

    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});