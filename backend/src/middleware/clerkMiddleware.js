import { clerkClient } from "@clerk/clerk-sdk-node";
import User from "../models/UserModel/User.js";

// Verify Clerk token and extract user info
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized: Missing or invalid token",
        status: 401,
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await clerkClient.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized: Invalid token",
        status: 401,
        timestamp: new Date().toISOString(),
      });
    }

    const clerkId = decoded.sub;
    req.auth = {
      clerkId,
      email: decoded.email,
    };

    // Fetch user from database and check admin status
    const user = await User.findOne({ clerkId });

    if (user) {
      req.user = user;
      req.auth.isAdmin = user.role === "admin" || user.isAdmin;
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      error: "Unauthorized: Token verification failed",
      status: 401,
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Fetch user from database and attach admin status
export const attachUserToRequest = async (req, res, next) => {
  try {
    const clerkId = req.auth?.clerkId;

    if (!clerkId) {
      return res.status(401).json({
        error: "Unauthorized: No user ID found",
        status: 401,
        timestamp: new Date().toISOString(),
      });
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      console.log(`User ${clerkId} not found in DB yet`);
      req.user = null;
      req.auth.isAdmin = false;
    } else {
      req.user = user;
      req.auth.isAdmin = user.isAdmin === true || user.role === "admin";
    }

    next();
  } catch (error) {
    console.error("Error in attachUserToRequest:", error);
    return res.status(500).json({
      error: "Server error while fetching user",
      status: 500,
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Extract Clerk user ID from token
export const getUserId = (req) => {
  return req.auth?.clerkId;
};

// Extract email from token
export const getEmail = (req) => {
  return req.auth?.email || null;
};

// Get full auth object
export const getAuthFromRequest = (req) => {
  return req.auth || null;
};