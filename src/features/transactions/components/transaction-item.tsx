import { useState } from 'react';
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Info, Send } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TransactionItemProps {
    transaction: {
        _id: string;
        type: 'deposit' | 'withdrawal' | 'transfer' | 'e-transfer';
        amount: number;
        description?: string;
        _creationTime: number;
        wallet: { name?: string } | null;
        category?: { name: string; color: string; icon: string } | null;
        toWallet?: { name?: string } | null;
        recipientEmail?: string;
        recipientUser?: { fullName: string; email: string } | null;
        recipientWallet?: { name?: string } | null;
        isOutgoing?: boolean;
    };
}

export const TransactionItem = ({ transaction }: TransactionItemProps) => {
    const tx = transaction;
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const getIcon = () => {
        switch (tx.type) {
            case 'deposit':
                return <ArrowDownToLine className='text-success size-5' />;
            case 'withdrawal':
                return <ArrowUpFromLine className='text-destructive size-5' />;
            case 'transfer':
                return <ArrowLeftRight className='size-5 text-blue-600 dark:text-blue-400' />;
            case 'e-transfer':
                // Show different icon based on sent/received
                return tx.isOutgoing ? <Send className='text-warning size-5' /> : <ArrowDownToLine className='text-success size-5' />;
            default:
                return null;
        }
    };

    const getTypeLabel = () => {
        switch (tx.type) {
            case 'deposit':
                return 'Deposit';
            case 'withdrawal':
                return 'Withdrawal';
            case 'transfer':
                return 'Transfer';
            case 'e-transfer':
                return tx.isOutgoing ? 'E-Transfer Sent' : 'E-Transfer Received';
            default:
                return tx.type;
        }
    };

    const getAmountColor = () => {
        switch (tx.type) {
            case 'deposit':
                return 'text-success';
            case 'withdrawal':
                return 'text-destructive';
            case 'transfer':
                return 'text-blue-600 dark:text-blue-400';
            case 'e-transfer':
                // Received = green (money in), Sent = orange (money out)
                return tx.isOutgoing ? 'text-warning' : 'text-success';
            default:
                return '';
        }
    };

    return (
        <div className='flex min-w-0 flex-col gap-3 py-5 sm:flex-row sm:items-center md:gap-4'>
            <div className='flex min-w-0 flex-1 items-start gap-3 md:gap-4'>
                {/* Icon */}
                <div className='bg-muted flex size-9 shrink-0 items-center justify-center rounded-sm md:size-10'>{getIcon()}</div>

                {/* Transaction Details */}
                <div className='min-w-0 flex-1 space-y-0.5 md:space-y-1'>
                    <div className='flex flex-wrap items-center gap-1.5 md:gap-2'>
                        <p className='text-sm font-medium break-words md:text-base'>{tx.description || 'No description'}</p>
                        <Badge variant='outline' className='max-w-full rounded-sm text-xs break-words whitespace-normal'>
                            {getTypeLabel()}
                        </Badge>
                        {tx.category && (
                            <Badge
                                variant='secondary'
                                className='max-w-full rounded-sm text-xs break-words whitespace-normal'
                                style={{ backgroundColor: tx.category.color + '20', color: tx.category.color }}>
                                {tx.category.icon} {tx.category.name}
                            </Badge>
                        )}
                    </div>
                    <div className='text-muted-foreground flex flex-wrap items-center gap-1 text-xs md:gap-2 md:text-sm'>
                        <span className='truncate'>{tx.wallet?.name || 'Unknown Wallet'}</span>
                        {tx.type === 'e-transfer' && tx.recipientUser && (
                            <>
                                <span className='hidden sm:inline'>→</span>
                                <span className='truncate'>{tx.recipientUser.fullName}</span>
                            </>
                        )}
                        {tx.toWallet && (
                            <>
                                <span className='hidden sm:inline'>→</span>
                                <span className='truncate'>{tx.toWallet.name}</span>
                            </>
                        )}
                        <span className='hidden sm:inline'>•</span>
                        <span>{new Date(tx._creationTime).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Amount */}
            <div className='flex items-center justify-between gap-3 sm:ml-auto sm:justify-end md:gap-4'>
                <p className={`min-w-0 text-xl font-medium break-all tabular-nums ${getAmountColor()}`}>
                    {tx.type === 'deposit' || (tx.type === 'e-transfer' && !tx.isOutgoing)
                        ? '+'
                        : tx.type === 'withdrawal' || (tx.type === 'e-transfer' && tx.isOutgoing)
                          ? '-'
                          : ''}
                    {formatCurrency(tx.amount)}
                </p>

                {/* View Details Button */}
                <Button
                    variant='ghost'
                    size='icon'
                    className='size-11 shrink-0 rounded-sm'
                    aria-label={`View ${getTypeLabel().toLowerCase()} details`}
                    onClick={() => setIsDetailsOpen(true)}>
                    <Info className='size-3.5 md:size-4' />
                </Button>
            </div>

            {/* Transaction Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className='max-h-[85dvh] overflow-y-auto rounded-sm sm:max-w-[500px]'>
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                        <DialogDescription>Complete information about this transaction</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div className='flex items-center gap-3'>
                            <div className='bg-muted flex size-12 shrink-0 items-center justify-center rounded-sm'>{getIcon()}</div>
                            <div>
                                <p className='text-muted-foreground text-sm font-medium'>Type</p>
                                <p className='font-semibold'>{getTypeLabel()}</p>
                            </div>
                        </div>

                        <div className='space-y-3 rounded-sm border p-4'>
                            <div>
                                <p className='text-muted-foreground text-sm font-medium'>Amount</p>
                                <p className={`text-2xl font-semibold break-all tabular-nums ${getAmountColor()}`}>
                                    {tx.type === 'deposit' || (tx.type === 'e-transfer' && !tx.isOutgoing)
                                        ? '+'
                                        : tx.type === 'withdrawal' || (tx.type === 'e-transfer' && tx.isOutgoing)
                                          ? '-'
                                          : ''}
                                    {formatCurrency(tx.amount)}
                                </p>
                            </div>

                            <div>
                                <p className='text-muted-foreground text-sm font-medium'>Description</p>
                                <p className='font-medium break-words'>{tx.description || 'No description provided'}</p>
                            </div>

                            <div>
                                <p className='text-muted-foreground text-sm font-medium'>Date</p>
                                <p className='font-medium break-words'>
                                    {new Date(tx._creationTime).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>

                            <div>
                                <p className='text-muted-foreground text-sm font-medium'>{tx.type === 'transfer' ? 'From Wallet' : 'Wallet'}</p>
                                <p className='font-medium break-words'>{tx.wallet?.name || 'Unknown Wallet'}</p>
                            </div>

                            {tx.type === 'e-transfer' && tx.recipientUser && (
                                <>
                                    <div>
                                        <p className='text-muted-foreground text-sm font-medium'>Recipient</p>
                                        <p className='font-medium break-words'>{tx.recipientUser.fullName}</p>
                                        <p className='text-muted-foreground text-xs'>{tx.recipientUser.email}</p>
                                    </div>
                                    {tx.recipientWallet && (
                                        <div>
                                            <p className='text-muted-foreground text-sm font-medium'>Recipient Wallet</p>
                                            <p className='font-medium break-words'>{tx.recipientWallet.name}</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {tx.toWallet && (
                                <div>
                                    <p className='text-muted-foreground text-sm font-medium'>To Wallet</p>
                                    <p className='font-medium break-words'>{tx.toWallet.name}</p>
                                </div>
                            )}

                            {tx.category && (
                                <div>
                                    <p className='text-muted-foreground text-sm font-medium'>Category</p>
                                    <Badge variant='secondary' className='mt-1' style={{ backgroundColor: tx.category.color + '20', color: tx.category.color }}>
                                        {tx.category.icon} {tx.category.name}
                                    </Badge>
                                </div>
                            )}

                            <div>
                                <p className='text-muted-foreground text-sm font-medium'>Transaction ID</p>
                                <p className='font-mono text-xs break-all'>{tx._id}</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
