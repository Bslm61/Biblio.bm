// src/middleware/clerkMiddleware.js

import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Main middleware - requires authentication
export const requireAuth = ClerkExpressRequireAuth();

// Helper - get user ID from Clerk token
export const getUserIdFromAuth = (req) => {
  console.log('Auth object:', req.auth); // Debug log
  return req.auth?.userId;
};

// Helper - get email from Clerk token (FIXED)
export const getEmailFromAuth = (req) => {
  console.log('Full auth object:', JSON.stringify(req.auth, null, 2)); // Debug
  
  // Try multiple ways to get email
  const email = 
    req.auth?.emailAddresses?.[0]?.emailAddress ||
    req.auth?.primaryEmailAddressId ||
    req.auth?.email ||
    null;
    
  console.log('Extracted email:', email); // Debug
  return email;
};

// Helper - get full auth object
export const getAuthFromRequest = (req) => {
  return req.auth || null;
};