const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController');

router.get('/', rosterController.getRosters);

module.exports = router;