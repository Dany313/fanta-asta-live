// Import connessione al DB
const db = require('../config/db');

class LeagueRepository {

    async create(leagueName) {
        const query = `INSERT INTO leagues (name) VALUES ($1) RETURNING id, name`;
        return await db.query(query, [leagueName]);
    }

    async update(leagueId, newName) {
        const query = `UPDATE leagues SET name = $1 WHERE id = $2 RETURNING *`;
        return await db.query(query, [newName, leagueId]);
    }

    async findAll() {
        const query = `SELECT * FROM leagues ORDER By id DESC`;
        return await db.query(query);
    }

    async findById(leagueId) {
        const query = `SELECT * FROM leagues WHERE id = $1`;
        return await db.query(query, [leagueId]);
    }

    async delete(leagueId){
        const query = `DELETE FROM leagues WHERE id = $1`;
        return await db.query(query, [leagueId]);
    }

}

module.exports = new LeagueRepository()