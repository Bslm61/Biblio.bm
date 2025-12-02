// src/routes/rentalRoutes.js

import express from "express";
import {
  createRental,
  getUserRentals,
  getRentalById,
  updateReadingProgress,
  cancelRental,
} from "../controllers/rentalController.js";
import { requireAuth, checkAdmin } from "../middleware/clerkMiddleware.js";

const router = express.Router();

// All rental routes require authentication
router.use(requireAuth);

// Create rental
router.post("/", createRental);

// Get user's rentals
router.get("/", getUserRentals);

// Get single rental
router.get("/:id", getRentalById);

// Update reading progress
router.put("/:id/reading-progress", updateReadingProgress);

// Cancel rental
router.delete("/:id", cancelRental);

export default router;