import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const getTransactions = query({
    args: {
        walletId: v.optional(v.id('wallets')),
        type: v.optional(v.union(v.literal('deposit'), v.literal('withdrawal'), v.literal('transfer'), v.literal('e-transfer'))),
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
            transactions = transactions.filter((t) => t.walletId === args.walletId || (t.toWalletId && t.toWalletId === args.walletId));
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

                // For e-transfers, get recipient info
                let recipientUser = null;
                let recipientWallet = null;
                if (transaction.type === 'e-transfer') {
                    if (transaction.recipientUserId) {
                        recipientUser = await ctx.db.get(transaction.recipientUserId);
                    }
                    if (transaction.recipientWalletId) {
                        recipientWallet = await ctx.db.get(transaction.recipientWalletId);
                    }
                }

                return {
                    ...transaction,
                    wallet: wallet ? { _id: wallet._id, name: wallet.name } : null,
                    category: category ? { _id: category._id, name: category.name, type: category.type, color: category.color, icon: category.icon } : null,
                    toWallet: toWallet ? { _id: toWallet._id, name: toWallet.name } : null,
                    recipientUser: recipientUser ? { _id: recipientUser._id, fullName: recipientUser.fullName, email: recipientUser.email } : null,
                    recipientWallet: recipientWallet ? { _id: recipientWallet._id, name: recipientWallet.name } : null,
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
            transactions = transactions.filter((t) => t.walletId === args.walletId || (t.toWalletId && t.toWalletId === args.walletId));
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

// E-Transfer Functions

export const getRecentRecipients = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const limit = args.limit ?? 5;

        // Get recent outgoing e-transfers
        const sentTransfers = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .filter((q) => q.eq(q.field('type'), 'e-transfer'))
            .filter((q) => q.eq(q.field('isOutgoing'), true))
            .filter((q) => q.eq(q.field('isDeleted'), false))
            .order('desc')
            .take(50);

        // Deduplicate recipients by user ID
        const uniqueRecipients = new Map();
        for (const tx of sentTransfers) {
            if (tx.recipientUserId && !uniqueRecipients.has(tx.recipientUserId)) {
                const recipient = await ctx.db.get(tx.recipientUserId);
                if (recipient) {
                    uniqueRecipients.set(tx.recipientUserId, {
                        _id: recipient._id,
                        fullName: recipient.fullName,
                        email: recipient.email,
                        username: recipient.username,
                    });
                }
                if (uniqueRecipients.size >= limit) break;
            }
        }

        return Array.from(uniqueRecipients.values());
    },
});

export const getUserByEmail = query({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const currentUser = await getCurrentUserOrThrow(ctx);

        // Find user by email
        const user = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('email'), args.email))
            .first();

        if (!user) {
            return null;
        }

        // Don't allow sending to yourself
        if (user._id === currentUser._id) {
            throw new Error('Cannot send e-transfer to yourself');
        }

        return {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
        };
    },
});

export const getRecipientWallets = query({
    args: {
        userId: v.optional(v.id('users')),
    },
    handler: async (ctx, args) => {
        await getCurrentUserOrThrow(ctx);

        if (!args.userId) {
            return [];
        }

        const userId = args.userId;

        // Get non-archived wallets for the recipient
        const wallets = await ctx.db
            .query('wallets')
            .withIndex('by_userId', (q) => q.eq('userId', userId))
            .filter((q) => q.neq(q.field('isArchived'), true))
            .collect();

        return wallets.map((w) => ({
            _id: w._id,
            name: w.name,
            currency: w.currency,
            icon: w.icon,
            color: w.color,
        }));
    },
});

export const sendETransfer = mutation({
    args: {
        walletId: v.id('wallets'),
        recipientEmail: v.string(),
        recipientWalletId: v.id('wallets'),
        amount: v.number(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        // Validate amount
        if (args.amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }

        // Get sender wallet
        const senderWallet = await ctx.db.get(args.walletId);
        if (!senderWallet) {
            throw new Error('Sender wallet not found');
        }
        if (senderWallet.userId !== user._id) {
            throw new Error('Unauthorized wallet access');
        }
        if (senderWallet.isArchived) {
            throw new Error('Cannot send from archived wallet');
        }

        // Check sender balance
        if (senderWallet.balance < args.amount) {
            throw new Error('Insufficient balance');
        }

        // Get recipient by email
        const recipient = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('email'), args.recipientEmail))
            .first();

        if (!recipient) {
            throw new Error('Recipient not found');
        }

        if (recipient._id === user._id) {
            throw new Error('Cannot send e-transfer to yourself');
        }

        // Get recipient wallet
        const recipientWallet = await ctx.db.get(args.recipientWalletId);
        if (!recipientWallet) {
            throw new Error('Recipient wallet not found');
        }
        if (recipientWallet.userId !== recipient._id) {
            throw new Error('Recipient wallet does not belong to recipient');
        }
        if (recipientWallet.isArchived) {
            throw new Error('Cannot send to archived wallet');
        }

        // Update sender wallet balance
        await ctx.db.patch(args.walletId, {
            balance: senderWallet.balance - args.amount,
        });

        // Update recipient wallet balance
        await ctx.db.patch(args.recipientWalletId, {
            balance: recipientWallet.balance + args.amount,
        });

        // Create sender transaction (outgoing)
        const senderTransactionId = await ctx.db.insert('transactions', {
            userId: user._id,
            walletId: args.walletId,
            type: 'e-transfer',
            amount: args.amount,
            description: args.description,
            recipientEmail: args.recipientEmail,
            recipientUserId: recipient._id,
            recipientWalletId: args.recipientWalletId,
            isOutgoing: true,
            isDeleted: false,
        });

        // Create recipient transaction (incoming)
        await ctx.db.insert('transactions', {
            userId: recipient._id,
            walletId: args.recipientWalletId,
            type: 'e-transfer',
            amount: args.amount,
            description: args.description,
            recipientEmail: user.email,
            recipientUserId: user._id,
            recipientWalletId: args.walletId,
            isOutgoing: false,
            isDeleted: false,
        });

        return senderTransactionId;
    },
});

export const getETransfers = query({
    args: {
        type: v.optional(v.union(v.literal('sent'), v.literal('received'))),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const limit = args.limit ?? 50;

        let transactions = [];

        if (args.type === 'sent') {
            // Get only sent e-transfers (outgoing transactions)
            // For new transactions: isOutgoing === true
            // For legacy transactions: recipientUserId !== userId (they sent it to someone else)
            transactions = await ctx.db
                .query('transactions')
                .withIndex('by_userId', (q) => q.eq('userId', user._id))
                .filter((q) => q.eq(q.field('type'), 'e-transfer'))
                .filter((q) => q.eq(q.field('isDeleted'), false))
                .filter((q) =>
                    q.or(
                        q.eq(q.field('isOutgoing'), true),
                        // Fallback for legacy transactions without isOutgoing
                        q.and(q.eq(q.field('isOutgoing'), undefined), q.neq(q.field('recipientUserId'), user._id))
                    )
                )
                .order('desc')
                .take(limit);
        } else if (args.type === 'received') {
            // Get only received e-transfers (incoming transactions)
            // For new transactions: isOutgoing === false
            // For legacy transactions: recipientUserId === userId (someone sent it to them)
            transactions = await ctx.db
                .query('transactions')
                .withIndex('by_userId', (q) => q.eq('userId', user._id))
                .filter((q) => q.eq(q.field('type'), 'e-transfer'))
                .filter((q) => q.eq(q.field('isDeleted'), false))
                .filter((q) =>
                    q.or(
                        q.eq(q.field('isOutgoing'), false),
                        // Fallback for legacy transactions without isOutgoing
                        q.and(q.eq(q.field('isOutgoing'), undefined), q.eq(q.field('recipientUserId'), user._id))
                    )
                )
                .order('desc')
                .take(limit);
        } else {
            // Get all e-transfers for this user
            transactions = await ctx.db
                .query('transactions')
                .withIndex('by_userId', (q) => q.eq('userId', user._id))
                .filter((q) => q.eq(q.field('type'), 'e-transfer'))
                .filter((q) => q.eq(q.field('isDeleted'), false))
                .order('desc')
                .take(limit);
        }

        // Enrich transactions with user and wallet details
        const enrichedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                const wallet = await ctx.db.get(transaction.walletId);
                const recipientUser = transaction.recipientUserId ? await ctx.db.get(transaction.recipientUserId) : null;
                const recipientWallet = transaction.recipientWalletId ? await ctx.db.get(transaction.recipientWalletId) : null;

                // For received e-transfers, we need to know who sent it (the transaction owner)
                const senderUser = await ctx.db.get(transaction.userId);

                return {
                    ...transaction,
                    wallet: wallet ? { _id: wallet._id, name: wallet.name, currency: wallet.currency } : null,
                    recipientUser: recipientUser ? { _id: recipientUser._id, fullName: recipientUser.fullName, email: recipientUser.email } : null,
                    recipientWallet: recipientWallet ? { _id: recipientWallet._id, name: recipientWallet.name } : null,
                    senderUser: senderUser ? { _id: senderUser._id, fullName: senderUser.fullName, email: senderUser.email } : null,
                };
            })
        );

        return enrichedTransactions;
    },
});
