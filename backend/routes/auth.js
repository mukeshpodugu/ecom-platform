const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  googleLogin,
  saveAddress
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', googleLogin);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.post('/address', protect, saveAddress);

module.exports = router;
