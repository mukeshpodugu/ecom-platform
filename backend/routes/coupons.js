const express = require('express');
const {
  getCoupons,
  createCoupon
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCoupons);
router.post('/', protect, authorize('admin'), createCoupon);

module.exports = router;
