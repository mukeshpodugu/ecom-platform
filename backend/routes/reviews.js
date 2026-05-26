const express = require('express');
const {
  createReview,
  getProductReviews,
  likeReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.put('/:id/like', protect, likeReview);

module.exports = router;
