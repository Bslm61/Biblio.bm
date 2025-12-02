import express from "express";
import {
  createReview,
  getBookReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markHelpful,
} from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/clerkMiddleware.js";

const router = express.Router();

// Public routes
router.get("/book/:bookId", getBookReviews);

// Protected routes
router.use(requireAuth);

// Create review
router.post("/", createReview);

// Get user reviews
router.get("/user/my-reviews", getUserReviews);

// Update review
router.put("/:id", updateReview);

// Delete review
router.delete("/:id", deleteReview);

// Mark review as helpful
router.post("/:id/helpful", markHelpful);

export default router;
