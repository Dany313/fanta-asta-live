const Team = require('../entity/Team');
const TeamResponseDto = require('../dtos/TeamResponseDto');

class TeamMapper {
  // Converte la riga grezza del DB (snake_case) in Entity (camelCase)
  static toEntity(dbRow) {
    return new Team(dbRow);
  }

  // Converte l'Entity in DTO (per inviarlo al frontend senza dati sensibili)
  static toDto(teamEntity) {
    return new TeamResponseDto(teamEntity);
  }
}

module.exports = TeamMapper;