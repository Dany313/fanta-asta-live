const playerRepository = require('../repositories/playerRepository');

class PlayerService {
    async getAvailablePlayers() {
        return await playerRepository.findAllAvailable();
    }

    async getAvailablePlayersByLeagueId(leagueId) {
        return await playerRepository.findAllAvailableByLeagueId(leagueId);
    }
}

module.exports = new PlayerService();