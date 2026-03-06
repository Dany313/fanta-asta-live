const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// 1. Rotte specifiche (devono stare prima dei parametri generici)
router.get('/verify/:token', teamController.verifyToken);

// 2. Rotte sulla collezione (GET per lista/filtro, POST per creazione)
router.get('/', teamController.getTeams); // Gestisce /api/teams?leagueId=...
router.post('/', teamController.createTeam); // leagueId va nel body

// 3. Rotte sulla singola risorsa (/:id)
router.put('/:id', teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);

module.exports = router;