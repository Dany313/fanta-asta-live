const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController');

router.get('/', rosterController.getRostersByTeamId);
router.put('/', rosterController.updateRoster);
router.post('/', rosterController.addToRoster);
router.delete('/', rosterController.deleteFromRoster);

module.exports = router;