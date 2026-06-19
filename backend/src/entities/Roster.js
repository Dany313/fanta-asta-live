class Roster {
  constructor(dbRow) {
    this.id = dbRow.id;
    this.teamId = dbRow.team_id;
    this.playerId = dbRow.player_id;
    this.purchasePrice = dbRow.purchase_price;
  }
}

module.exports = Roster;