import { v } from 'convex/values';
import { internal } from './_generated/api';
import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const getMyWallets = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUserOrThrow(ctx);

        return await ctx.db
            .query('wallets')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .collect();
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
            await ctx.runMutation(internal.categories.seedDefaultCategories);
        }

        const walletId = await ctx.db.insert('wallets', {
            userId: user._id,
            name: args.name ?? undefined,
            balance: 0,
        });

        return walletId;
    },
});

export const deposit = mutation({
    args: {
        walletId: v.id('wallets'),
        amount: v.number(),
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
            balance: wallet.balance + args.amount,
        });

        return wallet;
    },
});

export const withdraw = mutation({
    args: {
        walletId: v.id('wallets'),
        amount: v.number(),
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

        if (wallet.balance < args.amount) {
            throw new Error('Insufficient balance');
        }

        await ctx.db.patch(args.walletId, {
            balance: wallet.balance - args.amount,
        });

        return wallet;
    },
});

export const transfer = mutation({
    args: {
        fromWalletId: v.id('wallets'),
        toWalletId: v.id('wallets'),
        amount: v.number(),
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
        return { fromWallet, toWallet };
    },
});
