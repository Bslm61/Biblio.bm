const reviewSchema = new mongoose.Schema(
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

    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: [true, 'Rental is required'],
      // Ensures user actually rented the book
    },

    // ============================================
    // RATING & REVIEW TEXT
    // ============================================
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },

    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
    },

    // ============================================
    // FEEDBACK ON REVIEW
    // ============================================
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
      // How many users found this review helpful
    },

    unhelpfulCount: {
      type: Number,
      default: 0,
      min: 0,
      // How many users found this review unhelpful
    },

    // ============================================
    // VERIFICATION
    // ============================================
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
      // True because we verify user rented the book via rental reference
    },
  },
  { timestamps: true }
);

// ============================================
// UNIQUE INDEX - One review per user per book
// ============================================
reviewSchema.index({ user: 1, book: 1 }, { unique: true });
// Prevents duplicate reviews from same user on same book

// ============================================
// INDEX for sorting reviews by book
// ============================================
reviewSchema.index({ book: 1, createdAt: -1 });
// Get reviews for a book sorted by newest first

const Review = mongoose.model('Review', reviewSchema);
export default Review;