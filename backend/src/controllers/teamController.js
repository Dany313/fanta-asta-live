const db = require('../config/db');
const TeamMapper = require('../mappers/TeamMapper');

exports.getTeams = async (req, res) => {
  try {
    const { leagueId } = req.query;
    const result = await db.query(`SELECT * FROM teams WHERE league_id = $1 ORDER BY name ASC`, [leagueId]);
    const dtos = result.rows.map(row => TeamMapper.toDto(TeamMapper.toEntity(row)));
    res.json(dtos);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM teams WHERE id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Squadra non trovata' });
    const teamEntity = TeamMapper.toEntity(result.rows[0]);
    res.json(TeamMapper.toDto(teamEntity)); // Nascondiamo il token anche qui
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};


exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await db.query(`UPDATE teams SET name = $1 WHERE id = $2 RETURNING *`, [name, id]);
    const teamEntity = TeamMapper.toEntity(result.rows[0]);
    res.json(teamEntity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM teams WHERE id = $1`, [id]);
    res.json({ message: 'Squadra eliminata con successo' });
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await db.query(`SELECT id, name FROM teams WHERE invite_token = $1`, [token]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Link non valido.' });

    // Qui restituiamo l'entity completa (o quasi) perché è il login della squadra stessa
    const teamEntity = TeamMapper.toEntity(result.rows[0]);
    res.json({ success: true, team: teamEntity, token });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore interno' });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, leagueId } = req.body;
    const result = await db.query(`INSERT INTO teams (name, league_id) VALUES ($1, $2) RETURNING *`, [name, leagueId]);
    const teamEntity = TeamMapper.toEntity(result.rows[0]);
    res.status(201).json(teamEntity);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno', details: error.message });
  }
}