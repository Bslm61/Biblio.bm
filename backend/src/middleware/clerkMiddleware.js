import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';


// Middleware that requires authentication
export const requireAuth = ClerkExpressRequireAuth();


// ============================================
// HELPER - Get User ID from Clerk Token
// ============================================
export const getUserIdFromAuth = (req) => {
  return req.auth?.userId;
};
