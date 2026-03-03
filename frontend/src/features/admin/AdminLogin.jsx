import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // useNavigate è un hook di React Router per cambiare pagina via codice
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita che la pagina si ricarichi al submit del form
    setError('');

    try {
      // Inviamo i dati al nostro "buttafuori" su Node.js
      const response = await axios.post('http://localhost:3000/api/login', {
        username,
        password
      });

      if (response.data.success) {
        // 🌟 MAGIA: Salviamo il token (braccialetto VIP) nella memoria del browser!
        localStorage.setItem('adminToken', response.data.token);
        
        // Lo mandiamo dritto alla plancia di comando
        navigate('/admin');
      }
    } catch (err) {
      // Se il server risponde con errore 401, mostriamo il messaggio
      setError('Credenziali non valide. Riprova!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f2f6' }}>
      <form onSubmit={handleLogin} style={{ 
        backgroundColor: 'white', padding: '40px', borderRadius: '10px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px', display: 'flex', flexDirection: 'column', gap: '15px' 
      }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#2f3542' }}>🔒 Login Admin</h2>

        {error && <div style={{ color: 'white', backgroundColor: '#ff4757', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>{error}</div>}

        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
          required
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
          required
        />

        <button type="submit" style={{ 
          backgroundColor: '#2ed573', color: 'white', padding: '12px', 
          fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px'
        }}>
          Accedi
        </button>
      </form>
    </div>
  );
}