const dbService = require('../services/dbService');
const { ErrorResponse } = require('../middleware/error');

// Calculation helper for cart pricing
const calculateCartTotals = async (cart) => {
  let subtotal = 0;
  
  if (cart.items && cart.items.length > 0) {
    for (const item of cart.items) {
      const product = await dbService.findById('products', item.product._id || item.product);
      if (product) {
        subtotal += product.price * item.quantity;
      }
    }
  }

  let discount = 0;
  let couponCode = '';
  
  if (cart.couponApplied) {
    const coupon = await dbService.findById('coupons', cart.couponApplied);
    if (coupon && coupon.isActive) {
      couponCode = coupon.code;
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else if (coupon.discountType === 'fixed') {
        discount = coupon.discountValue;
      }
      
      if (discount > subtotal) {
        discount = subtotal;
      }
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.18; // 18% GST/sales tax
  const shipping = taxableAmount > 100 || taxableAmount === 0 ? 0 : 10.0; // Free shipping over $100
  const grandTotal = taxableAmount + tax + shipping;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    couponCode,
    tax: parseFloat(tax.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2))
  };
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await dbService.findOne('carts', { user: req.user._id }, {
      populate: 'items.product'
    });

    if (!cart) {
      // Create empty cart
      cart = await dbService.create('carts', {
        user: req.user._id,
        items: [],
        couponApplied: null
      });
    }

    const pricing = await calculateCartTotals(cart);

    res.status(200).json({
      success: true,
      cart,
      pricing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  const { productId, quantity = 1, selectedVariant } = req.body;

  try {
    const product = await dbService.findById('products', productId);
    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    if (product.stock < quantity) {
      return next(new ErrorResponse('Not enough stock available', 400));
    }

    let cart = await dbService.findOne('carts', { user: req.user._id });
    if (!cart) {
      cart = await dbService.create('carts', { user: req.user._id, items: [] });
    }

    // Check if product is already in cart with same variants
    const items = cart.items || [];
    const itemIndex = items.findIndex(item => {
      const isSameProduct = String(item.product) === String(productId);
      
      // Match variants
      if (isSameProduct && selectedVariant && item.selectedVariant) {
        const itemVarKeys = Object.keys(item.selectedVariant);
        const inputVarKeys = Object.keys(selectedVariant);
        if (itemVarKeys.length !== inputVarKeys.length) return false;
        
        return itemVarKeys.every(k => String(item.selectedVariant[k]) === String(selectedVariant[k]));
      }
      return isSameProduct && !selectedVariant && !item.selectedVariant;
    });

    if (itemIndex > -1) {
      items[itemIndex].quantity += Number(quantity);
    } else {
      items.push({
        product: productId,
        quantity: Number(quantity),
        selectedVariant: selectedVariant || {}
      });
    }

    cart = await dbService.findByIdAndUpdate('carts', cart._id, { items }, { new: true });
    
    // Repopulate product data
    const populatedCart = await dbService.findById('carts', cart._id, { populate: 'items.product' });
    const pricing = await calculateCartTotals(populatedCart);

    res.status(200).json({
      success: true,
      cart: populatedCart,
      pricing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartQty = async (req, res, next) => {
  const { quantity } = req.body;
  const itemId = req.params.itemId;

  if (Number(quantity) <= 0) {
    return next(new ErrorResponse('Quantity must be greater than 0', 400));
  }

  try {
    let cart = await dbService.findOne('carts', { user: req.user._id });
    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    const items = cart.items || [];
    const itemIndex = items.findIndex(item => String(item._id) === String(itemId));

    if (itemIndex === -1) {
      return next(new ErrorResponse('Cart item not found', 404));
    }

    // Verify stock
    const product = await dbService.findById('products', items[itemIndex].product);
    if (product && product.stock < Number(quantity)) {
      return next(new ErrorResponse(`Only ${product.stock} items left in stock`, 400));
    }

    items[itemIndex].quantity = Number(quantity);

    cart = await dbService.findByIdAndUpdate('carts', cart._id, { items }, { new: true });
    const populatedCart = await dbService.findById('carts', cart._id, { populate: 'items.product' });
    const pricing = await calculateCartTotals(populatedCart);

    res.status(200).json({
      success: true,
      cart: populatedCart,
      pricing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  const itemId = req.params.itemId;

  try {
    let cart = await dbService.findOne('carts', { user: req.user._id });
    if (!cart) {
      return next(new ErrorResponse('Cart not found', 404));
    }

    const items = (cart.items || []).filter(item => String(item._id) !== String(itemId));

    cart = await dbService.findByIdAndUpdate('carts', cart._id, { items }, { new: true });
    const populatedCart = await dbService.findById('carts', cart._id, { populate: 'items.product' });
    const pricing = await calculateCartTotals(populatedCart);

    res.status(200).json({
      success: true,
      cart: populatedCart,
      pricing
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  const { code } = req.body;

  try {
    let cart = await dbService.findOne('carts', { user: req.user._id });
    if (!cart) {
      return next(new ErrorResponse('Cart empty', 404));
    }

    if (!code) {
      // Remove coupon
      cart = await dbService.findByIdAndUpdate('carts', cart._id, { couponApplied: null }, { new: true });
      const populatedCart = await dbService.findById('carts', cart._id, { populate: 'items.product' });
      const pricing = await calculateCartTotals(populatedCart);

      return res.status(200).json({
        success: true,
        message: 'Coupon removed',
        cart: populatedCart,
        pricing
      });
    }

    const coupon = await dbService.findOne('coupons', { code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return next(new ErrorResponse('Invalid or expired coupon code', 404));
    }

    // Verify expiry date
    if (new Date(coupon.endDate) < new Date()) {
      return next(new ErrorResponse('Coupon has expired', 400));
    }

    // Calculate subtotal to verify minimum order limit
    const populatedCartForSubtotal = await dbService.findById('carts', cart._id, { populate: 'items.product' });
    let subtotal = 0;
    populatedCartForSubtotal.items.forEach(item => {
      if (item.product) subtotal += item.product.price * item.quantity;
    });

    if (subtotal < coupon.minOrderAmount) {
      return next(new ErrorResponse(`Minimum purchase of $${coupon.minOrderAmount} required for this coupon`, 400));
    }

    cart = await dbService.findByIdAndUpdate('carts', cart._id, { couponApplied: coupon._id }, { new: true });
    const populatedCart = await dbService.findById('carts', cart._id, { populate: 'items.product' });
    const pricing = await calculateCartTotals(populatedCart);

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      cart: populatedCart,
      pricing
    });
  } catch (err) {
    next(err);
  }
};
