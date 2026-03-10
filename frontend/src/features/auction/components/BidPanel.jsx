import React, { useState } from 'react';
import Button from '@mui/material/Button';
export default function BidPanel({ currentBid, onBid, disabled }) {
  const [customBid, setCustomBid] = useState('');

  const handleQuickBid = (increment) => {
    onBid(null,currentBid + increment);
  };

  const handleCustomBid = (e) => {
    e.preventDefault();
    const val = parseInt(customBid);
    if (val > currentBid) {
      onBid(null,val);
      setCustomBid('');
    }
  };

  return (

    <div style={{ border: '2px solid rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', marginBottom: '20px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
        <Button variant="contained" color="success" onClick={() => handleQuickBid(1)} disabled={disabled}>
          +1
        </Button>
        <Button variant="contained" color="success" onClick={() => handleQuickBid(5)} disabled={disabled}>
          +5
        </Button>
        <Button variant="contained" color="success" onClick={() => handleQuickBid(10)} disabled={disabled}>
          +10
        </Button>
      </div>

      <form onSubmit={handleCustomBid} style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
        <input
          type="number"
          placeholder="Offerta libera..."
          value={customBid}
          onChange={(e) => setCustomBid(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '120px' }}
          disabled={disabled}
        />
        <Button variant="contained" color="primary" type="submit" disabled={disabled}>
          Invia
        </Button>
      </form>
    </div>
  );
}