const db = require('../config/db');

const getRostersQuery = `
      SELECT r.team_id, p.id as player_id, p.name, p.role, r.purchase_price
      FROM rosters r JOIN players p ON r.player_id = p.id WHERE r.team_id = $1
    `;

exports.getRosters = async (req, res) => {
  try {
    const { TeamId } = req.params;
    console.log('TeamId ricevuto:', TeamId); // Debug: verifica che TeamId sia corretto
    const result = await db.query(getRostersQuery, [TeamId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};