import { UserJSON } from '@clerk/backend';
import { ConvexError, v, Validator } from 'convex/values';
import type { Doc } from './_generated/dataModel';
import { internalMutation, mutation, query, QueryCtx } from './_generated/server';

type User = Doc<'users'>;

export const current = query({
    args: {},
    handler: async (ctx): Promise<User | null> => {
        return await getCurrentUser(ctx);
    },
});

export const upsertFromClerk = internalMutation({
    args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
    returns: v.union(
        v.object({
            userId: v.id('users'),
            isNewUser: v.boolean(),
        }),
        v.null()
    ),
    async handler(ctx, { data }) {
        // Extract primary email from Clerk user data
        const primaryEmail = data.email_addresses?.find((email) => email.id === data.primary_email_address_id);
        const email = primaryEmail?.email_address || data.email_addresses?.[0]?.email_address || '';

        if (!email) {
            console.warn(`No email found for Clerk user ${data.id}`);
            return null;
        }

        const userAttributes = {
            fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unknown User',
            email,
            clerkUserId: data.id,
            username: data.username || undefined,
        };

        const user = await userByClerkUserId(ctx, data.id);

        if (user === null) {
            // Create new user
            const userId = await ctx.db.insert('users', { ...userAttributes, onboardingCompleted: false });
            console.log(`Created new user ${userId} for Clerk user ${data.id}`);

            // Initialize preferences for new user with browser-detected defaults
            try {
                // Attempt to detect timezone and locale (will default to UTC and en-US if not provided)
                await ctx.db.insert('userPreferences', {
                    userId,
                    timezone: 'UTC', // Default, frontend can update based on browser
                    locale: 'en-US', // Default, frontend can update based on browser
                    emailNotifications: true,
                    pushNotifications: true,
                });
                console.log(`Created preferences for new user ${userId}`);
            } catch (error) {
                console.error(`Failed to create preferences for user ${userId}:`, error);
                // Don't fail user creation if preferences fail
            }

            return { userId, isNewUser: true };
        } else {
            // Update existing user
            await ctx.db.patch(user._id, userAttributes);
            console.log(`Updated user ${user._id} for Clerk user ${data.id}`);

            return { userId: user._id, isNewUser: false };
        }
    },
});

export const ensureUserExists = mutation({
    args: {},
    returns: v.boolean(), // true = user was created, false = already existed
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return false;

        const existing = await userByClerkUserId(ctx, identity.subject);
        if (existing) return false;

        const userId = await ctx.db.insert('users', {
            clerkUserId: identity.subject,
            fullName: identity.name ?? identity.givenName ?? 'Unknown User',
            email: (identity.email as string | undefined) ?? '',
            username: (identity.nickname as string | undefined) ?? undefined,
            onboardingCompleted: false,
        });

        await ctx.db.insert('userPreferences', {
            userId,
            timezone: 'UTC',
            locale: 'en-US',
            emailNotifications: true,
            pushNotifications: true,
        });

        return true;
    },
});

export const markOnboardingComplete = mutation({
    args: {},
    returns: v.null(),
    handler: async (ctx) => {
        const user = await getCurrentUserOrThrow(ctx);
        await ctx.db.patch(user._id, { onboardingCompleted: true });
        return null;
    },
});

export const deleteFromClerk = internalMutation({
    args: { clerkUserId: v.string() },
    returns: v.null(),
    async handler(ctx, { clerkUserId }) {
        const user = await userByClerkUserId(ctx, clerkUserId);

        if (user !== null) {
            // Delete the user from Convex
            await ctx.db.delete(user._id);
            console.log(`Deleted user ${user._id} for Clerk user ${clerkUserId}`);
        } else {
            console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`);
        }

        return null;
    },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
    const userRecord = await getCurrentUser(ctx);
    if (!userRecord) throw new ConvexError('Unauthorized access');
    return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
        return null;
    }
    return await userByClerkUserId(ctx, identity.subject);
}

async function userByClerkUserId(ctx: QueryCtx, clerkUserId: string) {
    return await ctx.db
        .query('users')
        .withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
        .unique();
}

export const listUsers = query({
    args: {
        searchText: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUserOrThrow(ctx);
        const limit = args.limit ?? 100;

        // Get all users
        const allUsers = await ctx.db.query('users').collect();

        // Filter out current user
        let filteredUsers = allUsers.filter((u) => u._id !== currentUser._id);

        // Apply search filter if provided
        if (args.searchText) {
            const searchLower = args.searchText.toLowerCase();
            filteredUsers = filteredUsers.filter(
                (u) =>
                    u.fullName.toLowerCase().includes(searchLower) ||
                    u.email.toLowerCase().includes(searchLower) ||
                    u.username?.toLowerCase().includes(searchLower)
            );
        }

        // Limit results
        return filteredUsers.slice(0, limit).map((u) => ({
            _id: u._id,
            fullName: u.fullName,
            email: u.email,
            username: u.username,
        }));
    },
});
