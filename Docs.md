# 📚 BIBLIOTHEQUE-BM API Documentation

## Quick Start for Frontend Team

**API Base URL:** `http://localhost:5000/api`

**Authentication:** All endpoints (except `/health`) require Clerk JWT token in header:
```
Authorization: Bearer [clerk_jwt_token]
```

---

## 🔐 Authentication Endpoints

### 1. Sync User Profile
**Endpoint:** `POST /clerk/sync-user`

**Purpose:** Create/update user in MongoDB when they login (call this after Clerk login)

**Headers:**
```
Authorization: Bearer [clerk_token]
Content-Type: application/json
```

**Response:**
```json
{
  "message": "User synced successfully",
  "user": {
    "_id": "mongodb_id",
    "clerkId": "user_xxx",
    "email": "user@example.com",
    "username": null,
    "profile": {
      "bio": "",
      "avatar": null
    }
  }
}
```

**Error (400):**
```json
{
  "error": "Missing user information from Clerk"
}
```

**When to call:** Right after Clerk authentication succeeds

---

### 2. Get Current User Profile
**Endpoint:** `GET /clerk/me`

**Purpose:** Get logged-in user's full profile

**Headers:**
```
Authorization: Bearer [clerk_token]
Content-Type: application/json
```

**Response:**
```json
{
  "user": {
    "_id": "mongodb_id",
    "clerkId": "user_xxx",
    "email": "user@example.com",
    "username": "john_doe",
    "profile": {
      "bio": "I love reading",
      "avatar": "https://example.com/avatar.jpg"
    },
    "wallet": {
      "balance": 0,
      "totalSpent": 0
    },
    "preferences": {
      "theme": "light",
      "notifications": true
    },
    "isActive": true,
    "createdAt": "2024-01-16T10:30:00.000Z",
    "updatedAt": "2024-01-16T10:30:00.000Z"
  }
}
```

**Error (404):**
```json
{
  "error": "User not found"
}
```

**When to call:** On app load to populate user dashboard

---

### 3. Update User Profile
**Endpoint:** `PUT /clerk/me`

**Purpose:** Update user's bio, avatar, username, theme, notifications

**Headers:**
```
Authorization: Bearer [clerk_token]
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "new_username",
  "bio": "Updated bio",
  "avatar": "https://example.com/new-avatar.jpg",
  "theme": "dark",
  "notifications": false
}
```

**Note:** All fields are optional - send only what you want to update

**Response:**
```json
{
  "message": "User profile updated successfully",
  "user": {
    "_id": "mongodb_id",
    "clerkId": "user_xxx",
    "email": "user@example.com",
    "username": "new_username",
    "profile": {
      "bio": "Updated bio",
      "avatar": "https://example.com/new-avatar.jpg"
    },
    "preferences": {
      "theme": "dark",
      "notifications": false
    }
  }
}
```

**When to call:** When user updates their profile settings

---

## 🏥 Health Check

### Check Backend Status
**Endpoint:** `GET /health`

**Purpose:** Verify backend is running and database is connected

**No authentication needed**

**Response:**
```json
{
  "message": "✅ Backend Running",
  "database": "✅ connected",
  "timestamp": "2024-01-16T10:30:00.000Z",
  "environment": "development"
}
```

**Use case:** App startup to verify connection

---

## 📋 Future Endpoints (Coming Soon)

These endpoints are being built and will be documented soon:

- `GET /books` - Get all books (with pagination, filtering)
- `GET /books/:id` - Get single book details
- `POST /rentals/create-checkout` - Start book rental
- `GET /rentals/my-rentals` - Get user's rented books
- `POST /reviews` - Write a review
- `GET /books/:id/reviews` - Get book reviews

---

## 🔑 Getting Clerk Token

### In React Component:
```javascript
import { useAuth } from "@clerk/clerk-react";

function MyComponent() {
  const { getToken } = useAuth();

  const makeApiCall = async () => {
    const token = await getToken();
    
    const response = await fetch('http://localhost:5000/api/clerk/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    const data = await response.json();
    console.log(data);
  };

  return <button onClick={makeApiCall}>Get Profile</button>;
}
```

---

## 📝 Example Frontend Flow

### 1. User Signs Up (Clerk handles this)
```javascript
// Clerk UI handles registration
// User gets token automatically
```

### 2. App Initializes
```javascript
// 1. Check if user is logged in (Clerk)
// 2. Call POST /clerk/sync-user
// 3. Call GET /clerk/me
// 4. Store user in state/context
```

### 3. User Updates Profile
```javascript
// User clicks "Edit Profile"
// Form submission calls PUT /clerk/me
// Response updates local state
```

---

## 🚨 Error Handling

### Common Errors:

**401 Unauthorized** (Invalid/Missing token)
```json
{
  "error": "Unauthorized"
}
```
→ User needs to login again

**400 Bad Request** (Missing required fields)
```json
{
  "error": "Missing user information from Clerk"
}
```
→ Check request body

**404 Not Found** (User doesn't exist)
```json
{
  "error": "User not found"
}
```
→ User might need to sync first

**500 Server Error**
```json
{
  "error": "Failed to sync user",
  "details": "error message"
}
```
→ Backend issue - check logs

---

## 🧪 Testing Endpoints

### Using Fetch:
```javascript
// Sync User
const response = await fetch('http://localhost:5000/api/clerk/sync-user', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Get Profile
const response = await fetch('http://localhost:5000/api/clerk/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Update Profile
const response = await fetch('http://localhost:5000/api/clerk/me', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'new_name',
    bio: 'New bio'
  })
});
```

### Using Postman:
1. Get token from browser console (Clerk)
2. Add to Authorization header as Bearer token
3. Set request URL and method
4. Send request

---

## 📊 Data Types Reference

### User Object
```json
{
  "_id": "String (MongoDB ID)",
  "clerkId": "String (from Clerk)",
  "email": "String",
  "username": "String or null",
  "profile": {
    "bio": "String",
    "avatar": "String (URL) or null"
  },
  "wallet": {
    "balance": "Number",
    "totalSpent": "Number"
  },
  "preferences": {
    "theme": "String (light|dark)",
    "notifications": "Boolean"
  },
  "isActive": "Boolean",
  "createdAt": "ISO Date String",
  "updatedAt": "ISO Date String"
}
```

---


## 🚀 Environment Variables Needed

Make sure your `.env` has:
```
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=[from Clerk dashboard]
```

---



**Last Updated:** 2024-01-30
**Version:** 1.0
**Status:** Ready for Frontend Development
