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