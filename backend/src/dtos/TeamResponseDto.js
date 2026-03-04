class TeamResponseDto {
  constructor(teamEntity) {
    this.id = teamEntity.id;
    this.name = teamEntity.name;
    this.remainingBudget = teamEntity.remainingBudget;
    this.maxPossibleBid = teamEntity.maxPossibleBid;
    this.inviteToken = teamEntity.inviteToken; // 🌟 IMPORTANTE: serve per il link di invito!
  }
}

module.exports = TeamResponseDto;