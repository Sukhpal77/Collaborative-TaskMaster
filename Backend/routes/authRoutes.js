const express = require('express');
const { signup, login, refreshToken, resetPasswordRequest, resetPassword, logout } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/reset-password-request', resetPasswordRequest);
router.post('/reset-password', resetPassword);
router.post('/logout', authMiddleware, logout);

module.exports = router;
