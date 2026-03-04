class AuctionStateDto {
  constructor(player, highestBid, highestBidderName, history) {
    this.player = player; // Può essere un Player Entity o un oggetto semplice
    this.highestBid = highestBid;
    this.highestBidderName = highestBidderName || "Nessuno";
    // Limitiamo la history agli ultimi 5 eventi per non appesantire il socket se l'asta è lunga
    this.history = history ? history.slice(0, 10) : [];
    this.status = player ? "ACTIVE" : "WAITING";
  }
}

module.exports = AuctionStateDto;