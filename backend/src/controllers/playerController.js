const db = require('../config/db');
const queries = require('../queries');

exports.getPlayers = async (req, res) => {
  try {
    const result = await db.query(queries.getPlayersQuery);
    res.json(result.rows);
  } catch (error) {
    console.error("Errore getPlayers:", error);
    res.status(500).json({ error: 'Errore interno' });
  }
};