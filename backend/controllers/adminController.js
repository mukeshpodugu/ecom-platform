const dbService = require('../services/dbService');
const { ErrorResponse } = require('../middleware/error');

// @desc    Get dashboard analytics metrics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const totalSalesCount = await dbService.countDocuments('orders', { paymentStatus: 'Paid' });
    const pendingOrdersCount = await dbService.countDocuments('orders', { deliveryStatus: 'Pending' });
    const totalUsersCount = await dbService.countDocuments('users');
    const totalProductsCount = await dbService.countDocuments('products');

    // Aggregate revenues
    const orders = await dbService.find('orders', { paymentStatus: { $in: ['Paid', 'Pending'] } });
    let totalRevenue = 0;
    orders.forEach(order => {
      if (order.deliveryStatus !== 'Cancelled') {
        totalRevenue += order.grandTotal;
      }
    });

    // Mock category distribution
    const categories = await dbService.find('categories');
    const categoryStats = [];
    for (const cat of categories) {
      const prodCount = await dbService.countDocuments('products', { category: cat._id });
      categoryStats.push({
        categoryName: cat.name,
        count: prodCount
      });
    }

    // Mock Sales history chart (last 6 months)
    const salesHistory = [
      { month: 'Jan', sales: 4000, revenue: 12000 },
      { month: 'Feb', sales: 4500, revenue: 15000 },
      { month: 'Mar', sales: 5100, revenue: 19000 },
      { month: 'Apr', sales: 4900, revenue: 17500 },
      { month: 'May', sales: 6200, revenue: 24000 },
      { month: 'Jun', sales: totalSalesCount * 50, revenue: Math.round(totalRevenue) } // dynamic current month
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalSalesCount,
        pendingOrders: pendingOrdersCount,
        totalUsers: totalUsersCount,
        totalProducts: totalProductsCount
      },
      categoryStats,
      salesHistory
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await dbService.find('users', {}, { sort: { createdAt: -1 } });
    
    // Clean passwords
    const cleanUsers = users.map(user => {
      const u = { ...user };
      delete u.password;
      return u;
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users: cleanUsers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Block or Unblock user account
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res, next) => {
  const { isBlocked } = req.body;

  try {
    const user = await dbService.findById('users', req.params.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(new ErrorResponse('Cannot block admin users', 400));
    }

    // Since users doesn't have a direct isBlocked field in the base schema, we can store it as isBlocked, or custom update.
    // Let's update user status.
    const updatedUser = await dbService.findByIdAndUpdate('users', req.params.id, { isVerified: !isBlocked }, { new: true });

    res.status(200).json({
      success: true,
      message: `User accounts ${isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified
      }
    });
  } catch (err) {
    next(err);
  }
};
