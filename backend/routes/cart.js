const express = require('express');
const {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  applyCoupon
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All cart routes require login

router.route('/')
  .get(getCart)
  .post(addToCart);

router.post('/coupon', applyCoupon);

router.route('/:itemId')
  .put(updateCartQty)
  .delete(removeFromCart);

module.exports = router;
