/**
 * Centralized environment variable configuration
 * All environment variables should be imported from this file
 */

// Clerk Authentication
export const CLERK_JWT_ISSUER_DOMAIN = process.env.CLERK_JWT_ISSUER_DOMAIN;
export const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
