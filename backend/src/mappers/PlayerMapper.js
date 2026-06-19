const Player = require('../entities/Player');

class PlayerMapper {
  static toEntity(dbRow) {
    return new Player(dbRow);
  }
}

module.exports = PlayerMapper;