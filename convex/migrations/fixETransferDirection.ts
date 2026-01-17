import { internalMutation } from '../_generated/server';

/**
 * Migration to fix existing e-transfers that don't have isOutgoing set.
 *
 * For e-transfers, we can determine direction by checking:
 * - If the sender created this record (they sent money OUT of their wallet),
 *   the walletId should be the source wallet and recipientWalletId is the destination.
 * - For the sender's transaction: their walletId is THEIR wallet, recipientWalletId is recipient's wallet
 * - For the recipient's transaction: their walletId is THEIR wallet (destination), recipientWalletId is sender's wallet (source)
 *
 * Actually, the key insight is:
 * - Sender's transaction: walletId = sender's wallet (money goes OUT)
 * - Recipient's transaction: walletId = recipient's wallet (money comes IN)
 *
 * We can determine direction by checking if recipientWalletId's owner matches recipientUserId:
 * - Sender's record: recipientWalletId belongs to recipientUserId (the recipient) -> isOutgoing = true
 * - Recipient's record: recipientWalletId belongs to userId (the sender, stored as recipientUserId) -> isOutgoing = false
 *
 * Run this once via Convex dashboard: npx convex run migrations/fixETransferDirection:fix
 */
export const fix = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Get all e-transfer transactions without isOutgoing set
        const transactions = await ctx.db
            .query('transactions')
            .filter((q) => q.eq(q.field('type'), 'e-transfer'))
            .collect();

        let fixed = 0;
        for (const tx of transactions) {
            if (tx.isOutgoing !== undefined) continue; // Already has direction set
            if (!tx.recipientWalletId || !tx.recipientUserId) continue; // Skip incomplete records

            // Get the recipient wallet to check ownership
            const recipientWallet = await ctx.db.get(tx.recipientWalletId);
            if (!recipientWallet) continue;

            // If recipientWallet belongs to recipientUserId, this is the SENDER's transaction
            // Because sender's record points to recipient's wallet
            const isOutgoing = recipientWallet.userId === tx.recipientUserId;

            await ctx.db.patch(tx._id, { isOutgoing });
            fixed++;
        }

        return { fixed, total: transactions.length };
    },
});
