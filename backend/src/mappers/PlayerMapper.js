const Player = require('../entity/Player');

class PlayerMapper {
  static toEntity(dbRow) {
    return new Player(dbRow);
  }
}

module.exports = PlayerMapper;