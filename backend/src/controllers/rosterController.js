// backend/src/controllers/rosterController.js
const rosterService = require('../services/rosterService');

exports.getRostersByTeamId = async (req, res) => {
  try {
    const { teamId } = req.params;
    const result = await rosterService.get_rosters_by_team_id(teamId);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero del roster del team' });
  }
};

exports.getRostersByLeagueId = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const result = await rosterService.get_rosters_by_league_id(leagueId);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante il recupero del roster della lega' });
  }
};

exports.updateRoster = async (req, res) => {
  try {
    const { teamId, playerId, purchasePrice } = req.body;
    const result = await rosterService.player_cost_update(teamId, playerId, purchasePrice);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message }); // 400 Bad Request per errori di logica (es. Budget)
  }
};

exports.addToRoster = async (req, res) => {
  try {
    const { teamId, playerId, purchasePrice } = req.body;
    const result = await rosterService.assign_player_to_team(teamId, playerId, purchasePrice);
    res.status(201).json(result); 
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteFromRoster = async (req, res) => {
  try {
    const { teamId, playerId } = req.body; // Sarebbe meglio usare req.params per le DELETE, ma manteniamo la tua struttura
    const result = await rosterService.delete_player_from_team(teamId, playerId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};