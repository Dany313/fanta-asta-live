const leagueRepository = require('../repositories/leagueRepository');

class LeagueService {
    async createLeague(name) {
        return await leagueRepository.create(name);
    }

    async updateLeague(id, name) {
        return await leagueRepository.update(id, name);
    }

    async getLeagues() {
        return await leagueRepository.findAll();
    }

    async getLeagueById(id) {
        return await leagueRepository.findById(id);
    }

    async deleteLeague(id) {
        return await leagueRepository.delete(id);
    }
}

module.exports = new LeagueService();