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

// Multer stores the uploaded file in memory temporarily so we can forward it
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

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

// Receives a leaf photo from the frontend, forwards it to the ML service, returns the prediction
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});