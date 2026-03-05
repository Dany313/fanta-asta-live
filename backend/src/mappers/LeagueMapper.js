const League = require('../entity/League');

class LeagueMapper {
  static toEntity(dbRow) {
    if (!dbRow) return null;
    return new League(dbRow.id, dbRow.name);
  }
}

module.exports = LeagueMapper;
