const dbService = require('../services/dbService');
const { ErrorResponse } = require('../middleware/error');

// @desc    Get active coupons list
// @route   GET /api/coupons
// @access  Public
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await dbService.find('coupons', {
      isActive: true,
      endDate: { $gte: new Date().toISOString() }
    });

    res.status(200).json({
      success: true,
      coupons
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, daysValid } = req.body;

  try {
    const codeUpper = code.toUpperCase();
    const existing = await dbService.findOne('coupons', { code: codeUpper });
    if (existing) {
      return next(new ErrorResponse('Coupon code already exists', 400));
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (Number(daysValid) || 7));

    const coupon = await dbService.create('coupons', {
      code: codeUpper,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });
  } catch (err) {
    next(err);
  }
};
