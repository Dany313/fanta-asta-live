const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');

router.post('/leagues', leagueController.createLeague);
router.get('/leagues', leagueController.getLeagues);

module.exports = router;
