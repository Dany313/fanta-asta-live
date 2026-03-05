const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.getTeams);
router.post('/', teamController.createTeam);
router.get('/verify/:token', teamController.verifyToken);

module.exports = router;