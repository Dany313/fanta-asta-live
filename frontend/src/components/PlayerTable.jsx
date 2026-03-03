import React from 'react';
import Button from './Button'; // Importiamo il nostro nuovo bottone!

export default function PlayerTable({ players, onPlayerClick, buttonText, buttonVariant }) {
  
  if (!players || players.length === 0) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>Nessun giocatore da mostrare.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>R</th>
          <th>Nome</th>
          <th>Squadra</th>
          <th>Qt.A</th>
          <th>Azione</th>
        </tr>
      </thead>
      <tbody>
        {players.map((player) => (
          <tr key={player.id}>
            <td><strong>{player.role}</strong></td>
            <td>{player.name}</td>
            <td>{player.club}</td>
            <td>{player.current_price}</td>
            <td>
              {/* Usiamo il componente Button creato prima! */}
              <Button 
                variant={buttonVariant} 
                onClick={() => onPlayerClick(player)}
              >
                {buttonText}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}