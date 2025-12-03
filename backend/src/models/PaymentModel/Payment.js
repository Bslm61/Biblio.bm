import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // ============================================
    // REFERENCES TO OTHER MODELS
    // ============================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: [true, 'Rental is required'],
    },

    // ============================================
    // PAYMENT DETAILS
    // ============================================
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },

    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD'],
    },

    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'card'],
      default: 'stripe',
    },

    // ============================================
    // STRIPE INFORMATION
    // ============================================
    stripePaymentId: {
      type: String,
      // Stripe transaction ID from payment intent
    },

    // ============================================
    // PAYMENT STATUS
    // ============================================
    status: {
      type: String,
      enum: ['succeeded', 'failed', 'pending', 'refunded'],
      default: 'pending',
    },

    // ============================================
    // ADDITIONAL INFO
    // ============================================
    transactionDate: {
      type: Date,
      default: Date.now,
    },

    description: {
      type: String,
      // e.g., "Book rental: The Great Gatsby for 3 days"
    },

    metadata: {
      type: Object,
      // Store additional data if needed
    },
  },
  { timestamps: true }
);

// ============================================
// INDEXES for faster queries
// ============================================
paymentSchema.index({ user: 1, createdAt: -1 });
// Query: Get user's payment history
paymentSchema.index({ status: 1 });
// Query: Find payments by status

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;