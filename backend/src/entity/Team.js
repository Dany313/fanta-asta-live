class Team {
  constructor(dbRow) {
    this.id = dbRow.id;
    this.name = dbRow.name;
    this.remainingBudget = dbRow.remaining_budget;
    this.maxPossibleBid = dbRow.max_possible_bid;
    this.leagueId = dbRow.league_id;
    this.inviteToken = dbRow.invite_token;
  }
}

module.exports = Team;