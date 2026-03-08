import { create } from 'zustand';

export const useAuctionStore = create((set) => ({
  activeAuction: null,
  
  // Azioni chiamate dai WebSockets
  startAuction: (data) => set({ activeAuction: data }),
  
  updateBid: (update) => set((state) => ({
    activeAuction: state.activeAuction ? {
      ...state.activeAuction,
      highestBid: update.highestBid,
      highestBidderName: update.highestBidderName,
      history: update.history
    } : null
  })),
  
  clearAuction: () => set({ activeAuction: null }),
}));