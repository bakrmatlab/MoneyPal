import { v } from 'convex/values';
import { internalMutation, mutation, query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

/** Returns the current calendar month and year in UTC. */
function currentMonthYear() {
    const now = new Date();
    return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
}

/** Fetch the current month's budget for the authenticated user. Returns null if none set. */
export const getCurrentBudget = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUserOrThrow(ctx);
        const { month, year } = currentMonthYear();
        return await ctx.db
            .query('budgets')
            .withIndex('by_userId_month_year', (q) =>
                q.eq('userId', user._id).eq('month', month).eq('year', year)
            )
            .first();
    },
});

/** Fetch all budget rows for the user ordered oldest → newest. */
export const getBudgetHistory = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUserOrThrow(ctx);
        const rows = await ctx.db
            .query('budgets')
            .withIndex('by_userId', (q) => q.eq('userId', user._id))
            .collect();
        // Sort ascending by year then month
        return rows.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
    },
});

/** Set or update the budget amount for the current month. Creates a row if one doesn't exist. */
export const setBudget = mutation({
    args: { amount: v.number() },
    handler: async (ctx, args) => {
        if (args.amount <= 0) throw new Error('Budget amount must be positive');
        const user = await getCurrentUserOrThrow(ctx);
        const { month, year } = currentMonthYear();
        const existing = await ctx.db
            .query('budgets')
            .withIndex('by_userId_month_year', (q) =>
                q.eq('userId', user._id).eq('month', month).eq('year', year)
            )
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, { amount: args.amount });
        } else {
            await ctx.db.insert('budgets', { userId: user._id, amount: args.amount, month, year, spent: 0 });
        }
    },
});

/**
 * Increment or decrement `spent` for the current user's current-month budget.
 * Pass a positive delta to add spending, negative to reverse it.
 * No-ops silently if no budget row exists for this month.
 */
export const updateSpent = internalMutation({
    args: {
        userId: v.id('users'),
        delta: v.number(),
    },
    handler: async (ctx, args) => {
        const { month, year } = currentMonthYear();
        const budget = await ctx.db
            .query('budgets')
            .withIndex('by_userId_month_year', (q) =>
                q.eq('userId', args.userId).eq('month', month).eq('year', year)
            )
            .first();
        if (!budget) return; // No budget set — nothing to track
        await ctx.db.patch(budget._id, { spent: Math.max(0, budget.spent + args.delta) });
    },
});

/**
 * Called by the monthly cron: copies the current month's `amount` into a new row
 * for the next month with `spent` reset to 0. Only creates a row for users who
 * already have a budget for the current month.
 */
export const createNextMonthBudgets = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = new Date();
        const currentMonth = now.getUTCMonth() + 1;
        const currentYear = now.getUTCFullYear();

        // Next month calculation
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

        // Find all current-month budget rows
        const currentBudgets = await ctx.db
            .query('budgets')
            .collect();

        const thisMonthBudgets = currentBudgets.filter(
            (b) => b.month === currentMonth && b.year === currentYear
        );

        for (const budget of thisMonthBudgets) {
            // Avoid duplicate if already created
            const existing = await ctx.db
                .query('budgets')
                .withIndex('by_userId_month_year', (q) =>
                    q.eq('userId', budget.userId).eq('month', nextMonth).eq('year', nextYear)
                )
                .first();
            if (!existing) {
                await ctx.db.insert('budgets', {
                    userId: budget.userId,
                    amount: budget.amount,
                    month: nextMonth,
                    year: nextYear,
                    spent: 0,
                });
            }
        }
    },
});
