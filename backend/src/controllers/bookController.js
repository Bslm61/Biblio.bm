import Book from "../models/BookModel/Book.js";

// Get all books with pagination and filtering
export const getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const genre = req.query.genre;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : 1000;
    const sortBy = req.query.sortBy || "createdAt";

    // Build filter object
    const filter = {
      rentalPricePerDay: { $gte: minPrice, $lte: maxPrice },
      isAvailable: true,
    };

    if (genre) {
      filter.genre = genre;
    }

    // Count total books
    const total = await Book.countDocuments(filter);

    // Fetch books
    const books = await Book.find(filter)
      .sort({ [sortBy]: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.json({
      books,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      error: "Failed to fetch books",
      details: error.message,
    });
  }
};

// Get single book by ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    res.json({ book });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({
      error: "Failed to fetch book",
      details: error.message,
    });
  }
};

// Search books by title, author, or genre
export const searchBooks = async (req, res) => {
  try {
    const query = req.params.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: "Search query is required",
      });
    }

    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
      ],
      isAvailable: true,
    }).limit(20);

    res.json({
      books,
      total: books.length,
    });
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).json({
      error: "Failed to search books",
      details: error.message,
    });
  }
};

// Get all genres
export const getGenres = async (req, res) => {
  try {
    const genres = await Book.distinct("genre");

    res.json({
      genres: genres.sort(),
    });
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({
      error: "Failed to fetch genres",
      details: error.message,
    });
  }
};

// Create new book (Admin only)
export const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      genre,
      coverImage,
      pdfUrl,
      rentalPricePerDay,
      pageCount,
      publishedDate,
    } = req.body;

    // Validation
    if (!title || !author || !description || !genre || !coverImage || !pdfUrl || !rentalPricePerDay || !pageCount) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const book = new Book({
      title,
      author,
      description,
      genre,
      coverImage,
      pdfUrl,
      rentalPricePerDay,
      pageCount,
      publishedDate,
    });

    await book.save();

    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({
      error: "Failed to create book",
      details: error.message,
    });
  }
};

// Update book (Admin only)
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    res.json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({
      error: "Failed to update book",
      details: error.message,
    });
  }
};

// Delete book (Admin only)
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    res.json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      error: "Failed to delete book",
      details: error.message,
    });
  }
};