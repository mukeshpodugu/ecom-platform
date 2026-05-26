const express = require('express');
const {
  getSellerDashboard,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('seller', 'admin')); // Sellers and admins can write/manage seller storefronts

router.get('/dashboard', getSellerDashboard);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
