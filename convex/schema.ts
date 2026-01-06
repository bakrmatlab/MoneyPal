import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    // Core users table (Clerk-backed)
    users: defineTable({
        fullName: v.string(),
        email: v.string(),
        username: v.optional(v.string()),
        clerkUserId: v.string(),
    }).index('by_clerkUserId', ['clerkUserId']),

    wallets: defineTable({
        userId: v.id('users'),
        name: v.optional(v.string()),
        balance: v.number(),
    }).index('by_userId', ['userId']),
});
