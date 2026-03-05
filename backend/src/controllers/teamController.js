const db = require('../config/db');
const queries = require('../queries');
const TeamMapper = require('../mappers/TeamMapper');

exports.getTeams = async (req, res) => {
  try {
    const { leagueId } = req.query;
    let result;
    if (leagueId) {
      result = await db.query(queries.getTeamsByLeagueQuery, [leagueId]);
    } else {
      result = await db.query(queries.getTeamsQuery);
    }
    // 1. Convertiamo le righe DB in Entities
    // 2. Convertiamo le Entities in DTOs (nascondendo il token)
    const dtos = result.rows.map(row => TeamMapper.toDto(TeamMapper.toEntity(row)));
    res.json(dtos);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await db.query(queries.updateTeamQuery, [name, id]);
    const teamEntity = TeamMapper.toEntity(result.rows[0]);
    res.json(teamEntity);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(queries.deleteTeamQuery, [id]);
    res.json({ message: 'Squadra eliminata con successo' });
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await db.query(queries.verifyTokenQuery, [token]);
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
    const result = await db.query(queries.createTeamQuery, [name, leagueId]);
    const teamEntity = TeamMapper.toEntity(result.rows[0]);
    res.status(201).json(teamEntity);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno', details: error.message });
  }
}