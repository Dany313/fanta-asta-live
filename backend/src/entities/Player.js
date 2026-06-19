class Player {
  constructor(dbRow) {
    this.id = dbRow.id;
    this.name = dbRow.name;
    this.role = dbRow.role;
    this.club = dbRow.club;
    // Conversione da snake_case (DB) a camelCase (JS)
    this.currentPrice = dbRow.current_price;
    this.initialPrice = dbRow.initial_price;
    this.priceDiff = dbRow.price_diff;
    this.fvm = dbRow.fvm;
    this.isActive = dbRow.is_active;
    
    // Gestione date
    this.createdAt = dbRow.created_at;
    this.updatedAt = dbRow.updated_at;
  }
}

module.exports = Player;