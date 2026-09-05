import { useState } from 'react';
import './App.css';

const DISEASE_TRANSLATIONS = {
  'Pepper__bell___Bacterial_spot': { en: 'Bell Pepper - Bacterial Spot', ta: 'குடைமிளகாய் - பாக்டீரியா புள்ளி நோய்' },
  'Pepper__bell___healthy': { en: 'Bell Pepper - Healthy', ta: 'குடைமிளகாய் - ஆரோக்கியமானது' },
  'Potato___Early_blight': { en: 'Potato - Early Blight', ta: 'உருளைக்கிழங்கு - முன்கூட்டிய கருகல் நோய்' },
  'Potato___healthy': { en: 'Potato - Healthy', ta: 'உருளைக்கிழங்கு - ஆரோக்கியமானது' },
  'Potato___Late_blight': { en: 'Potato - Late Blight', ta: 'உருளைக்கிழங்கு - பிந்தைய கருகல் நோய்' },
  'Tomato_Bacterial_spot': { en: 'Tomato - Bacterial Spot', ta: 'தக்காளி - பாக்டீரியா புள்ளி நோய்' },
  'Tomato_Early_blight': { en: 'Tomato - Early Blight', ta: 'தக்காளி - முன்கூட்டிய கருகல் நோய்' },
  'Tomato_healthy': { en: 'Tomato - Healthy', ta: 'தக்காளி - ஆரோக்கியமானது' },
  'Tomato_Late_blight': { en: 'Tomato - Late Blight', ta: 'தக்காளி - பிந்தைய கருகல் நோய்' },
  'Tomato_Leaf_Mold': { en: 'Tomato - Leaf Mold', ta: 'தக்காளி - இலை பூஞ்சை நோய்' },
  'Tomato_Septoria_leaf_spot': { en: 'Tomato - Septoria Leaf Spot', ta: 'தக்காளி - செப்டோரியா இலை புள்ளி நோய்' },
  'Tomato_Spider_mites_Two_spotted_spider_mite': { en: 'Tomato - Spider Mite Infestation', ta: 'தக்காளி - சிலந்தி பூச்சி தாக்குதல்' },
  'Tomato__Target_Spot': { en: 'Tomato - Target Spot', ta: 'தக்காளி - இலக்கு புள்ளி நோய்' },
  'Tomato__Tomato_mosaic_virus': { en: 'Tomato - Mosaic Virus', ta: 'தக்காளி - மொசைக் வைரஸ்' },
  'Tomato__Tomato_YellowLeaf__Curl_Virus': { en: 'Tomato - Yellow Leaf Curl Virus', ta: 'தக்காளி - மஞ்சள் இலை சுருள் வைரஸ்' }
};

const ALERT_TRANSLATIONS = {
  fungal_risk: {
    en: 'High humidity and warm temperature detected. Conditions are favorable for fungal diseases like blight and leaf mold. Consider preventive fungicide spray and ensure good air circulation.',
    ta: 'அதிக ஈரப்பதம் மற்றும் வெப்பநிலை கண்டறியப்பட்டுள்ளது. இது இலைக்கருகல் மற்றும் பூஞ்சை நோய்களுக்கு ஏற்ற சூழ்நிலை. தடுப்பு பூஞ்சைக்கொல்லி தெளிக்கவும், நல்ல காற்றோட்டத்தை உறுதி செய்யவும்.'
  },
  rain_risk: {
    en: 'Rainy conditions detected. Wet leaves increase risk of bacterial spot and blight spread. Avoid overhead irrigation and monitor plants closely after rain stops.',
    ta: 'மழை பெய்யும் சூழ்நிலை கண்டறியப்பட்டுள்ளது. ஈரமான இலைகள் பாக்டீரியா புள்ளி மற்றும் கருகல் நோய் பரவும் அபாயத்தை அதிகரிக்கும். மேலிருந்து நீர் பாய்ச்சுவதைத் தவிர்க்கவும், மழை நின்ற பிறகு பயிர்களை உன்னிப்பாக கவனிக்கவும்.'
  },
  heat_stress: {
    en: 'High temperature detected. Heat stress can weaken plants and increase susceptibility to pests like spider mites. Ensure adequate watering.',
    ta: 'அதிக வெப்பநிலை கண்டறியப்பட்டுள்ளது. வெப்ப அழுத்தம் பயிர்களை பலவீனப்படுத்தி, சிலந்தி பூச்சிகள் போன்ற பூச்சிகளுக்கு எளிதில் பாதிக்கப்படும் நிலையை உருவாக்கும். போதுமான நீர் பாசனத்தை உறுதி செய்யவும்.'
  },
  low_risk: {
    en: 'Current weather conditions show low disease risk. Continue regular monitoring.',
    ta: 'தற்போதைய வானிலை நிலைமைகள் குறைந்த நோய் அபாயத்தைக் காட்டுகின்றன. வழக்கமான கண்காணிப்பைத் தொடரவும்.'
  }
};

const UI_TEXT = {
  en: {
    login: 'Farmer Login',
    sendOtp: 'Send OTP',
    verifyLogin: 'Verify & Login',
    demoNote: (otp) => `Demo mode: your OTP is ${otp} (in production, this would be sent via SMS)`,
    loggedInAs: (phone) => `Logged in as ${phone}`,
    leafCheckTitle: 'Leaf Disease Photo Check',
    checkDisease: 'Check for Disease',
    analyzing: 'Analyzing...',
    result: 'Result',
    disease: 'Disease',
    confidence: 'Confidence',
    aiFocus: 'AI Focus Area:',
    aiFocusNote: 'Red/yellow areas show where the AI detected disease patterns',
    weatherTitle: 'Weather-Based Preventive Alerts',
    useLocation: '📍 Use My Location',
    detecting: 'Detecting location...',
    enterManually: 'or enter manually:',
    cityPlaceholder: 'Enter your city/village name',
    checkWeather: 'Check Weather Risk',
    checking: 'Checking...',
    temperature: 'Temperature',
    humidity: 'Humidity',
    conditions: 'Conditions',
    high: 'HIGH RISK',
    medium: 'MEDIUM RISK',
    low: 'LOW RISK'
  },
  ta: {
    login: 'விவசாயி உள்நுழைவு',
    sendOtp: 'OTP அனுப்பு',
    verifyLogin: 'சரிபார்த்து உள்நுழையவும்',
    demoNote: (otp) => `டெமோ முறை: உங்கள் OTP ${otp} (உண்மையான பயன்பாட்டில் இது SMS மூலம் அனுப்பப்படும்)`,
    loggedInAs: (phone) => `${phone} ஆக உள்நுழைந்துள்ளீர்கள்`,
    leafCheckTitle: 'இலை நோய் புகைப்பட சோதனை',
    checkDisease: 'நோயைச் சரிபார்க்கவும்',
    analyzing: 'பகுப்பாய்வு செய்யப்படுகிறது...',
    result: 'முடிவு',
    disease: 'நோய்',
    confidence: 'நம்பகத்தன்மை',
    aiFocus: 'AI கவனம் செலுத்திய பகுதி:',
    aiFocusNote: 'சிவப்பு/மஞ்சள் பகுதிகள் AI நோய் தடயங்களை கண்டறிந்த இடங்களைக் காட்டுகின்றன',
    weatherTitle: 'வானிலை அடிப்படையிலான தடுப்பு எச்சரிக்கைகள்',
    useLocation: '📍 எனது இருப்பிடத்தைப் பயன்படுத்து',
    detecting: 'இருப்பிடம் கண்டறியப்படுகிறது...',
    enterManually: 'அல்லது கைமுறையாக உள்ளிடவும்:',
    cityPlaceholder: 'உங்கள் ஊர்/கிராமத்தின் பெயரை உள்ளிடவும்',
    checkWeather: 'வானிலை அபாயத்தைச் சரிபார்க்கவும்',
    checking: 'சரிபார்க்கப்படுகிறது...',
    temperature: 'வெப்பநிலை',
    humidity: 'ஈரப்பதம்',
    conditions: 'நிலைமைகள்',
    high: 'அதிக ஆபத்து',
    medium: 'நடுத்தர ஆபத்து',
    low: 'குறைந்த ஆபத்து'
  }
};

function App() {
  const [lang, setLang] = useState('en');
  const t = UI_TEXT[lang];

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

  const alertLevelLabel = (level) => {
    if (level === 'high') return t.high;
    if (level === 'medium') return t.medium;
    return t.low;
  };

  const alertMessage = (alert) => {
    const translation = ALERT_TRANSLATIONS[alert.code];
    return translation ? translation[lang] : alert.message;
  };

  const diseaseLabel = (diseaseCode) => {
    const translation = DISEASE_TRANSLATIONS[diseaseCode];
    return translation ? translation[lang] : diseaseCode;
  };

  const LanguageToggle = () => (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={() => setLang('en')}
        style={{ fontWeight: lang === 'en' ? 'bold' : 'normal', marginRight: '10px' }}
      >
        English
      </button>
      <button
        onClick={() => setLang('ta')}
        style={{ fontWeight: lang === 'ta' ? 'bold' : 'normal' }}
      >
        தமிழ்
      </button>
    </div>
  );

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <LanguageToggle />
        <h1>CropSense</h1>
        <h3>{t.login}</h3>

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
            <button onClick={handleSendOtp}>{t.sendOtp}</button>
          </>
        ) : (
          <>
            <p style={{ color: 'orange', fontSize: '14px' }}>
              {t.demoNote(demoOtp)}
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ padding: '10px', width: '80%', marginBottom: '10px' }}
            />
            <br />
            <button onClick={handleVerifyOtp}>{t.verifyLogin}</button>
          </>
        )}

        {authError && <p style={{ color: 'red', marginTop: '10px' }}>{authError}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <LanguageToggle />
      <h1>CropSense</h1>
      <p style={{ color: 'gray' }}>{t.loggedInAs(user.phone_number)}</p>

      <h3>{t.leafCheckTitle}</h3>

      <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: '20px' }} />

      {preview && (
        <div style={{ marginBottom: '20px' }}>
          <img src={preview} alt="Selected leaf" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
        </div>
      )}

      <button onClick={handleUpload} disabled={!selectedFile || loading}>
        {loading ? t.analyzing : t.checkDisease}
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
              <h3>{t.result}</h3>
              <p><strong>{t.disease}:</strong> {diseaseLabel(result.disease)}</p>
              <p><strong>{t.confidence}:</strong> {result.confidence}%</p>

              {result.heatmap && (
                <div style={{ marginTop: '15px' }}>
                  <p style={{ fontWeight: 'bold' }}>{t.aiFocus}</p>
                  <img src={result.heatmap} alt="AI heatmap" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                  <p style={{ fontSize: '12px', color: 'gray' }}>{t.aiFocusNote}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <hr style={{ margin: '40px 0' }} />

      <h3>{t.weatherTitle}</h3>

      <button onClick={handleUseMyLocation} disabled={weatherLoading} style={{ marginBottom: '15px' }}>
        {weatherLoading ? t.detecting : t.useLocation}
      </button>

      <p style={{ fontSize: '13px', color: 'gray' }}>{t.enterManually}</p>

      <input
        type="text"
        placeholder={t.cityPlaceholder}
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ padding: '10px', width: '80%', marginBottom: '10px' }}
      />
      <br />
      <button onClick={handleCheckWeather} disabled={!city || weatherLoading}>
        {weatherLoading ? t.checking : t.checkWeather}
      </button>

      {weatherError && (
        <p style={{ color: 'red', marginTop: '15px' }}>{weatherError}</p>
      )}

      {weather && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'left' }}>
          <p><strong>{weather.city}</strong></p>
          <p>{t.temperature}: {weather.temperature}°C</p>
          <p>{t.humidity}: {weather.humidity}%</p>
          <p>{t.conditions}: {weather.conditions}</p>

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
                <strong style={{ textTransform: 'uppercase', color: alertColor(alert.level) }}>
                  {alertLevelLabel(alert.level)}
                </strong>
                <p style={{ margin: '5px 0 0 0' }}>{alertMessage(alert)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
