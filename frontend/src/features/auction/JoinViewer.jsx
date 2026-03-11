import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function JoinViewer() {
  const { token } = useParams(); // Prende il token dall'URL
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/teams/verify/${token}`);
        
        if (response.data.success) {
          // 🌟 MAGIA: Salviamo il token e l'ID della squadra nel localStorage!
          localStorage.setItem('viewerToken', response.data.token);
          localStorage.setItem('viewerTeamId', response.data.team.id);
          localStorage.setItem('viewerTeamName', response.data.team.name);
          localStorage.setItem('teamData', JSON.stringify(response.data.team)); // 🌟 IMPORTANTE
          
          // Entriamo nel tabellone!
          navigate('/viewer');
        }
      } catch (err) {
        setError('Link di invito non valido o scaduto.');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token, navigate]);

  if (error) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
        <h1 style={{ color: '#ff4757' }}>Accesso Negato</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h2>Verifica del link di invito in corso... ⏳</h2>
    </div>
  );
}