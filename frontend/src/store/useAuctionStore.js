import { create } from 'zustand';

export const useAuctionStore = create((set) => ({
  activeAuction: null,
  isSessionActive: false,
  isInitializing: true,
  
  // Azioni chiamate dai WebSockets
  startAuction: (data) => set({ activeAuction: data }),
  
  updateBid: (update) => set((state) => ({
    activeAuction: state.activeAuction ? {
      ...state.activeAuction,
      highestBid: update.highestBid,
      highestBidderName: update.highestBidderName,
      highestBidderId: update.highestBidderId,
      history: update.history
    } : null
  })),
  clearAuction: () => set({ activeAuction: null }),
  setSessionActive: (isActive) => set({ isSessionActive: isActive }),
  setInitializing: (isInit) => set({ isInitializing: isInit })
}));