const db = require('../config/db');
const queries = require('../queries');

exports.getRosters = async (req, res) => {
  try {
    const result = await db.query(queries.getRostersQuery);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};