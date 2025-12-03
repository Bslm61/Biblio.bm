import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    // ============================================
    // REFERENCES TO OTHER MODELS
    // ============================================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book is required'],
    },

    // ============================================
    // RENTAL DATES
    // ============================================
    rentalStartDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },

    rentalEndDate: {
      type: Date,
      required: [true, 'End date is required'],
      // Calculated as: rentalStartDate + rentalDays
    },

    rentalDays: {
      type: Number,
      required: [true, 'Rental days is required'],
      min: [1, 'Rental must be at least 1 day'],
      max: [7, 'Rental cannot exceed 7 days'],
    },

    // ============================================
    // PRICING
    // ============================================
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Price cannot be negative'],
      // Calculated as: rentalDays × book.rentalPricePerDay
    },

    // ============================================
    // STATUS & PROGRESS
    // ============================================
    status: {
      type: String,
      enum: ['active', 'expired', 'completed'],
      default: 'active',
    },

    readingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      // Percentage of book read (0-100%)
    },
  },
  { timestamps: true }
);

// ============================================
// VIRTUAL FIELD: Days Remaining
// ============================================
rentalSchema.virtual('daysRemaining').get(function () {
  const today = new Date();
  const diffTime = this.rentalEndDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
});

// Include virtuals when converting to JSON
rentalSchema.set('toJSON', { virtuals: true });

// ============================================
// INDEXES for faster queries
// ============================================
rentalSchema.index({ user: 1, status: 1 });
// Query: Get user's active rentals
rentalSchema.index({ rentalEndDate: 1 });
// Query: Find expired rentals

const Rental = mongoose.model('Rental', rentalSchema);
export default Rental;