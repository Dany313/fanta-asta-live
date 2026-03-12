const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importiamo il buttafuori


// 1. Rotte specifiche (devono stare prima dei parametri generici)
router.get('/verify/:token', teamController.verifyToken);

router.get('/', teamController.getTeams); 
router.get('/:id', teamController.getTeamById); 
router.post('/', authMiddleware.verifyAdmin, teamController.createTeam); 
router.put('/:id', authMiddleware.verifyAdmin, teamController.updateTeam);
router.delete('/:id', authMiddleware.verifyAdmin, teamController.deleteTeam);

module.exports = router;