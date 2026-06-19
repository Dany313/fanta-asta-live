// Import connessione al DB
const db = require('../config/db');


class TeamRepository {

    async findAllByLeagueID(leagueId) {
        const query = `SELECT * FROM teams WHERE league_id = $1 ORDER BY name ASC`;
        const result = await db.query(query, [leagueId]);
        return result;
    }

    async findById(teamId) {
        const query = `SELECT * FROM teams WHERE id = $1`;
        const result = await db.query(query, [teamId]);
        return result;
    }

    async update(teamId, data) {
        const updates = [];
        const values = [];
        let index = 1;

        if (data.name !== undefined) {
            updates.push(`name = $${index++}`);
            values.push(data.name);
        }

        if (data.remainingBudget !== undefined) {
            updates.push(`remaining_budget = $${index++}`);
            values.push(data.remainingBudget);
        }
        
        if (data.maxPossibleBid !== undefined) {
            updates.push(`max_possible_bid = $${index++}`);
            values.push(data.maxPossibleBid);
        }

        if (updates.length === 0) return await this.findById(teamId); // Nessun aggiornamento richiesto

        values.push(teamId);
        const query = `UPDATE teams SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;
        return await db.query(query, values);
    }

    async delete(teamId) {
        const query = `DELETE FROM teams WHERE id = $1`;
        const result = await db.query(query, [teamId]);
        return result;
    }

    async findByToken(token) {
        const query = `SELECT id, name, league_id FROM teams WHERE invite_token = $1`;
        const result = await db.query(query, [token]);
        return result;
    }

    async create(leagueId, teamName) {
        const query = `INSERT INTO teams (name, league_id) VALUES ($1, $2) RETURNING *`;
        const result = await db.query(query, [teamName, leagueId]);
        return result;
    }

}

// Esportiamo un'istanza singola (Singleton pattern)
module.exports = new TeamRepository();