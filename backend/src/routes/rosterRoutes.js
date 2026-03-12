const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importiamo il buttafuori


router.get('/team/:teamId', rosterController.getRostersByTeamId);
router.get('/league/:leagueId', rosterController.getRostersByLeagueId);
router.put('/', authMiddleware.verifyAdmin, rosterController.updateRoster);
router.post('/', authMiddleware.verifyAdmin, rosterController.addToRoster);
router.delete('/', authMiddleware.verifyAdmin, rosterController.deleteFromRoster);

module.exports = router;