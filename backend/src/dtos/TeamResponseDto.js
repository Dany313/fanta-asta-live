class TeamResponseDto {
  constructor(teamEntity) {
    this.id = teamEntity.id;
    this.name = teamEntity.name;
    this.remainingBudget = teamEntity.remainingBudget;
    this.maxPossibleBid = teamEntity.maxPossibleBid;
    // NON includiamo inviteToken qui per sicurezza
  }
}

module.exports = TeamResponseDto;