const fs = require('fs');
const path = require('path');
const dbService = require('../services/dbService');
const { ErrorResponse } = require('../middleware/error');
const { generateInvoice } = require('../utils/pdfGenerator');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  const { shippingAddress, paymentMethod, deliveryDateSelection } = req.body;

  try {
    const cart = await dbService.findOne('carts', { user: req.user._id }, { populate: 'items.product' });
    if (!cart || !cart.items || cart.items.length === 0) {
      return next(new ErrorResponse('Your cart is empty', 400));
    }

    // 1. Verify and Update stock
    for (const item of cart.items) {
      const product = await dbService.findById('products', item.product._id || item.product);
      if (!product) {
        return next(new ErrorResponse(`Product not found: ${item.product.name}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(new ErrorResponse(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400));
      }
    }

    // Deduct stock levels
    for (const item of cart.items) {
      const product = await dbService.findById('products', item.product._id || item.product);
      const newStock = product.stock - item.quantity;
      await dbService.findByIdAndUpdate('products', product._id, { stock: newStock });
    }

    // 2. Pricing calculations
    let subtotal = 0;
    const orderItems = [];

    cart.items.forEach(item => {
      const price = item.product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price,
        selectedVariant: item.selectedVariant || {}
      });
    });

    let discount = 0;
    if (cart.couponApplied) {
      const coupon = await dbService.findById('coupons', cart.couponApplied);
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
          }
        } else if (coupon.discountType === 'fixed') {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, subtotal);
      }
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * 0.18; // 18% GST/Tax
    const shipping = taxableAmount > 100 ? 0 : 10.0;
    const grandTotal = taxableAmount + tax + shipping;

    // 3. Create Order
    const trackingNumber = 'TRK' + Math.floor(10000000 + Math.random() * 90000000);
    const defaultDeliveryDate = new Date();
    defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + 4); // 4 days delivery

    const orderData = {
      user: req.user._id,
      items: orderItems,
      shippingAddress: shippingAddress || (req.user.addresses && req.user.addresses.find(a => a.isDefault)) || {},
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      deliveryStatus: 'Pending',
      totalAmount: subtotal,
      discountAmount: discount,
      shippingAmount: shipping,
      taxAmount: tax,
      grandTotal,
      trackingNumber,
      deliveryDate: deliveryDateSelection ? new Date(deliveryDateSelection) : defaultDeliveryDate
    };

    const order = await dbService.create('orders', orderData);

    // 4. Create invoice directory and PDF
    const invoicesDir = path.join(__dirname, '..', 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    
    const invoiceFilename = `invoice-${order._id}.pdf`;
    const invoicePath = path.join(invoicesDir, invoiceFilename);
    
    // Fetch populated order for invoice details
    const populatedOrder = await dbService.findById('orders', order._id, { populate: ['items.product', 'user'] });
    await generateInvoice(populatedOrder, invoicePath);

    // Save invoice location
    await dbService.findByIdAndUpdate('orders', order._id, { invoicePath: `/api/orders/${order._id}/invoice` });

    // 5. Empty User Cart
    await dbService.findByIdAndUpdate('carts', cart._id, { items: [], couponApplied: null });

    // 6. Record Payment
    await dbService.create('payments', {
      order: order._id,
      user: req.user._id,
      paymentId: 'PAY' + Math.floor(10000000 + Math.random() * 90000000),
      method: paymentMethod || 'COD',
      amount: grandTotal,
      status: paymentMethod === 'COD' ? 'pending' : 'success'
    });

    // 7. Add notification
    await dbService.create('notifications', {
      user: req.user._id,
      title: 'Order Placed!',
      message: `Your order INV-${order._id.toString().substring(0, 8).toUpperCase()} has been placed successfully.`,
      type: 'Order'
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await dbService.findById('orders', req.params.id, {
      populate: ['items.product', 'user']
    });

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Security check: Only buyer, seller of item, or admin can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Unauthorized to view this order', 403));
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's order history
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await dbService.find('orders', { user: req.user._id }, {
      sort: { createdAt: -1 },
      populate: 'items.product'
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    let order = await dbService.findById('orders', req.params.id);
    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Unauthorized action', 403));
    }

    if (order.deliveryStatus === 'Delivered' || order.deliveryStatus === 'Cancelled') {
      return next(new ErrorResponse(`Cannot cancel order that is already ${order.deliveryStatus.toLowerCase()}`, 400));
    }

    // Restore stock levels
    for (const item of order.items) {
      const product = await dbService.findById('products', item.product);
      if (product) {
        await dbService.findByIdAndUpdate('products', product._id, { stock: product.stock + item.quantity });
      }
    }

    order = await dbService.findByIdAndUpdate('orders', req.params.id, {
      deliveryStatus: 'Cancelled',
      paymentStatus: order.paymentStatus === 'Paid' ? 'Refunded' : 'Failed'
    }, { new: true });

    // Log Notification
    await dbService.create('notifications', {
      user: order.user,
      title: 'Order Cancelled',
      message: `Your order INV-${order._id.toString().substring(0, 8).toUpperCase()} has been cancelled.`,
      type: 'Order'
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download invoice PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.downloadInvoice = async (req, res, next) => {
  try {
    const order = await dbService.findById('orders', req.params.id, { populate: ['items.product', 'user'] });
    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Unauthorized to download this invoice', 403));
    }

    const invoicesDir = path.join(__dirname, '..', 'invoices');
    const invoiceFilename = `invoice-${order._id}.pdf`;
    const invoicePath = path.join(invoicesDir, invoiceFilename);

    // Regenerate invoice if deleted/missing
    if (!fs.existsSync(invoicePath)) {
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }
      await generateInvoice(order, invoicePath);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceFilename}"`);
    
    const fileStream = fs.createReadStream(invoicePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};
