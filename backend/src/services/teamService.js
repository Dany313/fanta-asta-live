const teamRepository = require('../repositories/teamRepository');

class TeamService {
    async getTeamsByLeagueId(leagueId) {
        return await teamRepository.findAllByLeagueID(leagueId);
    }

    async getTeamById(id) {
        return await teamRepository.findById(id);
    }

    async updateTeam(id, name) {
        return await teamRepository.update(id, name);
    }

    async deleteTeam(id) {
        return await teamRepository.delete(id);
    }

    async verifyToken(token) {
        return await teamRepository.findByToken(token);
    }

    async createTeam(leagueId, name) {
        return await teamRepository.create(leagueId, name);
    }
}

module.exports = new TeamService();