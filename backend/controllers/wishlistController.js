const dbService = require('../services/dbService');
const { ErrorResponse } = require('../middleware/error');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await dbService.findOne('wishlists', { user: req.user._id }, {
      populate: 'products'
    });

    if (!wishlist) {
      // Create an empty wishlist
      wishlist = await dbService.create('wishlists', {
        user: req.user._id,
        products: []
      });
    }

    res.status(200).json({
      success: true,
      wishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new ErrorResponse('Please provide a product ID', 400));
  }

  try {
    // Check if product exists
    const product = await dbService.findById('products', productId);
    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    let wishlist = await dbService.findOne('wishlists', { user: req.user._id });

    if (!wishlist) {
      wishlist = await dbService.create('wishlists', {
        user: req.user._id,
        products: [productId]
      });
    } else {
      const products = wishlist.products || [];
      if (!products.some(p => String(p._id || p) === String(productId))) {
        products.push(productId);
        wishlist = await dbService.findByIdAndUpdate('wishlists', wishlist._id, { products }, { new: true });
      }
    }

    const populated = await dbService.findById('wishlists', wishlist._id, { populate: 'products' });

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  const { productId } = req.params;

  try {
    let wishlist = await dbService.findOne('wishlists', { user: req.user._id });
    if (!wishlist) {
      return next(new ErrorResponse('Wishlist not found', 404));
    }

    let products = wishlist.products || [];
    products = products.filter(p => String(p._id || p) !== String(productId));

    wishlist = await dbService.findByIdAndUpdate('wishlists', wishlist._id, { products }, { new: true });
    const populated = await dbService.findById('wishlists', wishlist._id, { populate: 'products' });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: populated
    });
  } catch (err) {
    next(err);
  }
};
