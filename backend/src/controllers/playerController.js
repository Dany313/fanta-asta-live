const playerService = require('../services/playerService');
const PlayerMapper = require('../mappers/PlayerMapper');

exports.getPlayers = async (req, res) => {
  try {
    const result = await playerService.getAvailablePlayers();
    const players = result.rows.map(PlayerMapper.toEntity);
    res.json(players);
  } catch (error) {
    console.error("Errore getPlayers:", error);
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.getPlayersForAuction = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const result = await playerService.getAvailablePlayersByLeagueId(leagueId);
    const players = result.rows.map(PlayerMapper.toEntity);
    res.json(players);
  } catch (error) {
    console.error("Errore getPlayers:", error);
    res.status(500).json({ error: 'Errore interno' });
  }
};

exports.uploadPlayers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    
    // req.file.buffer contains the binary data of the file
    const result = await playerService.importPlayersFromBuffer(req.file.buffer);
    
    res.json(result);
  } catch (error) {
    console.error("Errore uploadPlayers:", error);
    res.status(500).json({ error: error.message || 'Errore interno' });
  }
};