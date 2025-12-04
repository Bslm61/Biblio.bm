# 📚 BIBLIOTHEQUE-BM - Complete API Documentation

**API Base URL:** `http://localhost:5000/api`

---

## ⚡ Quick Reference

| Action | Method | Endpoint | Auth |
|--------|--------|----------|------|
| Get books | GET | `/books?page=1&limit=12` | ❌ |
| Search | GET | `/books/search/:query` | ❌ |
| Get book | GET | `/books/:id` | ❌ |
| Create book | POST | `/books` | ✅ Admin |
| Update book | PUT | `/books/:id` | ✅ Admin |
| Delete book | DELETE | `/books/:id` | ✅ Admin |
| Get rentals | GET | `/rentals` | ✅ |
| Create rental | POST | `/rentals` | ✅ |
| Get rental | GET | `/rentals/:id` | ✅ |
| Update progress | PUT | `/rentals/:id/reading-progress` | ✅ |
| Cancel rental | DELETE | `/rentals/:id` | ✅ |
| Create payment | POST | `/payments/create-payment-intent` | ✅ |
| Confirm payment | POST | `/payments/confirm-payment` | ✅ |
| Get payments | GET | `/payments/history` | ✅ |
| Refund | POST | `/payments/refund` | ✅ |
| Create review | POST | `/reviews` | ✅ |
| Get book reviews | GET | `/reviews/book/:id` | ❌ |
| Get my reviews | GET | `/reviews/user/my-reviews` | ✅ |
| Update review | PUT | `/reviews/:id` | ✅ |
| Delete review | DELETE | `/reviews/:id` | ✅ |
| Mark helpful | POST | `/reviews/:id/helpful` | ✅ |
| Sync user | POST | `/clerk/sync-user` | ✅ |
| Get profile | GET | `/clerk/me` | ✅ |
| Update profile | PUT | `/clerk/me` | ✅ |
| Health | GET | `/health` | ❌ |

---

## 🔐 Authentication

### Getting Token (React)
```typescript
import { useAuth } from "@clerk/clerk-react";

const { getToken } = useAuth();
const token = await getToken();

// Use in headers
headers: { Authorization: `Bearer ${token}` }
```

### Sync User After Login
```typescript
POST /clerk/sync-user
Authorization: Bearer [token]
```
Creates/updates user in MongoDB from Clerk

---

## 📚 Phase 4: Books

### Get All Books
```
GET /books?page=1&limit=12&genre=Fiction&minPrice=1&maxPrice=5&sortBy=createdAt
```
**Query Params:** `page`, `limit`, `genre`, `minPrice`, `maxPrice`, `sortBy`

**Response:**
```json
{
  "books": [
    {
      "_id": "string",
      "title": "string",
      "author": "string",
      "description": "string",
      "genre": "string",
      "coverImage": "url",
      "rentalPricePerDay": number,
      "totalReviews": number,
      "averageRating": number,
      "pageCount": number,
      "publishedDate": "date",
      "isAvailable": boolean
    }
  ],
  "total": number,
  "page": number,
  "pages": number,
  "limit": number
}
```

### Get Genres
```
GET /books/genres
```

### Search Books
```
GET /books/search/[query]?limit=20
```
Searches title, author, genre

### Get Single Book
```
GET /books/:id
```

### Create Book (Admin)
```
POST /books
Authorization: Bearer [admin_token]

{
  "title": "string (2+ chars)",
  "author": "string",
  "description": "string (10-5000 chars)",
  "genre": "Fiction|Non-Fiction|Science|...",
  "coverImage": "url",
  "pdfUrl": "url",
  "rentalPricePerDay": number,
  "pageCount": number,
  "publishedDate": "date"
}
```
**Response:** 201 with book object

### Update Book (Admin)
```
PUT /books/:id
Authorization: Bearer [admin_token]

{ "title": "new title", "rentalPricePerDay": 4.99 }
```

### Delete Book (Admin)
```
DELETE /books/:id
Authorization: Bearer [admin_token]
```
**Response:** `{ "message": "Book deleted successfully" }`

---

## 🏆 Phase 5: Rentals

### Create Rental
```
POST /rentals
Authorization: Bearer [token]

{
  "bookId": "book_id",
  "rentalDays": number (1-7)
}
```
**Response:** 201
```json
{
  "message": "Rental created successfully",
  "rental": {
    "_id": "rental_id",
    "book": "title",
    "totalPrice": number,
    "rentalDays": number,
    "rentalEndDate": "date",
    "status": "active"
  }
}
```
**Errors:**
- 400: rentalDays must be 1-7
- 400: Already have active rental for this book

### Get My Rentals
```
GET /rentals?status=active
Authorization: Bearer [token]

Query: status = "active" | "expired" | "completed" (optional)
```

### Get Single Rental
```
GET /rentals/:id
Authorization: Bearer [token]
```
**Response:**
```json
{
  "rental": {
    "_id": "rental_id",
    "book": { "title", "author", "coverImage" },
    "totalPrice": number,
    "daysRemaining": number,
    "status": "active",
    "readingProgress": number,
    "pdfUrl": "url (only if active)"
  }
}
```

### Update Reading Progress
```
PUT /rentals/:id/reading-progress
Authorization: Bearer [token]

{
  "progress": number (0-100)
}
```

### Cancel Rental
```
DELETE /rentals/:id
Authorization: Bearer [token]
```
**Response:** `{ "message": "Rental cancelled successfully" }`

---

## 💳 Phase 6: Payments

### Create Payment Intent
```
POST /payments/create-payment-intent
Authorization: Bearer [token]

{
  "rentalId": "rental_id"
}
```
**Response:**
```json
{
  "message": "Payment intent created",
  "clientSecret": "string",
  "paymentIntentId": "pi_xxx",
  "amount": number,
  "rentalId": "rental_id"
}
```

### Confirm Payment
```
POST /payments/confirm-payment
Authorization: Bearer [token]

{
  "paymentIntentId": "pi_xxx"
}
```

### Get Payment History
```
GET /payments/history
Authorization: Bearer [token]
```
**Response:**
```json
{
  "payments": [
    {
      "_id": "payment_id",
      "amount": number,
      "status": "succeeded|failed|pending",
      "createdAt": "date"
    }
  ],
  "total": number
}
```

### Refund Payment
```
POST /payments/refund
Authorization: Bearer [token]

{
  "paymentId": "payment_id"
}
```

---

## ⭐ Phase 7: Reviews

### Create Review
```
POST /reviews
Authorization: Bearer [token]

{
  "bookId": "book_id",
  "rating": number (1-5),
  "reviewText": "string (10-2000 chars)"
}
```
**Requirements:** User must have rented the book

**Errors:**
- 400: rating must be 1-5
- 400: reviewText 10-2000 chars
- 400: Must rent before reviewing
- 400: Already reviewed this book

### Get Book Reviews
```
GET /reviews/book/:bookId?sortBy=newest&page=1&limit=10

Query: sortBy = "newest" | "helpful" | "rating"
```

### Get My Reviews
```
GET /reviews/user/my-reviews
Authorization: Bearer [token]
```

### Update Review
```
PUT /reviews/:id
Authorization: Bearer [token]

{
  "rating": number?,
  "reviewText": "string?"
}
```

### Delete Review
```
DELETE /reviews/:id
Authorization: Bearer [token]
```

### Mark Helpful
```
POST /reviews/:id/helpful
Authorization: Bearer [token]
```

---

## 👤 User Profile

### Sync User (After Login)
```
POST /clerk/sync-user
Authorization: Bearer [token]
```
Creates/updates user in MongoDB

### Get User Profile
```
GET /clerk/me
Authorization: Bearer [token]
```

### Update User Profile
```
PUT /clerk/me
Authorization: Bearer [token]

{
  "username": "string?",
  "bio": "string?",
  "avatar": "url?",
  "theme": "light|dark?",
  "notifications": boolean?
}
```

---

## 🏥 Health Check

```
GET /health
```
**No auth needed**

**Response:**
```json
{
  "message": "✅ Backend Running",
  "database": "✅ Connected",
  "timestamp": "date",
  "environment": "development"
}
```

---

## 📊 TypeScript Types

```typescript
// Book
interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  coverImage: string;
  pdfUrl: string;
  rentalPricePerDay: number;
  totalReviews: number;
  averageRating: number;
  pageCount: number;
  publishedDate: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Rental
interface Rental {
  _id: string;
  user: string;
  book: Book;
  rentalStartDate: string;
  rentalEndDate: string;
  rentalDays: number;
  totalPrice: number;
  status: "active" | "expired" | "completed";
  readingProgress: number;
  daysRemaining: number;
  createdAt: string;
  updatedAt: string;
}

// Review
interface Review {
  _id: string;
  user: { username: string; avatar: string };
  book: string;
  rating: 1 | 2 | 3 | 4 | 5;
  reviewText: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

// Payment
interface Payment {
  _id: string;
  amount: number;
  currency: string;
  status: "succeeded" | "failed" | "pending" | "refunded";
  createdAt: string;
}

// User
interface User {
  _id: string;
  clerkId: string;
  email: string;
  username: string | null;
  profile: {
    bio: string;
    avatar: string | null;
  };
  wallet: {
    balance: number;
    totalSpent: number;
  };
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
  isAdmin: boolean;
  isActive: boolean;
}
```

---

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not admin/not owner) |
| 404 | Not Found |
| 500 | Server Error |

---

## 🚀 Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=[from Clerk dashboard]
```

---

## 💡 Common Patterns

### Fetch with Auth
```typescript
const fetchWithAuth = async (url: string, options = {}) => {
  const token = await getToken();
  
  return fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
```

### Error Handling
```typescript
try {
  const res = await fetchWithAuth('/books');
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  return await res.json();
} catch (error) {
  console.error('API Error:', error);
}
```

---

**Last Updated:** 2025-12-04
**Version:** 2.0 (Single consolidated doc)
**Status:** Complete & Ready
