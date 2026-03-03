const getPlayersQuery = `
      SELECT p.* FROM players p
      WHERE p.is_active = true 
      AND p.id NOT IN (SELECT player_id FROM rosters)
      ORDER BY p.fvm DESC, p.name ASC
    `;
const getRostersQuery = `
      SELECT r.team_id, p.id as player_id, p.name, p.role, r.purchase_price
      FROM rosters r JOIN players p ON r.player_id = p.id
    `;
const getTeamsQuery = `SELECT * FROM teams ORDER BY name ASC`;
const verifyTokenQuery = `SELECT id, name, owner_name FROM teams WHERE invite_token = $1`;

module.exports = {
  getPlayersQuery,
  getRostersQuery,
  getTeamsQuery,
  verifyTokenQuery
};