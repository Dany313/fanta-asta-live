import React from 'react';

export default function AuctionLog({ history }) {
  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '15px', 
      marginTop: '20px', border: '1px solid #e0e0e0', maxHeight: '200px', overflowY: 'auto' 
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#2f3542', fontSize: '14px', textTransform: 'uppercase' }}>
        📜 Cronologia Offerte
      </h4>
      {history.length === 0 && <p style={{ fontSize: '13px', color: '#a0a0a0' }}>In attesa della prima offerta...</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {history.map((log, index) => (
          <li key={index} style={{ 
            padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '14px',
            display: 'flex', justifyContent: 'space-between',
            color: index === 0 ? '#2ecc71' : '#2f3542', // La più recente è verde
            fontWeight: index === 0 ? 'bold' : 'normal'
          }}>
            <span>{log.teamName}</span>
            <span>{log.amount} FM <small style={{ color: '#999', fontWeight: 'normal' }}>({log.time})</small></span>
          </li>
        ))}
      </ul>
    </div>
  );
}