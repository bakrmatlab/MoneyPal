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

    transactions: defineTable({
        userId: v.id('users'),
        walletId: v.id('wallets'),
        type: v.union(v.literal('deposit'), v.literal('withdrawal'), v.literal('transfer')),
        amount: v.number(),
        description: v.optional(v.string()),
        categoryId: v.optional(v.id('categories')),
        toWalletId: v.optional(v.id('wallets')),
        isDeleted: v.boolean(),
    }).index('by_userId', ['userId'])
        .index('by_walletId', ['walletId'])
        .index('by_type', ['type'])
        .index('by_categoryId', ['categoryId']),

    categories: defineTable({
        userId: v.id('users'),
        name: v.string(),
        type: v.union(v.literal('income'), v.literal('expense')),
        color: v.string(),
        icon: v.string(),
        isDefault: v.boolean(),
    }).index('by_userId', ['userId'])

});
