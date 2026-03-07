// File: src/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importiamo il buttafuori

// Inseriamo "authMiddleware.verifyAdmin" in mezzo, prima del controller!
router.get('/', playerController.getPlayers);

module.exports = router;