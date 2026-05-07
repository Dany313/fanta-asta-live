const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { loginSchema } = require('../dtos/validators/authValidator');

router.post('/login', validate({ body: loginSchema }), authController.login);

module.exports = router;