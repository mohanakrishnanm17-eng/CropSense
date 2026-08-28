const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});