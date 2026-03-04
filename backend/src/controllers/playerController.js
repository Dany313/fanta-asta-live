const db = require('../config/db');
const queries = require('../queries');
const PlayerMapper = require('../mappers/PlayerMapper');

exports.getPlayers = async (req, res) => {
  try {
    const result = await db.query(queries.getPlayersQuery);
    const players = result.rows.map(PlayerMapper.toEntity);
    res.json(players);
  } catch (error) {
    console.error("Errore getPlayers:", error);
    res.status(500).json({ error: 'Errore interno' });
  }
};