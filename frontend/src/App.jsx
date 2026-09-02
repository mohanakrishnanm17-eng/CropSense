import { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h1>CropSense</h1>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;