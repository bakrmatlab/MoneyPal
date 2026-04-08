import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    // Core users table (Clerk-backed)
    users: defineTable({
        fullName: v.string(),
        email: v.string(),
        username: v.optional(v.string()),
        clerkUserId: v.string(),
    })
        .index('by_clerkUserId', ['clerkUserId'])
        .index('by_email', ['email']),

    wallets: defineTable({
        userId: v.id('users'),
        name: v.optional(v.string()),
        balance: v.number(),
        currency: v.optional(v.string()),
        color: v.optional(v.string()),
        icon: v.optional(v.string()),
        isArchived: v.optional(v.boolean()),
    }).index('by_userId', ['userId']),

    transactions: defineTable({
        userId: v.id('users'),
        walletId: v.id('wallets'),
        type: v.union(v.literal('deposit'), v.literal('withdrawal'), v.literal('transfer'), v.literal('e-transfer')),
        amount: v.number(),
        description: v.optional(v.string()),
        categoryId: v.optional(v.id('categories')),
        toWalletId: v.optional(v.id('wallets')),
        // E-transfer specific fields
        recipientEmail: v.optional(v.string()),
        recipientUserId: v.optional(v.id('users')),
        recipientWalletId: v.optional(v.id('wallets')),
        isOutgoing: v.optional(v.boolean()), // true = sent, false = received (for e-transfers)
        isDeleted: v.boolean(),
    })
        .index('by_userId', ['userId'])
        .index('by_walletId', ['walletId'])
        .index('by_type', ['type'])
        .index('by_categoryId', ['categoryId'])
        .index('by_recipientUserId', ['recipientUserId']),

    categories: defineTable({
        userId: v.id('users'),
        name: v.string(),
        type: v.union(v.literal('income'), v.literal('expense')),
        color: v.string(),
        icon: v.string(),
        isDefault: v.boolean(),
        isHidden: v.boolean(),
    })
        .index('by_userId', ['userId'])
        .index('by_userId_type', ['userId', 'type']),

    userPreferences: defineTable({
        userId: v.id('users'),
        timezone: v.string(), // IANA timezone, e.g., 'America/New_York'
        preferredCurrency: v.optional(v.string()), // Deprecated: kept for backward compatibility
        defaultWalletId: v.optional(v.id('wallets')),
        locale: v.optional(v.string()), // For date/number formatting, e.g., 'en-US'
        // Security settings (Phase 4)
        dailySpendingLimit: v.optional(v.number()),
        transactionConfirmThreshold: v.optional(v.number()), // Confirm above this amount
        // Notification settings
        emailNotifications: v.boolean(),
        pushNotifications: v.boolean(),
    }).index('by_userId', ['userId']),

    budgets: defineTable({
        userId: v.id('users'),
        amount: v.number(), // budget limit for this month
        month: v.number(), // 1–12
        year: v.number(), // e.g. 2026
        spent: v.number(), // cached sum of withdrawals + outgoing e-transfers
    })
        .index('by_userId', ['userId'])
        .index('by_userId_month_year', ['userId', 'month', 'year']),
});
