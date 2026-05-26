const dbService = require('../services/dbService');
const { ErrorResponse } = require('../middleware/error');

// @desc    Create new review for a product
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  const { productId, rating, title, comment, images } = req.body;

  try {
    const product = await dbService.findById('products', productId);
    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Check if user has already reviewed the product
    const existingReview = await dbService.findOne('reviews', {
      user: req.user._id,
      product: productId
    });

    if (existingReview) {
      return next(new ErrorResponse('You have already reviewed this product', 400));
    }

    const review = await dbService.create('reviews', {
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      title,
      comment,
      images: images || [],
      likes: 0,
      likedBy: []
    });

    // Recalculate average rating & review count for the product
    const reviews = await dbService.find('reviews', { product: productId });
    const count = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / count;

    await dbService.findByIdAndUpdate('products', productId, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviewsCount: count
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await dbService.find('reviews', 
      { product: req.params.productId },
      { populate: 'user', sort: { createdAt: -1 } }
    );

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Like / Vote review as helpful
// @route   PUT /api/reviews/:id/like
// @access  Private
exports.likeReview = async (req, res, next) => {
  try {
    const review = await dbService.findById('reviews', req.params.id);
    if (!review) {
      return next(new ErrorResponse('Review not found', 404));
    }

    const likedBy = review.likedBy || [];
    const userIndex = likedBy.findIndex(id => String(id) === String(req.user._id));

    if (userIndex > -1) {
      // Unlike
      likedBy.splice(userIndex, 1);
    } else {
      // Like
      likedBy.push(req.user._id);
    }

    const updated = await dbService.findByIdAndUpdate('reviews', req.params.id, {
      likedBy,
      likes: likedBy.length
    }, { new: true });

    res.status(200).json({
      success: true,
      likes: updated.likes,
      likedBy: updated.likedBy
    });
  } catch (err) {
    next(err);
  }
};
