import { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Could not reach backend: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>CropSense</h1>
      <button onClick={checkBackend}>Check Backend Connection</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;