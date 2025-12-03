// src/controllers/paymentController.js

import Stripe from "stripe";
import Payment from "../models/PaymentModel/Payment.js";
import Rental from "../models/RentalModel/Rental.js";
import User from "../models/UserModel/User.js";


// Create payment intent for rental
export const createPaymentIntent = async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { rentalId } = req.body;
    const clerkId = req.auth.clerkId;

    if (!rentalId) {
      return res.status(400).json({
        error: "Rental ID required",
      });
    }

    // Get rental
    const rental = await Rental.findById(rentalId).populate("book");
    if (!rental) {
      return res.status(404).json({
        error: "Rental not found",
      });
    }

    // Verify ownership
    const user = await User.findOne({ clerkId });
    if (rental.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(rental.totalPrice * 100), // Convert to cents
      currency: "usd",
      metadata: {
        rentalId: rentalId.toString(),
        userId: user._id.toString(),
        bookId: rental.book._id.toString(),
      },
    });

    // Create payment record in MongoDB (pending)
    const payment = new Payment({
      user: user._id,
      rental: rentalId,
      amount: rental.totalPrice,
      currency: "USD",
      paymentMethod: "stripe",
      stripePaymentId: paymentIntent.id,
      status: "pending",
      description: `Rental of "${rental.book.title}" for ${rental.rentalDays} days`,
    });

    await payment.save();

    res.json({
      message: "Payment intent created",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: rental.totalPrice,
      rentalId: rentalId,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      error: "Failed to create payment intent",
      details: error.message,
    });
  }
};

// Confirm payment (after frontend processes)
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const clerkId = req.auth.clerkId;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: "Payment intent ID required",
      });
    }

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        error: "Payment not succeeded",
        status: paymentIntent.status,
      });
    }

    // Update payment in MongoDB
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentId: paymentIntentId },
      { status: "succeeded" },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        error: "Payment record not found",
      });
    }

    // Update user wallet (deduct from balance)
    const user = await User.findById(payment.user);
    user.wallet.totalSpent += payment.amount;
    await user.save();

    // Update rental status to active (already active, but confirm)
    const rental = await Rental.findById(payment.rental);
    rental.status = "active";
    await rental.save();

    res.json({
      message: "Payment confirmed successfully",
      payment: {
        _id: payment._id,
        amount: payment.amount,
        status: payment.status,
        rentalId: payment.rental,
      },
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      error: "Failed to confirm payment",
      details: error.message,
    });
  }
};

// Handle Stripe webhook
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle payment_intent.succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      // Update payment status
      await Payment.findOneAndUpdate(
        { stripePaymentId: paymentIntent.id },
        { status: "succeeded" }
      );

      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
    }

    // Handle payment_intent.payment_failed
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      // Update payment status
      await Payment.findOneAndUpdate(
        { stripePaymentId: paymentIntent.id },
        { status: "failed" }
      );

      console.log(`❌ Payment failed: ${paymentIntent.id}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const clerkId = req.auth.clerkId;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const payments = await Payment.find({ user: user._id })
      .populate("rental", "rentalDays rentalEndDate")
      .sort({ createdAt: -1 });

    res.json({
      payments,
      total: payments.length,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      error: "Failed to fetch payment history",
      details: error.message,
    });
  }
};

// Refund payment
export const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const clerkId = req.auth.clerkId;

    if (!paymentId) {
      return res.status(400).json({
        error: "Payment ID required",
      });
    }

    // Get payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        error: "Payment not found",
      });
    }

    // Verify ownership
    const user = await User.findOne({ clerkId });
    if (payment.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    // Create refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
    });

    // Update payment status
    payment.status = "refunded";
    await payment.save();

    res.json({
      message: "Payment refunded successfully",
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error("Error refunding payment:", error);
    res.status(500).json({
      error: "Failed to refund payment",
      details: error.message,
    });
  }
};