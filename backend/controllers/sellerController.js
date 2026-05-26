const dbService = require('../services/dbService');
const { ErrorResponse } = require('../middleware/error');

// Helper to get or create seller profile for a user
const getOrCreateSeller = async (userId, name) => {
  let seller = await dbService.findOne('sellers', { user: userId });
  if (!seller) {
    seller = await dbService.create('sellers', {
      user: userId,
      storeName: `${name}'s Store`,
      description: 'Welcome to our professional storefront.',
      isVerified: true
    });
  }
  return seller;
};

// @desc    Get seller analytics dashboard
// @route   GET /api/sellers/dashboard
// @access  Private/Seller
exports.getSellerDashboard = async (req, res, next) => {
  try {
    const seller = await getOrCreateSeller(req.user._id, req.user.name);

    const products = await dbService.find('products', { seller: seller._id });
    const productIds = products.map(p => p._id.toString());

    // Calculate seller sales from orders
    const allOrders = await dbService.find('orders', {});
    
    let totalEarnings = 0;
    let itemsSold = 0;
    const sellerOrders = [];

    allOrders.forEach(order => {
      let containsSellerProduct = false;
      let orderSellerRevenue = 0;

      order.items.forEach(item => {
        if (productIds.includes(String(item.product._id || item.product))) {
          containsSellerProduct = true;
          orderSellerRevenue += item.price * item.quantity;
          itemsSold += item.quantity;
        }
      });

      if (containsSellerProduct) {
        totalEarnings += orderSellerRevenue;
        sellerOrders.push({
          orderId: order._id,
          date: order.createdAt,
          grandTotal: order.grandTotal,
          deliveryStatus: order.deliveryStatus,
          paymentStatus: order.paymentStatus,
          sellerRevenue: orderSellerRevenue
        });
      }
    });

    res.status(200).json({
      success: true,
      storeInfo: seller,
      analytics: {
        totalEarnings,
        itemsSold,
        activeProducts: products.length,
        recentOrdersCount: sellerOrders.length
      },
      orders: sellerOrders,
      products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Seller add new product
// @route   POST /api/sellers/products
// @access  Private/Seller
exports.addProduct = async (req, res, next) => {
  const { name, description, price, originalPrice, categoryId, brand, stock, images, variants, specs } = req.body;

  try {
    const seller = await getOrCreateSeller(req.user._id, req.user.name);

    // Verify category exists
    const category = await dbService.findById('categories', categoryId);
    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }

    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const product = await dbService.create('products', {
      name,
      description,
      price: Number(price),
      originalPrice: Number(originalPrice),
      discount,
      category: categoryId,
      brand,
      stock: Number(stock),
      images: images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
      variants: variants || [],
      specs: specs || {},
      seller: seller._id,
      rating: 0,
      reviewsCount: 0
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Seller update product
// @route   PUT /api/sellers/products/:id
// @access  Private/Seller
exports.updateProduct = async (req, res, next) => {
  try {
    const seller = await getOrCreateSeller(req.user._id, req.user.name);
    let product = await dbService.findById('products', req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Security check: Verify seller owns the product
    if (product.seller.toString() !== seller._id.toString()) {
      return next(new ErrorResponse('Unauthorized to update this product', 403));
    }

    const { price, originalPrice } = req.body;
    let discount = product.discount;
    if (price && originalPrice) {
      discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    }

    const updatedData = {
      ...req.body,
      discount
    };

    product = await dbService.findByIdAndUpdate('products', req.params.id, updatedData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Seller delete product
// @route   DELETE /api/sellers/products/:id
// @access  Private/Seller
exports.deleteProduct = async (req, res, next) => {
  try {
    const seller = await getOrCreateSeller(req.user._id, req.user.name);
    const product = await dbService.findById('products', req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    if (product.seller.toString() !== seller._id.toString()) {
      return next(new ErrorResponse('Unauthorized to delete this product', 403));
    }

    await dbService.findByIdAndDelete('products', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
