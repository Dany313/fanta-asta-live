const db = require('../config/db');
const queries = require('../queries');

exports.getTeams = async (req, res) => {
  try {
    const result = await db.query(queries.getTeamsQuery);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await db.query(queries.verifyTokenQuery, [token]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Link non valido.' });
    res.json({ success: true, team: result.rows[0], token });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore interno' });
  }
};