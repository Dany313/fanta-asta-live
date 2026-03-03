import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  // useLocation ci restituisce un oggetto con il percorso attuale (es. "/admin" o "/viewer")
  const location = useLocation();

  // Una piccola funzione per capire se un link è attivo e cambiargli colore
  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? '#7bed9f' : 'white', // Verde acceso se attivo, bianco altrimenti
      textDecoration: 'none',
      fontWeight: isActive ? 'bold' : 'normal',
      padding: '5px 10px',
      borderRadius: '5px',
      backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
      transition: 'all 0.3s ease'
    };
  };

  return (
    <nav style={{ 
      backgroundColor: '#2f3542', 
      color: 'white', 
      padding: '15px 30px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      {/* LOGO O TITOLO */}
      <div style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
        ⚽ <span style={{ color: '#7bed9f' }}>Fanta</span>Asta Live
      </div>

      {/* MENU DI NAVIGAZIONE */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/" style={getLinkStyle('/')}>🏠 Home</Link>
        <Link to="/admin" style={getLinkStyle('/admin')}>👨‍💻 Area Admin</Link>
        <Link to="/viewer" style={getLinkStyle('/viewer')}>📺 Tabellone</Link>
      </div>
    </nav>
  );
}