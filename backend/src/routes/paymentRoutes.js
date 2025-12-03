// src/routes/paymentRoutes.js

import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPaymentHistory,
  refundPayment,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/clerkMiddleware.js";

const router = express.Router();

// Webhook - NO authentication (Stripe sends this)
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

// All other routes require authentication
router.use(requireAuth);

// Create payment intent
router.post("/create-payment-intent", createPaymentIntent);

// Confirm payment
router.post("/confirm-payment", confirmPayment);

// Get payment history
router.get("/history", getPaymentHistory);

// Refund payment
router.post("/refund", refundPayment);

export default router;