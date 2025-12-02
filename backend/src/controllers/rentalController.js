// src/controllers/rentalController.js

import Rental from "../models/RentalModel/Rental.js";
import Book from "../models/BookModel/Book.js";
import User from "../models/UserModel/User.js";

// Create rental (checkout)
export const createRental = async (req, res) => {
  try {
    const { bookId, rentalDays } = req.body;
    const clerkId = req.auth.clerkId;

    // Validation
    if (!bookId || !rentalDays) {
      return res.status(400).json({
        error: "Missing bookId or rentalDays",
      });
    }

    if (rentalDays < 1 || rentalDays > 7) {
      return res.status(400).json({
        error: "Rental days must be between 1 and 7",
      });
    }

    // Get book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    // Get user
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Check if user already has active rental for this book
    const existingRental = await Rental.findOne({
      user: user._id,
      book: bookId,
      status: "active",
    });

    if (existingRental) {
      return res.status(400).json({
        error: "You already have an active rental for this book",
      });
    }

    // Calculate price
    const totalPrice = rentalDays * book.rentalPricePerDay;

    // Calculate end date
    const rentalStartDate = new Date();
    const rentalEndDate = new Date();
    rentalEndDate.setDate(rentalEndDate.getDate() + rentalDays);

    // Create rental
    const rental = new Rental({
      user: user._id,
      book: bookId,
      rentalStartDate,
      rentalEndDate,
      rentalDays,
      totalPrice,
      status: "active",
    });

    await rental.save();

    res.status(201).json({
      message: "Rental created successfully",
      rental: {
        _id: rental._id,
        book: book.title,
        totalPrice,
        rentalDays,
        rentalEndDate,
        status: rental.status,
      },
    });
  } catch (error) {
    console.error("Error creating rental:", error);
    res.status(500).json({
      error: "Failed to create rental",
      details: error.message,
    });
  }
};

// Get user's rentals
export const getUserRentals = async (req, res) => {
  try {
    const clerkId = req.auth.clerkId;
    const status = req.query.status; // active, expired, completed

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Build filter
    const filter = { user: user._id };
    if (status) {
      filter.status = status;
    }

    // Get rentals
    const rentals = await Rental.find(filter)
      .populate("book", "title author coverImage")
      .sort({ rentalEndDate: -1 });

    res.json({
      rentals,
      total: rentals.length,
    });
  } catch (error) {
    console.error("Error fetching rentals:", error);
    res.status(500).json({
      error: "Failed to fetch rentals",
      details: error.message,
    });
  }
};

// Get single rental
export const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.clerkId;

    const rental = await Rental.findById(id).populate("book");

    if (!rental) {
      return res.status(404).json({
        error: "Rental not found",
      });
    }

    // Check if rental belongs to user
    const user = await User.findOne({ clerkId });
    if (rental.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden: This rental does not belong to you",
      });
    }

    // Check if rental is expired
    const now = new Date();
    if (now > rental.rentalEndDate) {
      rental.status = "expired";
      await rental.save();
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (rental.rentalEndDate - now) / (1000 * 60 * 60 * 24)
    );

    res.json({
      rental: {
        _id: rental._id,
        book: rental.book,
        totalPrice: rental.totalPrice,
        rentalDays: rental.rentalDays,
        rentalStartDate: rental.rentalStartDate,
        rentalEndDate: rental.rentalEndDate,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        status: rental.status,
        readingProgress: rental.readingProgress,
        pdfUrl: rental.status === "active" ? rental.book.pdfUrl : null,
      },
    });
  } catch (error) {
    console.error("Error fetching rental:", error);
    res.status(500).json({
      error: "Failed to fetch rental",
      details: error.message,
    });
  }
};

// Update reading progress
export const updateReadingProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const clerkId = req.auth.clerkId;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        error: "Progress must be between 0 and 100",
      });
    }

    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({
        error: "Rental not found",
      });
    }

    // Check ownership
    const user = await User.findOne({ clerkId });
    if (rental.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    rental.readingProgress = progress;
    await rental.save();

    res.json({
      message: "Reading progress updated",
      readingProgress: rental.readingProgress,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      error: "Failed to update progress",
      details: error.message,
    });
  }
};

// Cancel rental
export const cancelRental = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.clerkId;

    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({
        error: "Rental not found",
      });
    }

    // Check ownership
    const user = await User.findOne({ clerkId });
    if (rental.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    // Can only cancel active rentals
    if (rental.status !== "active") {
      return res.status(400).json({
        error: "Can only cancel active rentals",
      });
    }

    rental.status = "completed";
    await rental.save();

    res.json({
      message: "Rental cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling rental:", error);
    res.status(500).json({
      error: "Failed to cancel rental",
      details: error.message,
    });
  }
};