import express from "express";
import { requireAuth } from "../middleware/clerkMiddleware.js";
import User from "../models/UserModel/User.js";
import Rental from "../models/RentalModel/Rental.js";
import Review from "../models/ReviewModel/Review.js";

const router = express.Router();

// ============================================
// 🧪 TESTING ENDPOINT (Keep for development)
// ============================================

// Make user admin
router.put("/make-admin", requireAuth, async (req, res) => {
  try {
    const clerkId = req.auth.clerkId;

    console.log(`🔍 Looking for user with clerkId: ${clerkId}`);

    const user = await User.findOneAndUpdate(
      { clerkId },
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found in database",
        details: `No user found with clerkId: ${clerkId}`,
      });
    }

    res.json({
      message: "✅ User is now ADMIN!",
      user: {
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        clerkId: user.clerkId,
      },
    });
  } catch (error) {
    console.error("Error in make-admin route:", error);
    res.status(500).json({
      error: "Failed to update user to admin",
      details: error.message,
    });
  }
});

// 📚 PHASE 8: USER PROFILES

// Get public profile
router.get("/public/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      error: "Failed to fetch profile",
      details: error.message,
    });
  }
});

// Get user stats (public)
router.get("/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const totalRentals = await Rental.countDocuments({ user: userId });
    const reviewsWritten = await Review.countDocuments({ user: userId });

    res.json({
      stats: {
        totalRentals,
        booksRead: totalRentals,
        totalSpent: user.wallet.totalSpent,
        reviewsWritten,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      error: "Failed to fetch stats",
      details: error.message,
    });
  }
});

// 🔐 PROTECTED ROUTES (Require authentication)

router.use(requireAuth);

// Get current user's full profile
router.get("/me/profile", async (req, res) => {
  try {
    const clerkId = req.auth.clerkId;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const totalRentals = await Rental.countDocuments({ user: user._id });
    const reviewsWritten = await Review.countDocuments({ user: user._id });

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
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      stats: {
        totalRentals,
        booksRead: totalRentals,
        totalSpent: user.wallet.totalSpent,
        reviewsWritten,
      },
    });
  } catch (error) {
    console.error("Error fetching current profile:", error);
    res.status(500).json({
      error: "Failed to fetch profile",
      details: error.message,
    });
  }
});

// Update user profile
router.put("/me/profile", async (req, res) => {
  try {
    const clerkId = req.auth.clerkId;
    const { username, bio, avatar } = req.body;

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData["profile.bio"] = bio;
    if (avatar !== undefined) updateData["profile.avatar"] = avatar;

    const user = await User.findOneAndUpdate(
      { clerkId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        profile: user.profile,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      error: "Failed to update profile",
      details: error.message,
    });
  }
});

// Get user's rental history
router.get("/me/rentals", async (req, res) => {
  try {
    const clerkId = req.auth.clerkId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const rentals = await Rental.find({ user: user._id })
      .populate("book", "title author coverImage")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Rental.countDocuments({ user: user._id });

    res.json({
      rentals,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching rental history:", error);
    res.status(500).json({
      error: "Failed to fetch rental history",
      details: error.message,
    });
  }
});

// Get user's reviews
router.get("/me/reviews", async (req, res) => {
  try {
    const clerkId = req.auth.clerkId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const reviews = await Review.find({ user: user._id })
      .populate("book", "title author coverImage")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ user: user._id });

    res.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching review history:", error);
    res.status(500).json({
      error: "Failed to fetch review history",
      details: error.message,
    });
  }
});

// Update user preferences
router.put("/me/preferences", async (req, res) => {
  try {
    const clerkId = req.auth.clerkId;
    const { theme, notifications } = req.body;

    const updateData = {};
    if (theme !== undefined) updateData["preferences.theme"] = theme;
    if (notifications !== undefined)
      updateData["preferences.notifications"] = notifications;

    const user = await User.findOneAndUpdate(
      { clerkId },
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({
      error: "Failed to update preferences",
      details: error.message,
    });
  }
});

export default router;