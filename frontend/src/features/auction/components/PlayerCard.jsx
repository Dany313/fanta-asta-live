import React from 'react';

// Props:
// - player: l'oggetto col giocatore (nome, ruolo, ecc.)
// - title: la scritta in alto (es. "ALL'ASTA ORA" o "VENDUTO")
// - bgColor: il colore di sfondo della card
// - textColor: il colore del testo
// - children: tutto ciò che inseriremo "dentro" il tag (es. i bottoni dell'admin)
export default function PlayerCard({ 
  player, 
  title = "🔨 ALL'ASTA ORA", 
  bgColor = '#1e90ff', 
  textColor = 'white', 
  children 
}) {
  
  if (!player) return null;

  // I classici colori del Fantacalcio per i ruoli!
  const roleColors = {
    'P': '#f39c12', // Arancione/Giallo
    'D': '#2ecc71', // Verde
    'C': '#3498db', // Blu
    'A': '#e74c3c'  // Rosso
  };
  const badgeColor = roleColors[player.role] || '#2f3542';

  return (
    <div style={{ 
      width: '100%', maxWidth: '600px', padding: '30px', margin: '0 auto', textAlign: 'center',
      backgroundColor: bgColor, color: textColor, borderRadius: '15px', 
      boxShadow: `0 10px 25px rgba(0,0,0,0.15)`
    }}>
      <h3 style={{ margin: '0 0 20px 0', opacity: 0.9 }}>{title}</h3>
      
      {/* Badge del Ruolo */}
      <span style={{ 
        backgroundColor: badgeColor, color: 'white', padding: '8px 20px', 
        borderRadius: '20px', fontWeight: 'bold', fontSize: '20px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      }}>
        {player.role}
      </span>
      
      <h1 style={{ fontSize: '50px', margin: '20px 0 10px 0' }}>{player.name}</h1>
      <h2 style={{ margin: '0 0 30px 0', fontWeight: 'normal', opacity: '0.9' }}>{player.club}</h2>
      
      {/* Box Base d'Asta / Prezzo */}
      <div style={{ 
        backgroundColor: 'rgba(0,0,0,0.15)', padding: '15px 30px', 
        borderRadius: '10px', display: 'inline-block', 
        marginBottom: children ? '20px' : '0' 
      }}>
        <p style={{ margin: '0', fontSize: '16px', textTransform: 'uppercase' }}>
          {player.purchase_price ? 'Prezzo Finale' : 'Base Asta'}
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '35px', fontWeight: 'bold' }}>
          {player.purchase_price || player.current_price}
        </p>
      </div>

      {/* 🌟 MAGIA: Qui renderizziamo i "children" (i form dell'Admin o altri dettagli) */}
      {children && (
        <div style={{ 
          marginTop: '20px', paddingTop: '20px', 
          borderTop: `1px solid ${textColor === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` 
        }}>
          {children}
        </div>
      )}
    </div>
  );
}