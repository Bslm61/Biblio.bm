import express from "express";
import {
  getAllBooks,
  getBookById,
  searchBooks,
  getGenres,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
import { requireAuth, checkAdmin } from "../middleware/clerkMiddleware.js";

const router = express.Router();

// Public routes (no auth needed)
router.get("/genres", getGenres);
router.get("/search/:query", searchBooks);
router.get("/", getAllBooks);
router.get("/:id", getBookById);

// Admin routes (token + admin check)
router.post("/", requireAuth, checkAdmin, createBook);
router.put("/:id", requireAuth, checkAdmin, updateBook);
router.delete("/:id", requireAuth, checkAdmin, deleteBook);

export default router;