const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController');

router.get('/:TeamId', rosterController.getRosters);

module.exports = router;