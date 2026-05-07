const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
    createTeamSchema,
    updateTeamSchema,
    verifyTokenSchema,
    getTeamsSchema
} = require('../dtos/validators/teamValidator');
const { paramsIdSchema } = require('../dtos/validators/sharedValidator');


// 1. Rotte specifiche (devono stare prima dei parametri generici)
router.get('/verify/:token', validate({ params: verifyTokenSchema }), teamController.verifyToken);

router.get('/', validate({ query: getTeamsSchema }), teamController.getTeams);
router.get('/:id', validate({ params: paramsIdSchema }), teamController.getTeamById);
router.post('/', authMiddleware.verifyAdmin, validate({ body: createTeamSchema }), teamController.createTeam);
router.put('/:id', authMiddleware.verifyAdmin, validate({ params: paramsIdSchema, body: updateTeamSchema }), teamController.updateTeam);
router.delete('/:id', authMiddleware.verifyAdmin, validate({ params: paramsIdSchema }), teamController.deleteTeam);

module.exports = router;