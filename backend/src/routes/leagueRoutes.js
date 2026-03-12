const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importiamo il buttafuori


router.post('/', authMiddleware.verifyAdmin, leagueController.createLeague);
router.get('/', leagueController.getLeagues);
router.get('/:id', leagueController.getLeagueById);
router.put('/:id', authMiddleware.verifyAdmin, leagueController.updateLeague);
router.delete('/:id', authMiddleware.verifyAdmin, leagueController.deleteLeague);

module.exports = router;
