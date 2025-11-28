import express from "express";
import {
  requireAuth,
  getUserIdFromAuth,
  getEmailFromAuth,
} from "../middleware/clerkMiddleware.js";

import User from "../models/UserModel/User.js";

const router = express.Router();

// POST /api/clerk/sync-user
// Purpose: Create or update user in MongoDB when they login
// Called from frontend after Clerk authentication

router.post("/sync-user", requireAuth, async (req, res) => {
  try {
    const clerkId = getUserIdFromAuth(req);
    const email = getEmailFromAuth(req);

    if (!clerkId || !email) {
      return res.status(400).json({
        error: "Missing user information from Clerk",
      });
    }

    // Check if user exists in MongoDB
    let user = await User.findOne({ clerkId });

    if (!user) {
      // Create new user in MongoDB
      user = new User({
        clerkId,
        email,
      });
      await user.save();
      console.log(`✅ New user created: ${email}`);
    } else {
      console.log(`✅ User already exists: ${email}`);
    }

    res.status(200).json({
      message: "User synced successfully",
      user: {
        _id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({
      error: "Failed to sync user",
      details: error.message,
    });
  }
});

//GET /api/clerk/me

// Get current user profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const clerkId = getUserIdFromAuth(req);

    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      user: {
        _id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        profile: user.profile,
        wallet: user.wallet,
        preferences: user.preferences,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      error: "Failed to fetch user",
      details: error.message,
    });
  }
});

//PUT /api/clerk/me

// Update user profile
router.put("/me", requireAuth, async (req, res) => {
  try {
    const clerkId = getUserIdFromAuth(req);
    const { username, bio, avatar, theme, notifications } = req.body;

    // Build update object (only allow certain fields)
    const updateData = {};

    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData["profile.bio"] = bio;
    if (avatar !== undefined) updateData["profile.avatar"] = avatar;
    if (theme !== undefined) updateData["preferences.theme"] = theme;
    if (notifications !== undefined)
      updateData["preferences.notifications"] = notifications;

    const user = await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "User profile updated successfully",
      user: {
        _id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        profile: user.profile,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      error: "Failed to update user",
      details: error.message,
    });
  }
});

export default router;
