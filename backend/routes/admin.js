const express = require('express');
const {
  getAnalytics,
  getUsers,
  toggleUserStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Restrict all admin paths to admins

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);

module.exports = router;
