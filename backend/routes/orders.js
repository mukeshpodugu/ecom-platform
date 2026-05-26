const express = require('express');
const {
  createOrder,
  getOrderById,
  getMyOrders,
  cancelOrder,
  downloadInvoice
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All order routes require login

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
