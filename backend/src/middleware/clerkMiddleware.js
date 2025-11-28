import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';


// Middleware that requires authentication
export const requireAuth = ClerkExpressRequireAuth();


// Optional: Helper to extract user ID from token
// export const getUserIdFromAuth = (req) => {
//   return req.auth?.userId;
// };


// Optional: Helper to extract email from token
// export const getEmailFromAuth = (req) => {
//   return req.auth?.emailAddresses?.[0]?.emailAddress;
// };