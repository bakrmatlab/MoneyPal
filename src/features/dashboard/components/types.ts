import { Id } from '@convex/_generated/dataModel';

export type Wallet = {
    _id: Id<'wallets'>;
    _creationTime: number;
    userId: Id<'users'>;
    name?: string;
    balance: number;
    currency?: string;
    color?: string;
    icon?: string;
    isArchived?: boolean;
};

export type TransactionDialogProps = {
    walletId: Id<'wallets'>;
    walletName?: string;
    balance?: number;
};
