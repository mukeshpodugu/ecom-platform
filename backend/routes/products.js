const express = require('express');
const {
  getProducts,
  getProductById,
  getSearchSuggestions,
  getProductRecommendations,
  getPersonalizedRecommendations
} = require('../controllers/productController');
const { protect, resolveUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/user/recommendations', resolveUser, getPersonalizedRecommendations);
router.get('/:id', getProductById);
router.get('/:id/recommendations', getProductRecommendations);

module.exports = router;
