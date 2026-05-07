const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createLeagueSchema, updateLeagueSchema } = require('../dtos/validators/leagueValidator');
const { paramsIdSchema } = require('../dtos/validators/sharedValidator');


router.post('/', authMiddleware.verifyAdmin, validate({ body: createLeagueSchema }), leagueController.createLeague);
router.get('/', leagueController.getLeagues);
router.get('/:id', validate({ params: paramsIdSchema }), leagueController.getLeagueById);
router.put('/:id', authMiddleware.verifyAdmin, validate({ params: paramsIdSchema, body: updateLeagueSchema }), leagueController.updateLeague);
router.delete('/:id', authMiddleware.verifyAdmin, validate({ params: paramsIdSchema }), leagueController.deleteLeague);

module.exports = router;
