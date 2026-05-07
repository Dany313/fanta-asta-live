const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { rosterMutationSchema, rosterDeleteSchema } = require('../dtos/validators/rosterValidator');
const { paramsTeamIdSchema, paramsLeagueIdSchema } = require('../dtos/validators/sharedValidator');


router.get('/team/:teamId', validate({ params: paramsTeamIdSchema }), rosterController.getRostersByTeamId);
router.get('/league/:leagueId', validate({ params: paramsLeagueIdSchema }), rosterController.getRostersByLeagueId);
router.put('/', authMiddleware.verifyAdmin, validate({ body: rosterMutationSchema }), rosterController.updateRoster);
router.post('/',  validate({ body: rosterMutationSchema }), rosterController.addToRoster);
router.delete('/', authMiddleware.verifyAdmin, validate({ body: rosterDeleteSchema }), rosterController.deleteFromRoster);

module.exports = router;