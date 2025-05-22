import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RollNumber from '../models/RollNumber.js';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, rollNumber } = req.body;
    console.log(req.body)
    // First, validate roll number against the allowed list
    const validRollNumber = await RollNumber.findOne({ rollNumber });
    if (!validRollNumber) {
      return res.status(400).json({ message: 'Invalid Roll Number' });
    }

    // Then check if user already exists
    const userExists = await User.findOne({ 
      email
    });
    const userExistsWithRollNumber = await User.findOne({ 
      rollNumber
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    if (userExistsWithRollNumber) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate verification code

    // Create new user
    const user = new User({
      username,
      email,
      password,
      rollNumber,
      role: role || 'voter',
      isVerified: true
    });
    
    
    // Send verification email
    // sendVerificationEmail(email, username);
    user.save();
    console.log("User saved")
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      message: 'Registration successful. Please check your email for verification.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber,
        isVerified: true
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});


// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, rollNumber, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

router.get('/api/auth/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.redirect();
  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;