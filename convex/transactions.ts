import { v } from 'convex/values';
import { query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const getTransactions = query({
    args: {
        walletId: v.optional(v.id('wallets')),
        type: v.optional(v.union(v.literal('income'), v.literal('expense'))),
        categoryId: v.optional(v.id('categories')),
        limit: v.optional(v.number()),
        paginationOptions: v.optional(v.object({
           numItems: v.number(),
           cursor: v.union(v.string(), v.null()),
        })),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUserOrThrow(ctx);
           let query = ctx.db
            .query('transactions')
            .withIndex('by_userId', (q) => q.eq('userId', user._id));


            

    },
});
