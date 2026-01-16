import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

// Common IANA timezone identifiers (can be expanded)
const VALID_TIMEZONES = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
    'UTC',
];

/**
 * Get current user's preferences
 */
export const getMyPreferences = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUserOrThrow(ctx);

        const preferences = await ctx.db
            .query('userPreferences')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .unique();

        return preferences;
    },
});

/**
 * Initialize preferences for a new user with sensible defaults
 */
export const initializePreferences = mutation({
    args: {
        userId: v.id('users'),
        timezone: v.optional(v.string()),
        locale: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if preferences already exist
        const existing = await ctx.db
            .query('userPreferences')
            .withIndex('by_userId', (q) => q.eq('userId', args.userId))
            .unique();

        if (existing) {
            return existing._id;
        }

        // Create new preferences with defaults
        const preferencesId = await ctx.db.insert('userPreferences', {
            userId: args.userId,
            timezone: args.timezone || 'UTC',
            locale: args.locale || 'en-US',
            emailNotifications: true,
            pushNotifications: true,
        });

        return preferencesId;
    },
});

/**
 * Update user preferences
 */
export const updatePreferences = mutation({
    args: {
        timezone: v.optional(v.string()),
        defaultWalletId: v.optional(v.union(v.id('wallets'), v.null())),
        locale: v.optional(v.string()),
        dailySpendingLimit: v.optional(v.union(v.number(), v.null())),
        transactionConfirmThreshold: v.optional(v.union(v.number(), v.null())),
        emailNotifications: v.optional(v.boolean()),
        pushNotifications: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        // Validate timezone
        if (args.timezone && !VALID_TIMEZONES.includes(args.timezone)) {
            throw new ConvexError('Invalid timezone. Please select a valid IANA timezone.');
        }

        // Validate default wallet exists and belongs to user
        if (args.defaultWalletId) {
            const wallet = await ctx.db.get(args.defaultWalletId);
            if (!wallet) {
                throw new ConvexError('Default wallet not found.');
            }
            if (wallet.userId !== user._id) {
                throw new ConvexError('You do not have permission to set this wallet as default.');
            }
            if (wallet.isArchived) {
                throw new ConvexError('Cannot set an archived wallet as default.');
            }
        }

        // Validate spending limits are positive
        if (args.dailySpendingLimit !== undefined && args.dailySpendingLimit !== null && args.dailySpendingLimit < 0) {
            throw new ConvexError('Daily spending limit must be a positive number.');
        }
        if (args.transactionConfirmThreshold !== undefined && args.transactionConfirmThreshold !== null && args.transactionConfirmThreshold < 0) {
            throw new ConvexError('Transaction confirmation threshold must be a positive number.');
        }

        // Find existing preferences
        const existing = await ctx.db
            .query('userPreferences')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .unique();

        // Build update object with only provided fields
        const updates: Record<string, any> = {};
        if (args.timezone !== undefined) updates.timezone = args.timezone;
        if (args.defaultWalletId !== undefined) updates.defaultWalletId = args.defaultWalletId;
        if (args.locale !== undefined) updates.locale = args.locale;
        if (args.dailySpendingLimit !== undefined) updates.dailySpendingLimit = args.dailySpendingLimit;
        if (args.transactionConfirmThreshold !== undefined) updates.transactionConfirmThreshold = args.transactionConfirmThreshold;
        if (args.emailNotifications !== undefined) updates.emailNotifications = args.emailNotifications;
        if (args.pushNotifications !== undefined) updates.pushNotifications = args.pushNotifications;

        if (existing) {
            // Update existing preferences
            if (Object.keys(updates).length > 0) {
                await ctx.db.patch(existing._id, updates);
            }
            return existing._id;
        } else {
            // Create new preferences if they don't exist
            const preferencesId = await ctx.db.insert('userPreferences', {
                userId: user._id,
                timezone: args.timezone || 'UTC',
                defaultWalletId: args.defaultWalletId || undefined,
                locale: args.locale || 'en-US',
                dailySpendingLimit: args.dailySpendingLimit || undefined,
                transactionConfirmThreshold: args.transactionConfirmThreshold || undefined,
                emailNotifications: args.emailNotifications ?? true,
                pushNotifications: args.pushNotifications ?? true,
            });
            return preferencesId;
        }
    },
});
