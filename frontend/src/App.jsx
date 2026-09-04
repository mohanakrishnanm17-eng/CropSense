import { useState } from 'react';
import './App.css';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const handleSendOtp = async () => {
    setAuthError(null);
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

      setDemoOtp(data.demo_otp);
      setOtpSent(true);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleVerifyOtp = async () => {
    setAuthError(null);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed');

      setUser(data.user);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Prediction request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByQuery = async (queryString) => {
    setWeatherLoading(true);
    setWeatherError(null);
    setWeather(null);

    try {
      const response = await fetch(`http://localhost:5000/api/weather?${queryString}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather');
      }

      setWeather(data);
    } catch (err) {
      setWeatherError(err.message);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleCheckWeather = () => {
    if (!city) return;
    fetchWeatherByQuery(`city=${encodeURIComponent(city)}`);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setWeatherError('Location detection is not supported on this browser.');
      return;
    }

    setWeatherLoading(true);
    setWeatherError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByQuery(`lat=${latitude}&lon=${longitude}`);
      },
      (err) => {
        setWeatherLoading(false);
        setWeatherError('Could not detect your location. Please allow location access or enter your city manually.');
      }
    );
  };

  const alertColor = (level) => {
    if (level === 'high') return '#ff4d4d';
    if (level === 'medium') return 'orange';
    return 'green';
  };

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <h1>CropSense</h1>
        <h3>Farmer Login</h3>

        {!otpSent ? (
          <>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{ padding: '10px', width: '80%', marginBottom: '10px' }}
            />
            <br />
            <button onClick={handleSendOtp}>Send OTP</button>
          </>
        ) : (
          <>
            <p style={{ color: 'orange', fontSize: '14px' }}>
              Demo mode: your OTP is <strong>{demoOtp}</strong> (in production, this would be sent via SMS)
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ padding: '10px', width: '80%', marginBottom: '10px' }}
            />
            <br />
            <button onClick={handleVerifyOtp}>Verify & Login</button>
          </>
        )}

        {authError && <p style={{ color: 'red', marginTop: '10px' }}>{authError}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h1>CropSense</h1>
      <p style={{ color: 'gray' }}>Logged in as {user.phone_number}</p>

      <h3>Leaf Disease Photo Check</h3>

      <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: '20px' }} />

      {preview && (
        <div style={{ marginBottom: '20px' }}>
          <img src={preview} alt="Selected leaf" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
        </div>
      )}

      <button onClick={handleUpload} disabled={!selectedFile || loading}>
        {loading ? 'Analyzing...' : 'Check for Disease'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '20px' }}>Error: {error}</p>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          {result.valid === false ? (
            <p style={{ color: 'orange' }}>{result.message}</p>
          ) : (
            <>
              <h3>Result</h3>
              <p><strong>Disease:</strong> {result.disease}</p>
              <p><strong>Confidence:</strong> {result.confidence}%</p>

              {result.heatmap && (
                <div style={{ marginTop: '15px' }}>
                  <p style={{ fontWeight: 'bold' }}>AI Focus Area:</p>
                  <img src={result.heatmap} alt="AI heatmap" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                  <p style={{ fontSize: '12px', color: 'gray' }}>Red/yellow areas show where the AI detected disease patterns</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <hr style={{ margin: '40px 0' }} />

      <h3>Weather-Based Preventive Alerts</h3>

      <button onClick={handleUseMyLocation} disabled={weatherLoading} style={{ marginBottom: '15px' }}>
        {weatherLoading ? 'Detecting location...' : '📍 Use My Location'}
      </button>

      <p style={{ fontSize: '13px', color: 'gray' }}>or enter manually:</p>

      <input
        type="text"
        placeholder="Enter your city/village name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ padding: '10px', width: '80%', marginBottom: '10px' }}
      />
      <br />
      <button onClick={handleCheckWeather} disabled={!city || weatherLoading}>
        {weatherLoading ? 'Checking...' : 'Check Weather Risk'}
      </button>

      {weatherError && (
        <p style={{ color: 'red', marginTop: '15px' }}>{weatherError}</p>
      )}

      {weather && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'left' }}>
          <p><strong>{weather.city}</strong></p>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Conditions: {weather.conditions}</p>

          <div style={{ marginTop: '15px' }}>
            {weather.alerts.map((alert, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  borderLeft: `4px solid ${alertColor(alert.level)}`,
                  backgroundColor: '#f9f9f9',
                  color: '#333'
                }}
              >
                <strong style={{ textTransform: 'uppercase', color: alertColor(alert.level) }}>{alert.level} risk</strong>
                <p style={{ margin: '5px 0 0 0' }}>{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;