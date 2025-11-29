import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    // ============================================
    // BASIC INFORMATION
    // ============================================
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      minlength: [2, 'Author name must be at least 2 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: [
        'Fiction',
        'Non-Fiction',
        'Science',
        'Technology',
        'History',
        'Biography',
        'Mystery',
        'Romance',
        'Thriller',
        'Fantasy',
        'Education',
        'Other',
      ],
    },

    // ============================================
    // MEDIA FILES
    // ============================================
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required'],
    },

    pdfUrl: {
      type: String,
      required: [true, 'PDF URL is required'],
    },

    // ============================================
    // RENTAL PRICING
    // ============================================
    rentalPricePerDay: {
      type: Number,
      required: [true, 'Rental price per day is required'],
      min: [0.01, 'Price must be greater than 0'],
    },

    // ============================================
    // RATINGS & REVIEWS
    // ============================================
    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ============================================
    // BOOK DETAILS
    // ============================================
    pageCount: {
      type: Number,
      required: [true, 'Page count is required'],
      min: 1,
    },

    publishedDate: {
      type: Date,
    },

    // ============================================
    // AVAILABILITY
    // ============================================
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ============================================
// TEXT INDEX for search functionality
// ============================================
bookSchema.index({ title: 'text', author: 'text', genre: 1 });

const Book = mongoose.model('Book', bookSchema);
export default Book;