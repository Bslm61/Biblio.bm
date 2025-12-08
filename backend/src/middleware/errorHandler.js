// src/middleware/errorHandler.js

// Custom Error Class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation Error
export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

// Authentication Error
export class AuthenticationError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

// Authorization Error
export class AuthorizationError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

// Not Found Error
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

// Conflict Error (duplicate key, etc)
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

// ============================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ============================================
// Must be LAST middleware in server.js

export const errorHandler = (err, req, res, next) => {
  // Default error
  let error = {
    message: err.message || "Server Error",
    statusCode: err.statusCode || 500,
  };

  // Log error for debugging
  console.error(`❌ [${error.statusCode}] ${error.message}`);

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = {
      message: "Validation Error",
      statusCode: 400,
      details: messages,
    };
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = {
      message: `${field} already exists`,
      statusCode: 409,
      details: `${field} must be unique`,
    };
  }

  // Handle Mongoose Cast Error
  if (err.name === "CastError") {
    error = {
      message: "Invalid ID format",
      statusCode: 400,
      details: `Invalid ${err.kind}: ${err.value}`,
    };
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    error = {
      message: "Invalid token",
      statusCode: 401,
      details: "Token verification failed",
    };
  }

  if (err.name === "TokenExpiredError") {
    error = {
      message: "Token expired",
      statusCode: 401,
      details: "Please login again",
    };
  }

  // Send error response
  res.status(error.statusCode).json({
    error: error.message,
    status: error.statusCode,
    ...(error.details && { details: error.details }),
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

// ============================================
// VALIDATION HELPERS
// ============================================

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateUsername = (username) => {
  if (!username) return false;
  if (username.length < 3 || username.length > 30) return false;
  return /^[a-zA-Z0-9_-]+$/.test(username);
};

export const validateRentalDays = (days) => {
  const num = parseInt(days);
  return num >= 1 && num <= 7;
};

export const validateRating = (rating) => {
  const num = parseInt(rating);
  return num >= 1 && num <= 5;
};

export const validateReviewText = (text) => {
  if (!text) return false;
  const length = text.trim().length;
  return length >= 10 && length <= 2000;
};

export const validateBookDescription = (desc) => {
  if (!desc) return false;
  const length = desc.trim().length;
  return length >= 10 && length <= 5000;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ============================================
// ASYNC HANDLER (Wrap async routes to catch errors)
// ============================================

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};