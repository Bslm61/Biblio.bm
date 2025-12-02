import Review from "../models/ReviewModel/Review.js";
import Book from "../models/BookModel/Book.js";
import Rental from "../models/RentalModel/Rental.js";
import User from "../models/UserModel/User.js";

// Create review
export const createReview = async (req, res) => {
  try {
    const { bookId, rating, reviewText } = req.body;
    const clerkId = req.auth.clerkId;

    // Validation
    if (!bookId || !rating || !reviewText) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    if (reviewText.length < 10 || reviewText.length > 2000) {
      return res.status(400).json({
        error: "Review text must be between 10 and 2000 characters",
      });
    }

    // Get user
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Verify user rented this book
    const rental = await Rental.findOne({
      user: user._id,
      book: bookId,
      status: { $in: ["active", "completed"] },
    });

    if (!rental) {
      return res.status(400).json({
        error: "You must rent this book before reviewing it",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: user._id,
      book: bookId,
    });

    if (existingReview) {
      return res.status(400).json({
        error: "You already reviewed this book",
      });
    }

    // Create review
    const review = new Review({
      user: user._id,
      book: bookId,
      rental: rental._id,
      rating,
      reviewText,
      isVerifiedPurchase: true,
    });

    await review.save();

    // Update book rating
    await updateBookRating(bookId);

    res.status(201).json({
      message: "Review created successfully",
      review: {
        _id: review._id,
        rating: review.rating,
        reviewText: review.reviewText,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({
      error: "Failed to create review",
      details: error.message,
    });
  }
};

// Get book reviews
export const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const sortBy = req.query.sortBy || "createdAt"; // newest, helpful, rating
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Build sort object
    let sortObj = {};
    if (sortBy === "newest") sortObj = { createdAt: -1 };
    if (sortBy === "helpful") sortObj = { helpfulCount: -1 };
    if (sortBy === "rating") sortObj = { rating: -1 };

    // Get reviews
    const reviews = await Review.find({ book: bookId })
      .populate("user", "username profile.avatar")
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ book: bookId });

    res.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      error: "Failed to fetch reviews",
      details: error.message,
    });
  }
};

// Get user reviews
export const getUserReviews = async (req, res) => {
  try {
    const clerkId = req.auth.clerkId;

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const reviews = await Review.find({ user: user._id })
      .populate("book", "title author coverImage")
      .sort({ createdAt: -1 });

    res.json({
      reviews,
      total: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({
      error: "Failed to fetch user reviews",
      details: error.message,
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;
    const clerkId = req.auth.clerkId;

    const user = await User.findOne({ clerkId });

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    // Verify ownership
    if (review.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    // Validate
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    if (reviewText && (reviewText.length < 10 || reviewText.length > 2000)) {
      return res.status(400).json({
        error: "Review text must be between 10 and 2000 characters",
      });
    }

    // Update
    if (rating) review.rating = rating;
    if (reviewText) review.reviewText = reviewText;

    await review.save();

    // Update book rating
    await updateBookRating(review.book);

    res.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      error: "Failed to update review",
      details: error.message,
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.clerkId;

    const user = await User.findOne({ clerkId });

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    // Verify ownership
    if (review.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const bookId = review.book;
    await Review.findByIdAndDelete(id);

    // Update book rating
    await updateBookRating(bookId);

    res.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      error: "Failed to delete review",
      details: error.message,
    });
  }
};

// Mark review as helpful
export const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        error: "Review not found",
      });
    }

    res.json({
      message: "Review marked as helpful",
      helpfulCount: review.helpfulCount,
    });
  } catch (error) {
    console.error("Error marking helpful:", error);
    res.status(500).json({
      error: "Failed to mark helpful",
      details: error.message,
    });
  }
};

// Internal function to update book rating
async function updateBookRating(bookId) {
  try {
    const reviews = await Review.find({ book: bookId });

    if (reviews.length === 0) {
      await Book.findByIdAndUpdate(bookId, {
        averageRating: 0,
        totalReviews: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Book.findByIdAndUpdate(bookId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error updating book rating:", error);
  }
}
