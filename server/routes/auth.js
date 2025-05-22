import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RollNumber from '../models/RollNumber.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendVerificationEmail } from '../utils/emailService.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, rollNumber } = req.body;
    const validRollNumber = await RollNumber.findOne({ rollNumber });
    if (validRollNumber) {
      console.log(validRollNumber)
      const user = new User({
        username,
        email,
        password,
        rollNumber,
        role: role || 'voter'
      });
      
      await user.save();
    }
    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }, { rollNumber }] 
    });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Send verification email
    await sendVerificationEmail(email, username);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber
      }
    });
  }
  catch (error) {
    res.status(500).json({ message: 'Invalid Roll Number', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, rollNumber, password } = req.body;
    
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
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

export default router;