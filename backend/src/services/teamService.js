const teamRepository = require('../repositories/teamRepository');

class TeamService {
    async getTeamsByLeagueId(leagueId) {
        return await teamRepository.findAllByLeagueID(leagueId);
    }

    async getTeamById(id) {
        return await teamRepository.findById(id);
    }

    async updateTeam(id, data) {
        if (data.remainingBudget !== undefined) {
            // Calcola il nuovo max_possible_bid in base a quanto era bloccato
            const teamResult = await teamRepository.findById(id);
            if (teamResult.rows.length === 0) throw new Error("Squadra non trovata");
            
            const team = teamResult.rows[0];
            const lockedCredits = team.remaining_budget - (team.max_possible_bid || 0);
            data.maxPossibleBid = data.remainingBudget - lockedCredits;
        }
        
        return await teamRepository.update(id, data);
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