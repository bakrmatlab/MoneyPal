import { Id } from '@convex/_generated/dataModel';

export type Wallet = {
    _id: Id<'wallets'>;
    _creationTime: number;
    userId: Id<'users'>;
    name?: string;
    balance: number;
};

export type TransactionDialogProps = {
    walletId: Id<'wallets'>;
    walletName?: string;
    balance?: number;
};
