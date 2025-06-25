const express = require('express');
const router = express.Router();
const User = require('../models/users.models');
const { authMiddleware } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { memberNumber, fname, lname, email, phoneNumber, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { memberNumber: memberNumber?.toUpperCase() },
        { email: email?.toLowerCase() }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists', 
        details: 'Member number or email already in use' 
      });
    }

    const newUser = new User({
      memberNumber,
      fname,
      lname,
      email,
      phoneNumber,
      password,
      role: role || 'user'
    });

    const savedUser = await newUser.save();
    
    // Generate token
    const token = savedUser.generateToken();
    
    // Remove password from response
    savedUser.password = undefined;
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: savedUser
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    res.status(500).json({ 
      error: 'Failed to register user', 
      details: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { memberNumber, password } = req.body;

    if (!memberNumber || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Member number and password are required'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ 
      memberNumber: memberNumber.toUpperCase() 
    }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'Invalid member number or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        details: 'Please contact administrator'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = user.generateToken();
    
    // Remove password from response
    user.password = undefined;

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({
      error: 'Login failed',
      details: error.message
    });
  }
});

// Change password
router.patch('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Validation failed',
        details: 'Current password and new password are required'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(400).json({
        error: 'Authentication failed',
        details: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to change password',
      details: error.message
    });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get profile',
      details: error.message
    });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Logout failed',
      details: error.message
    });
  }
});

module.exports = router;