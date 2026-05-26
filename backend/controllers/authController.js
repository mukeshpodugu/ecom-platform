const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dbService = require('../services/dbService');
const { ErrorResponse } = require('../middleware/error');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Send response helper
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // Remove password from output
  const userOutput = { ...user };
  delete userOutput.password;

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: userOutput
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user exists
    const userExists = await dbService.findOne('users', { email });
    if (userExists) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Hash password (for JSON fallback since Mongoose handles it via pre-save, we can hash manually if mock mode is on)
    let hashedPassword = password;
    if (global.dbMode === 'mock') {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const user = await dbService.create('users', {
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      isVerified: false,
      addresses: [],
      verificationToken: Math.random().toString(36).substring(2, 15)
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
    // Check for user
    const user = await dbService.findOne('users', { email });
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  try {
    const user = await dbService.findByIdAndUpdate('users', req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mock Google Login / OAuth
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  const { email, name, googleId } = req.body;

  try {
    let user = await dbService.findOne('users', { email });

    if (!user) {
      // Create user automatically
      const randomPassword = Math.random().toString(36).substring(2, 15);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await dbService.create('users', {
        name,
        email,
        password: hashedPassword,
        role: 'customer',
        isVerified: true,
        addresses: []
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Add / Update address
// @route   POST /api/auth/address
// @access  Private
exports.saveAddress = async (req, res, next) => {
  const { street, city, state, zip, country, isDefault } = req.body;

  try {
    let addresses = req.user.addresses || [];
    
    if (isDefault) {
      addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    const newAddress = {
      _id: new mongoose.Types.ObjectId().toString(),
      street,
      city,
      state,
      zip,
      country,
      isDefault: isDefault || addresses.length === 0
    };

    addresses.push(newAddress);

    const user = await dbService.findByIdAndUpdate('users', req.user._id, { addresses }, { new: true });

    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (err) {
    next(err);
  }
};
