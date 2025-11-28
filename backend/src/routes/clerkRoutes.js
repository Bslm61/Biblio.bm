import express from 'express';
import { requireAuth } from '../middleware/clerkMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Create or get user profile on first login
router.post('/sync-user', requireAuth, async (req, res) => {
  try {
    const { userId, emailAddresses } = req.auth;
    const email = emailAddresses[0].emailAddress;
    
    // Check if user exists in MongoDB
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      // Create new user in MongoDB
      user = new User({
        clerkId: userId,
        email: email
      });
      await user.save();
    }
    
    res.json({ message: 'User synced', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { clerkId: req.auth.userId },
      req.body,
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;