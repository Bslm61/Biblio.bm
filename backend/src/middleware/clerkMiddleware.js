import { clerkClient } from "@clerk/clerk-sdk-node";
import User from "../models/UserModel/User.js";

// Single middleware that handles: verify token + sync user + check admin
export const requireAuth = async (req, res, next) => {
  try {
    // 1️⃣ GET TOKEN FROM HEADER
    const token = req.headers.authorization?.split(" ")[1];
    console.log('Clerk Token:', token);

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: No token provided",
        status: 401,
      });
    }

    // 2️⃣ VERIFY TOKEN WITH CLERK
    const decoded = await clerkClient.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized: Invalid token",
        status: 401,
      });
    }

    // 3️⃣ GET CLERK ID FROM TOKEN
    const clerkId = decoded.sub;
    const email = decoded.email;

    // 4️⃣ SYNC USER TO MONGODB (create if doesn't exist)
    let user = await User.findOne({ clerkId });

    if (!user) {
      // First time - create user in MongoDB
      user = new User({
        clerkId,
        email,
      });
      await user.save();
      console.log(`✅ New user synced: ${email}`);
    }

    // 5️⃣ ATTACH TO REQUEST
    req.auth = {
      clerkId,
      email,
      isAdmin: user.isAdmin,
    };
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      error: "Unauthorized: Token verification failed",
      status: 401,
    });
  }
};

// Check if user is admin (use AFTER requireAuth)
export const checkAdmin = (req, res, next) => {
  if (!req.auth?.isAdmin) {
    return res.status(403).json({
      error: "Forbidden: Admin access required",
      status: 403,
    });
  }
  next();
};

// Helper functions
export const getUserId = (req) => req.auth?.clerkId;
export const getEmail = (req) => req.auth?.email;