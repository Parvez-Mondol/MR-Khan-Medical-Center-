const express = require('express');
const router = express.Router();
const { register, login, me, refreshToken, requestPasswordReset, resetPassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const authSchemas = require('../validators/auth');

router.post('/register', validate(authSchemas.register), register);
router.post('/login', validate(authSchemas.login), login);
router.get('/me', protect, me);
router.post('/refresh', validate(authSchemas.refresh), refreshToken);
router.post('/password-reset-request', validate(authSchemas.passwordResetRequest), requestPasswordReset);
router.post('/password-reset', validate(authSchemas.passwordReset), resetPassword);
router.post('/logout', validate(authSchemas.logout), logout);

module.exports = router;
