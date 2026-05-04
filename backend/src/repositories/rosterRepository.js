// backend/src/repositories/rosterRepository.js
const pool = require('../config/db');

class RosterRepository {
  // Metodi di lettura base (che usavi nel controller)
  async findAllByTeamId(teamId, dbClient = pool) {
    const { rows } = await dbClient.query('SELECT * FROM rosters WHERE team_id = $1', [teamId]);
    return { rows }; // Manteniamo la struttura per non rompere il tuo controller
  }

  async findAllByLeagueId(leagueId, dbClient = pool) {
    const query = `
      SELECT r.* FROM rosters r 
      JOIN teams t ON r.team_id = t.id 
      WHERE t.league_id = $1
    `;
    const { rows } = await dbClient.query(query, [leagueId]);
    return { rows };
  }

  // --- Metodi usati dal Service per le regole di business ---

  async getTeamInfo(teamId, dbClient = pool) {
    const { rows } = await dbClient.query(`SELECT league_id, remaining_budget FROM teams WHERE id = $1`, [teamId]);
    return rows.length > 0 ? rows[0] : null;
  }

  async checkPlayerInLeague(playerId, leagueId, dbClient = pool) {
    const query = `SELECT r.id FROM rosters r JOIN teams t ON r.team_id = t.id WHERE r.player_id = $1 AND t.league_id = $2`;
    const { rows } = await dbClient.query(query, [playerId, leagueId]);
    return rows.length > 0;
  }

  async getPlayerRole(playerId, dbClient = pool) {
    const { rows } = await dbClient.query(`SELECT role FROM players WHERE id = $1`, [playerId]);
    return rows.length > 0 ? rows[0].role : null;
  }

  async countPlayersByRole(teamId, role, dbClient = pool) {
    const query = `SELECT COUNT(p.id) FROM rosters r JOIN players p ON r.player_id = p.id WHERE r.team_id = $1 AND p.role = $2`;
    const { rows } = await dbClient.query(query, [teamId, role]);
    return parseInt(rows[0].count, 10);
  }

  async getRosterEntry(teamId, playerId, dbClient = pool) {
    const { rows } = await dbClient.query(`SELECT purchase_price FROM rosters WHERE team_id = $1 AND player_id = $2`, [teamId, playerId]);
    return rows.length > 0 ? rows[0] : null;
  }

  // --- Metodi di scrittura (Transazioni) ---

  async addPlayerToRoster(teamId, playerId, amount, dbClient = pool) {
    const query = `INSERT INTO rosters (team_id, player_id, purchase_price) VALUES ($1, $2, $3) RETURNING *`;
    const { rows } = await dbClient.query(query, [teamId, playerId, amount]);
    return rows[0];
  }

  async updateRosterPrice(teamId, playerId, amount, dbClient = pool) {
    const query = `UPDATE rosters SET purchase_price = $1 WHERE team_id = $2 AND player_id = $3 RETURNING *`;
    const { rows } = await dbClient.query(query, [amount, teamId, playerId]);
    return rows[0];
  }

  async deletePlayerFromRoster(teamId, playerId, dbClient = pool) {
    const query = `DELETE FROM rosters WHERE team_id = $1 AND player_id = $2 RETURNING *`;
    const { rows } = await dbClient.query(query, [teamId, playerId]);
    return rows[0];
  }

  async updateTeamBudget(teamId, newBudget, dbClient = pool) {
    await dbClient.query(`UPDATE teams SET remaining_budget = $1 WHERE id = $2`, [newBudget, teamId]);
  }
}

module.exports = new RosterRepository();