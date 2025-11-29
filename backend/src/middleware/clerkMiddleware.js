import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Middleware that requires authentication
export const requireAuth = ClerkExpressRequireAuth();

// ============================================
// HELPER - Get User ID from Clerk Token
// ============================================
export const getUserIdFromAuth = (req) => {
  return req.auth?.userId;
};

// ============================================
// HELPER - Get Email from Clerk Token
// ============================================
export const getEmailFromAuth = (req) => {
  return req.auth?.emailAddresses?.[0]?.emailAddress;
};

// ============================================
// HELPER - Get Full Auth Object
// ============================================
export const getAuthFromRequest = (req) => {
  return req.auth || null;
};