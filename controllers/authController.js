const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config/config');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, mobile, password } = req.body;

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this mobile number already exists'
      });
    }

    const user = new User({ name, mobile, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during registration'
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid mobile number or password'
      });
    }

    const isPasswordValid = user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid mobile number or password'
      });
    }

    user.status = 'online';
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during login'
    });
  }
};

// Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Update User Status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be online, offline, or away'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { status },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Status updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
}; 