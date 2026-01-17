import { v } from 'convex/values';
import { internal } from './_generated/api';
import { mutation, query } from './_generated/server';
import { getCurrentUser, getCurrentUserOrThrow } from './users';

export const getMyWallets = query({
    args: {
        includeArchived: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        
        // Return empty array if not authenticated
        if (!user) {
            return [];
        }

        const wallets = await ctx.db
            .query('wallets')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .collect();

        // Filter out archived wallets unless explicitly requested
        if (!args.includeArchived) {
            return wallets.filter((wallet) => !wallet.isArchived);
        }

        return wallets;
    },
});

export const getMyWallet = query({
    args: {
        walletId: v.id('wallets'),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        const wallet = await ctx.db.get(args.walletId);

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        return wallet;
    },
});

export const hasWalletTransactions = query({
    args: {
        walletId: v.id('wallets'),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        const wallet = await ctx.db.get(args.walletId);

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        // Check if wallet has any transaction history (including soft-deleted)
        const transaction = await ctx.db
            .query('transactions')
            .withIndex('by_walletId', (q) => q.eq('walletId', args.walletId))
            .first();

        return !!transaction;
    },
});

export const createWallet = mutation({
    args: {
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        const existingWallets = await ctx.db
            .query('wallets')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .first();

        if (!existingWallets) {
            await ctx.runMutation(internal.categories.seedDefaultCategories, {
                userId: user._id,
            });
        }

        const walletId = await ctx.db.insert('wallets', {
            userId: user._id,
            name: args.name ?? undefined,
            balance: 0,
            currency: 'USD',
            isArchived: false,
        });

        return walletId;
    },
});

export const deposit = mutation({
    args: {
        walletId: v.id('wallets'),
        amount: v.number(),
        description: v.optional(v.string()),
        categoryId: v.optional(v.id('categories')),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        const wallet = await ctx.db.get(args.walletId);

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        if (args.amount <= 0) {
            throw new Error('Deposit amount must be positive');
        }

        if (args.categoryId) {
            const category = await ctx.db.get(args.categoryId);

            if (!category) {
                throw new Error('Category not found');
            }

            if (category.userId !== user._id) {
                throw new Error('Unauthorized category access');
            }
            if (category.type !== 'income') {
                throw new Error('Category type must be income for deposits');
            }
        }

        await ctx.db.patch(args.walletId, {
            balance: wallet.balance + args.amount,
        });

        await ctx.db.insert('transactions', {
            userId: user._id,
            walletId: args.walletId,
            type: 'deposit',
            amount: args.amount,
            description: args.description,
            categoryId: args.categoryId,
            isDeleted: false,
        });

        return wallet;
    },
});

export const withdraw = mutation({
    args: {
        walletId: v.id('wallets'),
        amount: v.number(),
        description: v.optional(v.string()),
        categoryId: v.optional(v.id('categories')),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        const wallet = await ctx.db.get(args.walletId);

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        if (args.amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }

        if (wallet.balance < args.amount) {
            throw new Error('Insufficient balance');
        }

        if (args.categoryId) {
            const category = await ctx.db.get(args.categoryId);
            if (!category) {
                throw new Error('Category not found');
            }
            if (category.userId !== user._id) {
                throw new Error('Unauthorized category access');
            }
            if (category.type !== 'expense') {
                throw new Error('Category type must be expense for withdrawals');
            }
        }

        await ctx.db.patch(args.walletId, {
            balance: wallet.balance - args.amount,
        });

        await ctx.db.insert('transactions', {
            userId: user._id,
            walletId: args.walletId,
            type: 'withdrawal',
            amount: args.amount,
            description: args.description,
            categoryId: args.categoryId,
            isDeleted: false,
        });

        return wallet;
    },
});

export const transfer = mutation({
    args: {
        fromWalletId: v.id('wallets'),
        toWalletId: v.id('wallets'),
        amount: v.number(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const fromWallet = await ctx.db.get(args.fromWalletId);
        const toWallet = await ctx.db.get(args.toWalletId);

        if (!fromWallet || !toWallet) {
            throw new Error('One or both wallets not found');
        }
        if (fromWallet.userId !== user._id || toWallet.userId !== user._id) {
            throw new Error('Unauthorized access to one or both wallets');
        }

        if (args.amount <= 0) {
            throw new Error('Transfer amount must be positive');
        }

        if (fromWallet.balance < args.amount) {
            throw new Error('Insufficient balance in the source wallet');
        }
        await ctx.db.patch(args.fromWalletId, {
            balance: fromWallet.balance - args.amount,
        });

        await ctx.db.patch(args.toWalletId, {
            balance: toWallet.balance + args.amount,
        });

        await ctx.db.insert('transactions', {
            userId: user._id,
            walletId: args.fromWalletId,
            type: 'transfer',
            amount: args.amount,
            description: args.description,
            toWalletId: args.toWalletId,
            isDeleted: false,
        });

        return { fromWallet, toWallet };
    },
});

export const updateWallet = mutation({
    args: {
        walletId: v.id('wallets'),
        name: v.optional(v.string()),
        color: v.optional(v.string()),
        icon: v.optional(v.string()),
        currency: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        const wallet = await ctx.db.get(args.walletId);

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        const updates: Partial<typeof wallet> = {};

        if (args.name !== undefined) {
            updates.name = args.name || undefined;
        }
        if (args.color !== undefined) {
            updates.color = args.color || undefined;
        }
        if (args.icon !== undefined) {
            updates.icon = args.icon || undefined;
        }
        if (args.currency !== undefined) {
            updates.currency = args.currency;
        }

        await ctx.db.patch(args.walletId, updates);

        return wallet;
    },
});

export const deleteWallet = mutation({
    args: {
        walletId: v.id('wallets'),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        const wallet = await ctx.db.get(args.walletId);

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        // Check if wallet has zero balance
        if (wallet.balance !== 0) {
            throw new Error('Cannot delete wallet with non-zero balance');
        }

        // Check if wallet has any transaction history (including soft-deleted)
        const transactions = await ctx.db
            .query('transactions')
            .withIndex('by_walletId', (q) => q.eq('walletId', args.walletId))
            .first();

        if (transactions) {
            throw new Error('Cannot delete wallet with transaction history. Archive it instead.');
        }

        // Safe to delete
        await ctx.db.delete(args.walletId);
    },
});

export const archiveWallet = mutation({
    args: {
        walletId: v.id('wallets'),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        const wallet = await ctx.db.get(args.walletId);

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        await ctx.db.patch(args.walletId, {
            isArchived: true,
        });
    },
});

export const unarchiveWallet = mutation({
    args: {
        walletId: v.id('wallets'),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        const wallet = await ctx.db.get(args.walletId);

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        await ctx.db.patch(args.walletId, {
            isArchived: false,
        });
    },
});
