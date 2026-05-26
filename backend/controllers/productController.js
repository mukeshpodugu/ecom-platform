const dbService = require('../services/dbService');
const { ErrorResponse } = require('../middleware/error');

// @desc    Get all products (with pagination, filtering, sorting)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      discount,
      sort
    } = req.query;

    const query = {};

    // 1. Search Query
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // 2. Category Filter
    if (category) {
      // Find category by slug/name if it's passed as a string
      const cat = await dbService.findOne('categories', {
        $or: [{ _id: category }, { slug: category }, { name: category }]
      });
      if (cat) {
        query.category = cat._id;
      }
    }

    // 3. Brand Filter
    if (brand) {
      query.brand = brand;
    }

    // 4. Price Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 5. Ratings Filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // 6. Discount Filter
    if (discount) {
      query.discount = { $gte: Number(discount) };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Sort Options
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'priceAsc') sortOption = { price: 1 };
    else if (sort === 'priceDesc') sortOption = { price: -1 };
    else if (sort === 'popularity') sortOption = { rating: -1 };

    const products = await dbService.find('products', query, {
      skip,
      limit: Number(limit),
      sort: sortOption,
      populate: 'category'
    });

    const total = await dbService.countDocuments('products', query);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total
      },
      products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get autocomplete search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  try {
    const products = await dbService.find('products', 
      { name: { $regex: query, $options: 'i' } },
      { limit: 5 }
    );

    const suggestions = products.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category
    }));

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
  try {
    const product = await dbService.findById('products', req.params.id, {
      populate: ['category', 'seller']
    });

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recommendations / similar products (AI recommendation engine structure)
// @route   GET /api/products/:id/recommendations
// @access  Public
exports.getProductRecommendations = async (req, res, next) => {
  try {
    const product = await dbService.findById('products', req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    // Recommendation logic: find products in same category, brand, or similar price range
    const query = {
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { brand: product.brand },
        { price: { $gte: product.price * 0.7, $lte: product.price * 1.3 } }
      ]
    };

    const recommendations = await dbService.find('products', query, {
      limit: 6,
      sort: { rating: -1 } // recommend highly-rated similar items
    });

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI Personalized Recommendations for a user
// @route   GET /api/products/user/recommendations
// @access  Private/Public
exports.getPersonalizedRecommendations = async (req, res, next) => {
  try {
    // If not logged in, return featured/trending products as default recommendations
    if (!req.user) {
      const recommendations = await dbService.find('products', { isFeatured: true }, { limit: 6 });
      return res.status(200).json({ success: true, recommendations });
    }

    // AI logic: Find categories from user's order history or wishlist
    const userOrders = await dbService.find('orders', { user: req.user._id });
    
    let preferredCategories = [];
    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.category) {
          preferredCategories.push(item.product.category.toString());
        }
      });
    });

    // Fallback: If no orders, check wishlist
    if (preferredCategories.length === 0) {
      const wishlist = await dbService.findOne('wishlists', { user: req.user._id });
      if (wishlist && wishlist.products) {
        preferredCategories = wishlist.products.map(p => p.category ? p.category.toString() : null).filter(Boolean);
      }
    }

    let recommendationsQuery = {};
    if (preferredCategories.length > 0) {
      recommendationsQuery = {
        category: { $in: preferredCategories }
      };
    } else {
      recommendationsQuery = { isTrending: true };
    }

    const recommendations = await dbService.find('products', recommendationsQuery, {
      limit: 6,
      sort: { rating: -1 }
    });

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (err) {
    next(err);
  }
};
