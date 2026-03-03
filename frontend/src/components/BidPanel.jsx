import React, { useState } from 'react';
import CustomButton from './CustomButton';

export default function BidPanel({ currentBid, onBid, disabled }) {
  const [customBid, setCustomBid] = useState('');

  const handleQuickBid = (increment) => {
    onBid(currentBid + increment);
  };

  const handleCustomBid = (e) => {
    e.preventDefault();
    const val = parseInt(customBid);
    if (val > currentBid) {
      onBid(val);
      setCustomBid('');
    }
  };

  return (
    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <CustomButton variant="success" onClick={() => handleQuickBid(1)} disabled={disabled}>+1</CustomButton>
        <CustomButton variant="success" onClick={() => handleQuickBid(5)} disabled={disabled}>+5</CustomButton>
        <CustomButton variant="success" onClick={() => handleQuickBid(10)} disabled={disabled}>+10</CustomButton>
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
        <CustomButton variant="primary" type="submit" disabled={disabled}>Invia</CustomButton>
      </form>
    </div>
  );
}