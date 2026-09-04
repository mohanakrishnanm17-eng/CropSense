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

function getDiseaseRiskAlerts(weatherData) {
  const alerts = [];

  const humidity = weatherData.main.humidity;
  const temp = weatherData.main.temp;
  const description = weatherData.weather[0].main.toLowerCase();

  if (humidity > 80 && temp > 20 && temp < 32) {
    alerts.push({
      level: 'high',
      message: 'High humidity and warm temperature detected. Conditions are favorable for fungal diseases like blight and leaf mold. Consider preventive fungicide spray and ensure good air circulation.'
    });
  }

  if (description.includes('rain') || description.includes('drizzle') || description.includes('thunderstorm')) {
    alerts.push({
      level: 'medium',
      message: 'Rainy conditions detected. Wet leaves increase risk of bacterial spot and blight spread. Avoid overhead irrigation and monitor plants closely after rain stops.'
    });
  }

  if (temp > 35) {
    alerts.push({
      level: 'medium',
      message: 'High temperature detected. Heat stress can weaken plants and increase susceptibility to pests like spider mites. Ensure adequate watering.'
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      level: 'low',
      message: 'Current weather conditions show low disease risk. Continue regular monitoring.'
    });
  }

  return alerts;
}

app.get('/api/weather', async (req, res) => {
  const { city, lat, lon } = req.query;

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: 'City name or coordinates are required' });
  }

  try {
    const weatherUrl = (lat && lon)
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;

    const weatherResponse = await fetch(weatherUrl);

    const weatherData = await weatherResponse.json();

    if (weatherData.cod !== 200) {
      return res.status(400).json({ error: weatherData.message || 'Could not fetch weather for this location' });
    }

    const alerts = getDiseaseRiskAlerts(weatherData);

    res.json({
      city: weatherData.name,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
      conditions: weatherData.weather[0].description,
      alerts
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});