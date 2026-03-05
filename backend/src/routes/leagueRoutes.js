const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');

router.post('/', leagueController.createLeague);
router.get('/', leagueController.getLeagues);
router.put('/:id', leagueController.updateLeague);
router.delete('/:id', leagueController.deleteLeague);

module.exports = router;
