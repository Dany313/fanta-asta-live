const e = require('cors');
const db = require('../config/db');
const { assign_player_to_team } = require('../services/teamService');



exports.getRostersByTeamId = async (req, res) => {
  try {
    const { teamId } = req.params;
    console.log('TeamId ricevuto:', teamId); // Debug: verifica che teamId sia corretto
    const result = await db.query(`
      SELECT r.team_id, p.id as player_id, p.name, p.role, r.purchase_price
      FROM rosters r JOIN players p ON r.player_id = p.id WHERE r.team_id = $1
    `, [teamId]);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.getRostersByLeagueId = async (req, res) => {
  try {
    const { leagueId } = req.params;
    console.log('LeagueId ricevuto:', leagueId); // Debug: verifica che leagueId sia corretto
    const result = await db.query(`
      SELECT r.id, r.team_id, r.player_id, r.purchase_price  
      FROM rosters r 
      JOIN teams t ON r.team_id = t.id 
      JOIN leagues l ON l.id = t.league_id 
      WHERE l.id = ${leagueId}
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.updateRoster = async (req, res) => {
  try {
    const { teamId, playerId, purchasePrice } = req.body;

    const result = await db.query(`UPDATE rosters SET purchase_price = $1 WHERE team_id = $2 AND player_id = $3  RETURNING *`, [purchasePrice, teamId, playerId]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Giocatore non trovato nel roster' });
    } else {
      res.status(200).json({ message: 'Roster aggiornato con successo' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.addToRoster = async (req, res) => {
  try {
    const { teamId, playerId, purchasePrice } = req.body;
    const result = await assign_player_to_team(teamId, playerId, purchasePrice);
    res.json(result); // Restituiamo l'oggetto appena creato
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFromRoster = async (req, res) => {
  try {
    const { teamId, playerId } = req.body;
    await db.query(`DELETE FROM rosters WHERE team_id = $1 AND player_id = $2`, [teamId, playerId]);
    res.json({ message: 'Giocatore rimosso dal roster con successo' });
  } catch (error) {
    res.status(500).json({ error: 'Errore interno' });
  }
};