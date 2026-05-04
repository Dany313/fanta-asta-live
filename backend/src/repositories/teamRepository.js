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

    async update(teamId, newName) {
        const query = `UPDATE teams SET name = $1 WHERE id = $2 RETURNING *`;
        const result = await db.query(query, [newName, teamId]);
        return result;
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