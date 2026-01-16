import { v } from 'convex/values';
import { query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

/**
 * Get monthly spending trends - aggregates transactions by month
 * Returns income and expenses for each month in the date range
 */
export const getMonthlyTrends = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        walletId: v.optional(v.id('wallets')),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        let transactions = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .filter((q) => q.eq(q.field('isDeleted'), false))
            .collect();

        // Apply filters
        if (args.walletId) {
            transactions = transactions.filter((t) => t.walletId === args.walletId || (t.toWalletId && t.toWalletId === args.walletId));
        }
        if (args.startDate) {
            transactions = transactions.filter((t) => t._creationTime >= args.startDate!);
        }
        if (args.endDate) {
            transactions = transactions.filter((t) => t._creationTime <= args.endDate!);
        }

        // Group by month
        const monthlyData = new Map<string, { income: number; expenses: number; month: string }>();

        transactions.forEach((transaction) => {
            const date = new Date(transaction._creationTime);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData.has(monthKey)) {
                monthlyData.set(monthKey, {
                    month: monthKey,
                    income: 0,
                    expenses: 0,
                });
            }

            const data = monthlyData.get(monthKey)!;
            if (transaction.type === 'deposit') {
                data.income += transaction.amount;
            } else if (transaction.type === 'withdrawal') {
                data.expenses += transaction.amount;
            }
            // Transfers are excluded from income/expense totals
        });

        // Convert to array and sort by month
        return Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));
    },
});

/**
 * Get daily spending trends - useful for shorter time periods
 */
export const getDailyTrends = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        walletId: v.optional(v.id('wallets')),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        let transactions = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .filter((q) => q.eq(q.field('isDeleted'), false))
            .collect();

        // Apply filters
        if (args.walletId) {
            transactions = transactions.filter((t) => t.walletId === args.walletId || (t.toWalletId && t.toWalletId === args.walletId));
        }
        if (args.startDate) {
            transactions = transactions.filter((t) => t._creationTime >= args.startDate!);
        }
        if (args.endDate) {
            transactions = transactions.filter((t) => t._creationTime <= args.endDate!);
        }

        // Group by day
        const dailyData = new Map<string, { income: number; expenses: number; date: string }>();

        transactions.forEach((transaction) => {
            const date = new Date(transaction._creationTime);
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!dailyData.has(dateKey)) {
                dailyData.set(dateKey, {
                    date: dateKey,
                    income: 0,
                    expenses: 0,
                });
            }

            const data = dailyData.get(dateKey)!;
            if (transaction.type === 'deposit') {
                data.income += transaction.amount;
            } else if (transaction.type === 'withdrawal') {
                data.expenses += transaction.amount;
            }
        });

        // Convert to array and sort by date
        return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
    },
});

/**
 * Get category breakdown - total spending/income by category
 */
export const getCategoryBreakdown = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        walletId: v.optional(v.id('wallets')),
        type: v.optional(v.union(v.literal('income'), v.literal('expense'))),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);

        let transactions = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .filter((q) => q.eq(q.field('isDeleted'), false))
            .collect();

        // Apply filters
        if (args.walletId) {
            transactions = transactions.filter((t) => t.walletId === args.walletId || (t.toWalletId && t.toWalletId === args.walletId));
        }
        if (args.startDate) {
            transactions = transactions.filter((t) => t._creationTime >= args.startDate!);
        }
        if (args.endDate) {
            transactions = transactions.filter((t) => t._creationTime <= args.endDate!);
        }

        // Filter by transaction type if specified
        if (args.type === 'income') {
            transactions = transactions.filter((t) => t.type === 'deposit');
        } else if (args.type === 'expense') {
            transactions = transactions.filter((t) => t.type === 'withdrawal');
        }

        // Group by category
        const categoryTotals = new Map<
            string,
            {
                categoryId: string;
                categoryName: string;
                categoryColor: string;
                categoryIcon: string;
                total: number;
                count: number;
                type: 'income' | 'expense';
            }
        >();

        await Promise.all(
            transactions.map(async (transaction) => {
                if (!transaction.categoryId) return; // Skip uncategorized

                const category = await ctx.db.get(transaction.categoryId);
                if (!category) return;

                const key = transaction.categoryId;
                if (!categoryTotals.has(key)) {
                    categoryTotals.set(key, {
                        categoryId: key,
                        categoryName: category.name,
                        categoryColor: category.color,
                        categoryIcon: category.icon,
                        total: 0,
                        count: 0,
                        type: category.type,
                    });
                }

                const data = categoryTotals.get(key)!;
                data.total += transaction.amount;
                data.count += 1;
            })
        );

        // Convert to array and sort by total descending
        const result = Array.from(categoryTotals.values()).sort((a, b) => b.total - a.total);

        // Calculate percentages
        const grandTotal = result.reduce((sum, item) => sum + item.total, 0);
        return result.map((item) => ({
            ...item,
            percentage: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
        }));
    },
});

/**
 * Get top spending categories - highest expense categories
 */
export const getTopCategories = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        walletId: v.optional(v.id('wallets')),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const limit = args.limit ?? 5;

        let transactions = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .filter((q) => q.eq(q.field('isDeleted'), false))
            .filter((q) => q.eq(q.field('type'), 'withdrawal'))
            .collect();

        // Apply filters
        if (args.walletId) {
            transactions = transactions.filter((t) => t.walletId === args.walletId);
        }
        if (args.startDate) {
            transactions = transactions.filter((t) => t._creationTime >= args.startDate!);
        }
        if (args.endDate) {
            transactions = transactions.filter((t) => t._creationTime <= args.endDate!);
        }

        // Group by category
        const categoryTotals = new Map<
            string,
            {
                categoryId: string;
                categoryName: string;
                categoryColor: string;
                categoryIcon: string;
                total: number;
                count: number;
            }
        >();

        await Promise.all(
            transactions.map(async (transaction) => {
                if (!transaction.categoryId) return;

                const category = await ctx.db.get(transaction.categoryId);
                if (!category) return;

                const key = transaction.categoryId;
                if (!categoryTotals.has(key)) {
                    categoryTotals.set(key, {
                        categoryId: key,
                        categoryName: category.name,
                        categoryColor: category.color,
                        categoryIcon: category.icon,
                        total: 0,
                        count: 0,
                    });
                }

                const data = categoryTotals.get(key)!;
                data.total += transaction.amount;
                data.count += 1;
            })
        );

        // Convert to array, sort by total descending, and limit
        return Array.from(categoryTotals.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, limit);
    },
});

/**
 * Get income vs expenses comparison
 */
export const getIncomeVsExpenses = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        walletId: v.optional(v.id('wallets')),
        groupBy: v.optional(v.union(v.literal('day'), v.literal('week'), v.literal('month'))),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
        const groupBy = args.groupBy ?? 'month';

        let transactions = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .filter((q) => q.eq(q.field('isDeleted'), false))
            .collect();

        // Apply filters
        if (args.walletId) {
            transactions = transactions.filter((t) => t.walletId === args.walletId || (t.toWalletId && t.toWalletId === args.walletId));
        }
        if (args.startDate) {
            transactions = transactions.filter((t) => t._creationTime >= args.startDate!);
        }
        if (args.endDate) {
            transactions = transactions.filter((t) => t._creationTime <= args.endDate!);
        }

        // Group by time period
        const periodData = new Map<string, { period: string; income: number; expenses: number; net: number }>();

        transactions.forEach((transaction) => {
            const date = new Date(transaction._creationTime);
            let periodKey: string;

            if (groupBy === 'day') {
                periodKey = date.toISOString().split('T')[0];
            } else if (groupBy === 'week') {
                // Get week start (Monday)
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay() + 1);
                periodKey = weekStart.toISOString().split('T')[0];
            } else {
                // month
                periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }

            if (!periodData.has(periodKey)) {
                periodData.set(periodKey, {
                    period: periodKey,
                    income: 0,
                    expenses: 0,
                    net: 0,
                });
            }

            const data = periodData.get(periodKey)!;
            if (transaction.type === 'deposit') {
                data.income += transaction.amount;
            } else if (transaction.type === 'withdrawal') {
                data.expenses += transaction.amount;
            }
            data.net = data.income - data.expenses;
        });

        // Convert to array and sort by period
        return Array.from(periodData.values()).sort((a, b) => a.period.localeCompare(b.period));
    },
});

/**
 * Get wallet balance history over time
 * Calculates running balance by replaying transactions chronologically
 */
export const getWalletBalanceHistory = query({
    args: {
        walletId: v.id('wallets'),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
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

        // Get all transactions for this wallet
        let transactions = await ctx.db
            .query('transactions')
            .withIndex('by_walletId', (q) => q.eq('walletId', args.walletId))
            .filter((q) => q.eq(q.field('isDeleted'), false))
            .collect();

        // Also get transactions where this wallet is the destination (transfers)
        const transferTransactions = await ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .filter((q) => q.eq(q.field('isDeleted'), false))
            .filter((q) => q.eq(q.field('type'), 'transfer'))
            .collect();

        const incomingTransfers = transferTransactions.filter((t) => t.toWalletId === args.walletId);
        transactions = [...transactions, ...incomingTransfers];

        // Apply date filters
        if (args.startDate) {
            transactions = transactions.filter((t) => t._creationTime >= args.startDate!);
        }
        if (args.endDate) {
            transactions = transactions.filter((t) => t._creationTime <= args.endDate!);
        }

        // Sort by creation time
        transactions.sort((a, b) => a._creationTime - b._creationTime);

        // Calculate running balance
        const balanceHistory: { date: string; balance: number; timestamp: number }[] = [];

        // Calculate initial balance by working backwards from current balance
        let initialBalance = wallet.balance;

        // Subtract all transaction effects to get to the starting point
        for (let i = transactions.length - 1; i >= 0; i--) {
            const t = transactions[i];
            if (t.walletId === args.walletId) {
                if (t.type === 'deposit') {
                    initialBalance -= t.amount; // Reverse deposit
                } else if (t.type === 'withdrawal') {
                    initialBalance += t.amount; // Reverse withdrawal
                } else if (t.type === 'transfer') {
                    initialBalance += t.amount; // Reverse transfer out
                }
            } else if (t.toWalletId === args.walletId && t.type === 'transfer') {
                initialBalance -= t.amount; // Reverse transfer in
            }
        }

        // Now build history forward from initial balance
        if (transactions.length > 0) {
            let runningBalance = initialBalance;

            // Add starting point (before first transaction)
            const firstDate = new Date(transactions[0]._creationTime);
            firstDate.setHours(0, 0, 0, 0);
            balanceHistory.push({
                date: firstDate.toISOString().split('T')[0],
                balance: runningBalance,
                timestamp: firstDate.getTime(),
            });

            // Process each transaction chronologically
            for (const transaction of transactions) {
                if (transaction.walletId === args.walletId) {
                    if (transaction.type === 'deposit') {
                        runningBalance += transaction.amount;
                    } else if (transaction.type === 'withdrawal') {
                        runningBalance -= transaction.amount;
                    } else if (transaction.type === 'transfer') {
                        runningBalance -= transaction.amount; // Transfer out
                    }
                } else if (transaction.toWalletId === args.walletId && transaction.type === 'transfer') {
                    runningBalance += transaction.amount; // Transfer in
                }

                const date = new Date(transaction._creationTime);
                balanceHistory.push({
                    date: date.toISOString().split('T')[0],
                    balance: runningBalance,
                    timestamp: transaction._creationTime,
                });
            }

            // Add current point (should match wallet.balance)
            balanceHistory.push({
                date: new Date().toISOString().split('T')[0],
                balance: wallet.balance,
                timestamp: Date.now(),
            });
        } else {
            // No transactions in range, just show current balance
            balanceHistory.push({
                date: new Date().toISOString().split('T')[0],
                balance: wallet.balance,
                timestamp: Date.now(),
            });
        }

        return balanceHistory;
    },
});

/**
 * Get spending breakdown by wallet
 */
export const getWalletSpending = query({
    args: {
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

        // Apply date filters
        if (args.startDate) {
            transactions = transactions.filter((t) => t._creationTime >= args.startDate!);
        }
        if (args.endDate) {
            transactions = transactions.filter((t) => t._creationTime <= args.endDate!);
        }

        // Group by wallet
        const walletData = new Map<
            string,
            {
                walletId: string;
                walletName: string;
                walletColor: string;
                walletIcon: string;
                income: number;
                expenses: number;
                net: number;
                transactionCount: number;
            }
        >();

        await Promise.all(
            transactions.map(async (transaction) => {
                const wallet = await ctx.db.get(transaction.walletId);
                if (!wallet) return;

                const key = transaction.walletId;
                if (!walletData.has(key)) {
                    walletData.set(key, {
                        walletId: key,
                        walletName: wallet.name ?? 'Unnamed Wallet',
                        walletColor: wallet.color ?? '#000000',
                        walletIcon: wallet.icon ?? '💰',
                        income: 0,
                        expenses: 0,
                        net: 0,
                        transactionCount: 0,
                    });
                }

                const data = walletData.get(key)!;
                if (transaction.type === 'deposit') {
                    data.income += transaction.amount;
                } else if (transaction.type === 'withdrawal') {
                    data.expenses += transaction.amount;
                }
                data.net = data.income - data.expenses;
                data.transactionCount += 1;
            })
        );

        return Array.from(walletData.values()).sort((a, b) => b.transactionCount - a.transactionCount);
    },
});
