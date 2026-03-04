class BidDto {
  constructor(teamId, teamName, amount) {
    this.teamId = parseInt(teamId);
    this.teamName = teamName;
    this.amount = parseInt(amount);
    this.timestamp = new Date();
  }
}

module.exports = BidDto;