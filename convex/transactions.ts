import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const getTransactions = query({
    args: {
        walletId: v.optional(v.id('wallets')),
        type: v.optional(v.union(v.literal('deposit'), v.literal('withdrawal'), v.literal('transfer'))),
        categoryId: v.optional(v.id('categories')),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        limit: v.optional(v.number()),
        paginationOptions: v.optional(
            v.object({
                numItems: v.number(),
                cursor: v.union(v.string(), v.null()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        
        // Start with user's transactions
        let transactions = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .order('desc')
            .collect();

        // Filter out deleted transactions
        transactions = transactions.filter((t) => !t.isDeleted);

        // Apply wallet filter (include both source and destination for transfers)
        if (args.walletId) {
            transactions = transactions.filter(
                (t) => t.walletId === args.walletId || (t.toWalletId && t.toWalletId === args.walletId)
            );
        }

        // Apply type filter
        if (args.type) {
            transactions = transactions.filter((t) => t.type === args.type);
        }

        // Apply category filter
        if (args.categoryId) {
            transactions = transactions.filter((t) => t.categoryId === args.categoryId);
        }

        // Apply date range filter
        if (args.startDate) {
            transactions = transactions.filter((t) => t._creationTime >= args.startDate!);
        }
        if (args.endDate) {
            transactions = transactions.filter((t) => t._creationTime <= args.endDate!);
        }

        // Apply limit
        if (args.limit) {
            transactions = transactions.slice(0, args.limit);
        }

        const enrichedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                const wallet = await ctx.db.get(transaction.walletId);
                const category = transaction.categoryId ? await ctx.db.get(transaction.categoryId) : null;
                const toWallet = transaction.toWalletId ? await ctx.db.get(transaction.toWalletId) : null;
                return {
                    ...transaction,
                    wallet: wallet ? { _id: wallet._id, name: wallet.name } : null,
                    category: category ? { _id: category._id, name: category.name, type: category.type, color: category.color, icon: category.icon } : null,
                    toWallet: toWallet ? { _id: toWallet._id, name: toWallet.name } : null,
                };
            })
        );

        return enrichedTransactions;
    },
});

export const getTransactionById = query({
    args: {
        transactionId: v.id('transactions'),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const transaction = await ctx.db.get(args.transactionId);

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        if (transaction.userId !== user._id) {
            throw new Error('Unauthorized');
        }
        const wallet = await ctx.db.get(transaction.walletId);
        const category = transaction.categoryId ? await ctx.db.get(transaction.categoryId) : null;
        const toWallet = transaction.toWalletId ? await ctx.db.get(transaction.toWalletId) : null;

        return {
            ...transaction,
            wallet: wallet ? { _id: wallet._id, name: wallet.name } : null,
            category: category ? { _id: category._id, name: category.name, type: category.type, color: category.color, icon: category.icon } : null,
            toWallet: toWallet ? { _id: toWallet._id, name: toWallet.name } : null,
        };
    },
});

export const getRecentTransactions = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const limit = args.limit ?? 10;

        const transactions = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .order('desc')
            .filter((q) => q.eq(q.field('isDeleted'), false))
            .take(limit);

        const enrichedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                const wallet = await ctx.db.get(transaction.walletId);
                const category = transaction.categoryId ? await ctx.db.get(transaction.categoryId) : null;
                const toWallet = transaction.toWalletId ? await ctx.db.get(transaction.toWalletId) : null;

                return {
                    ...transaction,
                    wallet: wallet ? { _id: wallet._id, name: wallet.name } : null,
                    category: category ? { _id: category._id, name: category.name, type: category.type, color: category.color, icon: category.icon } : null,
                    toWallet: toWallet ? { _id: toWallet._id, name: toWallet.name } : null,
                };
            })
        );

        return enrichedTransactions;
    },
});

export const getDeletedTransactions = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const limit = args.limit ?? 50;

        const transactions = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .order('desc')
            .filter((q) => q.eq(q.field('isDeleted'), true))
            .take(limit);

        const enrichedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                const wallet = await ctx.db.get(transaction.walletId);
                const category = transaction.categoryId ? await ctx.db.get(transaction.categoryId) : null;
                const toWallet = transaction.toWalletId ? await ctx.db.get(transaction.toWalletId) : null;

                return {
                    ...transaction,
                    wallet: wallet ? { _id: wallet._id, name: wallet.name } : null,
                    category: category ? { _id: category._id, name: category.name, type: category.type, color: category.color, icon: category.icon } : null,
                    toWallet: toWallet ? { _id: toWallet._id, name: toWallet.name } : null,
                };
            })
        );

        return enrichedTransactions;
    },
});

export const updateTransaction = mutation({
    args: {
        transactionId: v.id('transactions'),
        description: v.optional(v.string()),
        categoryId: v.optional(v.id('categories')),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const transaction = await ctx.db.get(args.transactionId);

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        if (transaction.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        if (transaction.isDeleted) {
            throw new Error('Cannot edit deleted transaction');
        }

        if (args.categoryId) {
            const category = await ctx.db.get(args.categoryId);
            if (!category) {
                throw new Error('Category not found');
            }
            if (category.userId !== user._id) {
                throw new Error('Unauthorized category access');
            }

            if (transaction.type === 'deposit' && category.type !== 'income') {
                throw new Error('Deposit transactions must use income categories');
            }
            if (transaction.type === 'withdrawal' && category.type !== 'expense') {
                throw new Error('Withdrawal transactions must use expense categories');
            }
            if (transaction.type === 'transfer') {
                throw new Error('Transfer transactions cannot have categories');
            }
        }

        await ctx.db.patch(args.transactionId, {
            description: args.description,
            categoryId: args.categoryId,
        });

        return await ctx.db.get(args.transactionId);
    },
});

//Does NOT modify wallet balance
export const deleteTransaction = mutation({
    args: {
        transactionId: v.id('transactions'),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const transaction = await ctx.db.get(args.transactionId);

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        if (transaction.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        if (transaction.isDeleted) {
            throw new Error('Transaction already deleted');
        }

        await ctx.db.patch(args.transactionId, {
            isDeleted: true,
        });

        return transaction;
    },
});

//Restore deleted transaction
export const restoreTransaction = mutation({
    args: {
        transactionId: v.id('transactions'),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const transaction = await ctx.db.get(args.transactionId);

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        if (transaction.userId !== user._id) {
            throw new Error('Unauthorized');
        }

        if (!transaction.isDeleted) {
            throw new Error('Transaction is not deleted');
        }

        await ctx.db.patch(args.transactionId, {
            isDeleted: false,
        });

        return transaction;
    },
});

export const getTransactionStats = query({
    args: {
        walletId: v.optional(v.id('wallets')),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        let transactions = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .filter((q) => q.eq(q.field('isDeleted'), false))
            .collect();

        if (args.walletId) {
            transactions = transactions.filter((t) => t.walletId === args.walletId);
        }

        if (args.startDate) {
            transactions = transactions.filter((t) => t._creationTime >= args.startDate!);
        }
        if (args.endDate) {
            transactions = transactions.filter((t) => t._creationTime <= args.endDate!);
        }

        const totalDeposits = transactions.filter((t) => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);

        const totalWithdrawals = transactions.filter((t) => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);

        const totalTransfers = transactions.filter((t) => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0);

        return {
            totalTransactions: transactions.length,
            totalDeposits,
            totalWithdrawals,
            totalTransfers,
            depositCount: transactions.filter((t) => t.type === 'deposit').length,
            withdrawalCount: transactions.filter((t) => t.type === 'withdrawal').length,
            transferCount: transactions.filter((t) => t.type === 'transfer').length,
            netChange: totalDeposits - totalWithdrawals,
        };
    },
});
