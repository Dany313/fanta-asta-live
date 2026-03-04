class Team {
  constructor(dbRow) {
    this.id = dbRow.id;
    this.name = dbRow.name;
    this.remainingBudget = dbRow.remaining_budget;
    this.maxPossibleBid = dbRow.max_possible_bid;
    // Il token è sensibile, ma fa parte dell'entità database
    this.inviteToken = dbRow.invite_token;
  }
}

module.exports = Team;