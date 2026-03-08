import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuctionStore } from '../store/useAuctionStore';
import { useQueryClient } from '@tanstack/react-query';

export const socket = io('http://localhost:3000'); // Singleton

export const useAuctionSocket = () => {
  const startAuction = useAuctionStore((state) => state.startAuction);
  const updateBid = useAuctionStore((state) => state.updateBid);
  const clearAuction = useAuctionStore((state) => state.clearAuction);
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on('auction_started', startAuction);
    socket.on('auction_update', updateBid);
    
    socket.on('player_assigned', (response) => {
      if (response.success) {
        clearAuction();
        // 🚀 MAGIA TANSTACK QUERY: Invalidiamo la cache! 
        // React Query rifarà in automatico la fetch di giocatori e squadre in background
        queryClient.invalidateQueries({ queryKey: ['players'] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
      } else {
        alert("❌ Errore: " + response.message);
      }
    });

    socket.on('bid_error', (error) => alert(`⚠️ ${error.message}`));
    socket.on('assign_error', (error) => alert(`❌ ${error.message}`));

    socket.emit('sync_auction');

    return () => {
      socket.off('auction_started');
      socket.off('auction_update');
      socket.off('player_assigned');
      socket.off('bid_error');
      socket.off('assign_error');
    };
  }, [startAuction, updateBid, clearAuction, queryClient]);

  return socket; // Esportiamo il socket per emettere eventi dal componente
};