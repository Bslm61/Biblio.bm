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
import { requireAuth, attachUserToRequest } from "../middleware/clerkMiddleware.js"; // 👈 ADD attachUserToRequest

const router = express.Router();

// ============================================
// ADMIN PROTECTION MIDDLEWARE
// ============================================
// 👑 Check if user is admin
const checkAdmin = (req, res, next) => {
  const isAdmin = req.auth?.isAdmin || req.user?.role === "admin";
  
  if (!isAdmin) {
    return res.status(403).json({
      error: "Forbidden: Admin access required",
      status: 403,
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

// ============================================
// PUBLIC ROUTES (No token needed)
// ============================================
// 📖 Get all genres
router.get("/genres", getGenres);

// 🔍 Search books (BEFORE /:id route!)
router.get("/search/:query", searchBooks);

// 📚 Get all books with pagination
router.get("/", getAllBooks);

// 📖 Get single book by ID (LAST - most generic)
router.get("/:id", getBookById);

// ============================================
// ADMIN ROUTES (Token + Admin required)
// ============================================
// 👑 Add: requireAuth → check token
// 👑 Add: attachUserToRequest → get admin status from DB
// 👑 Add: checkAdmin → verify is admin
// 👑 Then: createBook/updateBook/deleteBook

// ✏️ Create book (admin only)
router.post("/", requireAuth, attachUserToRequest, checkAdmin, createBook);

// ✏️ Update book (admin only)
router.put("/:id", requireAuth, attachUserToRequest, checkAdmin, updateBook);

// 🗑️ Delete book (admin only)
router.delete("/:id", requireAuth, attachUserToRequest, checkAdmin, deleteBook);

export default router;