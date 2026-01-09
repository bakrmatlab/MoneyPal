import { v } from 'convex/values';
import { query } from './_generated/server';
import { getCurrentUserOrThrow } from './users';

export const getTransactions = query({
    args: {
        walletId: v.optional(v.id('wallets')),
        limit: v.optional(v.number()),
    },
    handler: (ctx, args) => {
        const user = getCurrentUserOrThrow(ctx);
    },
});
