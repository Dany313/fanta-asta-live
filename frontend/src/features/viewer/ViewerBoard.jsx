import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

import PlayerCard from '../../components/PlayerCard';
import BidPanel from '../../components/BidPanel';
import AuctionLog from '../../components/AuctionLog';

const socket = io('http://localhost:3000');

export default function ViewerBoard() {
  const navigate = useNavigate();

  // --- STATO ---
  const [activeAuction, setActiveAuction] = useState(null);
  const [lastPurchase, setLastPurchase] = useState(null);
  const [myTeam, setMyTeam] = useState(null);

  useEffect(() => {
    // 1. Recuperiamo i dati della nostra squadra dal localStorage
    const teamDataString = localStorage.getItem('teamData');
    if (teamDataString) {
      setMyTeam(JSON.parse(teamDataString));
    } else {
      // Se non ci sono dati, rimandiamo alla home
      navigate('/');
      return;
    }

    // --- ASCOLTATORI SOCKET ---
    socket.on('auction_started', (data) => {
      setActiveAuction(data);
      setLastPurchase(null); // Nascondiamo l'ultimo acquisto
    });

    socket.on('auction_update', (update) => {
      setActiveAuction(prev => ({
        ...prev,
        highestBid: update.highestBid,
        highestBidderName: update.highestBidderName,
        history: update.history
      }));
    });

    socket.on('player_assigned', (response) => {
      if (response.success) {
        setLastPurchase(response.data);
        setActiveAuction(null);
      }
    });

    socket.on('bid_error', (error) => {
      alert(`⚠️ ${error.message}`);
    });

    // Ascoltiamo se l'Admin ci butta fuori!
    socket.on('force_logout', (data) => {
      const currentTeam = JSON.parse(localStorage.getItem('teamData'));
      if (currentTeam && currentTeam.id === data.teamId) {
        alert("L'Admin ti ha disconnesso.");
        localStorage.removeItem('viewerToken');
        localStorage.removeItem('teamData');
        navigate('/');
      }
    });

    return () => {
      socket.off('auction_started');
      socket.off('auction_update');
      socket.off('player_assigned');
      socket.off('bid_error');
      socket.off('force_logout');
    };
  }, [navigate]);

  // --- LOGICA ---
  const handleBid = (amount) => {
    if (!myTeam) return;
    
    // Inviamo la nostra puntata al server!
    socket.emit('place_bid', {
      teamId: myTeam.id,
      teamName: myTeam.name,
      amount: amount
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('viewerToken');
    localStorage.removeItem('teamData');
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* HEADER PARTECIPANTE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: '#2f3542', color: 'white', padding: '15px 20px', borderRadius: '10px' }}>
        <div>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.8 }}>Manager: {myTeam?.name}</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ backgroundColor: '#ff4757', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Esci
        </button>
      </div>

      {/* STATO: NESSUNA ASTA IN CORSO */}
      {!activeAuction && !lastPurchase && (
        <div style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '10px', color: '#747d8c', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h2>In attesa dell'Admin...</h2>
          <p>L'asta inizierà a breve. Tieni d'occhio questa schermata!</p>
        </div>
      )}

      {/* STATO: ASTA IN CORSO */}
      {activeAuction && (
        <PlayerCard 
          player={{...activeAuction.player, current_price: activeAuction.highestBid}} 
          title="🔨 ASTA IN CORSO"
          bgColor="#1e90ff" // Blu per i partecipanti
          textColor="white"
        >
          {/* Box Miglior Offerta Corrente */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#7bed9f' }}>
              👑 Offerta Attuale: {activeAuction.highestBid} crediti
            </h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
              {activeAuction.highestBidderName ? `di ${activeAuction.highestBidderName}` : 'Fai la prima offerta!'}
            </p>
          </div>

          {/* LA NOSTRA PALETTA PER LE OFFERTE */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', color: '#2f3542' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Fai la tua offerta:</h3>
            
            {/* Passiamo il prezzo attuale al BidPanel per fargli calcolare i +1, +5, ecc. */}
            <BidPanel 
              currentBid={activeAuction.highestBid} 
              onBid={handleBid}
              disabled={false} 
            />
          </div>

          {/* Log per trasparenza */}
          <AuctionLog history={activeAuction.history} />
          
        </PlayerCard>
      )}

      {/* STATO: ULTIMO ACQUISTO (Mostrato tra un'asta e l'altra) */}
      {lastPurchase && !activeAuction && (
        <PlayerCard 
          player={{
            name: lastPurchase.playerName,
            role: lastPurchase.playerRole || '?',
            club: 'Venduto',
            purchase_price: lastPurchase.price
          }}
          title="🎉 VENDUTO!"
          bgColor="#ffb142" // Arancione per i venduti
          textColor="#2c2c54"
        >
          <p style={{ fontSize: '20px', margin: '0' }}>Acquistato da:</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>
            {lastPurchase.teamId === myTeam?.id ? '✨ TE STESSO ✨' : "Una squadra avversaria"}
          </p>
        </PlayerCard>
      )}

    </div>
  );
}