// Stato globale dell'asta (Singleton)
const activeAuction = {
  player: null,
  highestBid: 0,
  highestBidderId: null,
  highestBidderName: null,
  history: [],
  teamBudgets: {},
  maxPossibleBids: {}
};

// Funzione helper per resettare lo stato mantenendo il riferimento all'oggetto
const resetAuction = () => {
  activeAuction.player = null;
  activeAuction.highestBid = 0;
  activeAuction.highestBidderId = null;
  activeAuction.highestBidderName = null;
  activeAuction.history = [];
  activeAuction.teamBudgets = {};
  activeAuction.maxPossibleBids = {};
};

module.exports = {
  activeAuction,
  resetAuction
};