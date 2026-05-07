// File: src/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const validate = require('../middlewares/validate');
const { paramsLeagueIdSchema } = require('../dtos/validators/sharedValidator');

router.get('/', playerController.getPlayers);
router.get('/auction/:leagueId', validate({ params: paramsLeagueIdSchema }), playerController.getPlayersForAuction);

module.exports = router;