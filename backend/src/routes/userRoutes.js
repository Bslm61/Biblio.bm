import express from "express";
import { requireAuth } from "../middleware/clerkMiddleware.js";
import User from "../models/UserModel/User.js";

const router = express.Router();

// ============================================
// 👑 MAKE USER ADMIN (FOR TESTING ONLY)
// ============================================
// 📝 Route: PUT /api/users/make-admin
// 🔐 Requires: Clerk token
// 💡 Does: Sets logged-in user as admin in MongoDB

router.put("/make-admin", requireAuth, async (req, res) => {
  try {
    // 👤 Get clerkId from token
    const clerkId = req.auth.clerkId;

    console.log(`🔍 Looking for user with clerkId: ${clerkId}`);

    // 🔄 Find user and update isAdmin to true
    const user = await User.findOneAndUpdate(
      { clerkId }, // 🔍 Search by clerkId
      { isAdmin: true }, // ✏️ Update isAdmin to true
      { new: true } // 📤 Return updated document
    );

    if (!user) {
      return res.status(404).json({
        error: "❌ User not found in database",
        status: 404,
        details: `No user found with clerkId: ${clerkId}`,
      });
    }

    // ✅ Success!
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
    console.error("❌ Error in make-admin route:", error);
    res.status(500).json({
      error: "Failed to update user to admin",
      status: 500,
      details: error.message,
    });
  }
});

export default router;