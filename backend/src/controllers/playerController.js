const db = require('../config/db');
const PlayerMapper = require('../mappers/PlayerMapper');

exports.getPlayers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.* FROM players p
      WHERE p.is_active = true 
      AND p.id NOT IN (SELECT player_id FROM rosters)
      ORDER BY p.fvm DESC, p.name ASC
    `);
    const players = result.rows.map(PlayerMapper.toEntity);
    res.json(players);
  } catch (error) {
    console.error("Errore getPlayers:", error);
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.getPlayersForAuction = async (req, res) => {
  try {
    const { LeagueId } = req.params;
    const result = await db.query(`
        SELECT p.id, p.name, p.role, p.club, p.current_price  
        FROM players p 
        WHERE p.id NOT IN (
        SELECT r.player_id  
        FROM rosters r 
        JOIN teams t ON t.id = r.team_id 
        JOIN leagues l ON l.id = t.league_id 
        WHERE l.id = ${LeagueId}
      )
    `);
    const players = result.rows.map(PlayerMapper.toEntity);
    res.json(players);
  } catch (error) {
    console.error("Errore getPlayers:", error);
    res.status(500).json({ error: 'Errore interno' });
  }
};