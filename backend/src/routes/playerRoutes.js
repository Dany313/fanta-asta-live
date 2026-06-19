// File: src/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const { paramsLeagueIdSchema } = require('../dtos/validators/sharedValidator');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', playerController.getPlayers);
router.get('/auction/:leagueId', validate({ params: paramsLeagueIdSchema }), playerController.getPlayersForAuction);

router.post('/upload', authMiddleware.verifyAdmin, upload.single('file'), playerController.uploadPlayers);

module.exports = router;