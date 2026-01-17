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
                return <ArrowDownToLine className='size-5 text-green-500' />;
            case 'withdrawal':
                return <ArrowUpFromLine className='size-5 text-red-500' />;
            case 'transfer':
                return <ArrowLeftRight className='size-5 text-blue-500' />;
            case 'e-transfer':
                // Show different icon based on sent/received
                return tx.isOutgoing ? <Send className='size-5 text-orange-500' /> : <ArrowDownToLine className='size-5 text-green-500' />;
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
                return 'text-green-600 dark:text-green-400';
            case 'withdrawal':
                return 'text-red-600 dark:text-red-400';
            case 'transfer':
                return 'text-blue-600 dark:text-blue-400';
            case 'e-transfer':
                // Received = green (money in), Sent = orange (money out)
                return tx.isOutgoing ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400';
            default:
                return '';
        }
    };

    return (
        <div className='hover:bg-accent flex flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center md:gap-4 md:p-4'>
            <div className='flex flex-1 items-center gap-3 md:gap-4'>
                {/* Icon */}
                <div className='bg-muted flex size-9 shrink-0 items-center justify-center rounded-full md:size-10'>{getIcon()}</div>

                {/* Transaction Details */}
                <div className='min-w-0 flex-1 space-y-0.5 md:space-y-1'>
                    <div className='flex flex-wrap items-center gap-1.5 md:gap-2'>
                        <p className='truncate text-sm font-medium md:text-base'>{tx.description || 'No description'}</p>
                        <Badge variant='outline' className='shrink-0 text-[10px] md:text-xs'>
                            {getTypeLabel()}
                        </Badge>
                        {tx.category && (
                            <Badge
                                variant='secondary'
                                className='shrink-0 text-[10px] md:text-xs'
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
                <p className={`text-base font-semibold md:text-lg ${getAmountColor()}`}>
                    {tx.type === 'deposit' || (tx.type === 'e-transfer' && !tx.isOutgoing)
                        ? '+'
                        : tx.type === 'withdrawal' || (tx.type === 'e-transfer' && tx.isOutgoing)
                          ? '-'
                          : ''}
                    {formatCurrency(tx.amount)}
                </p>

                {/* View Details Button */}
                <Button variant='ghost' size='icon' className='size-8 shrink-0 md:size-9' onClick={() => setIsDetailsOpen(true)}>
                    <Info className='size-3.5 md:size-4' />
                </Button>
            </div>

            {/* Transaction Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className='sm:max-w-[500px]'>
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                        <DialogDescription>Complete information about this transaction</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div className='flex items-center gap-3'>
                            <div className='bg-muted flex size-12 shrink-0 items-center justify-center rounded-full'>{getIcon()}</div>
                            <div>
                                <p className='text-muted-foreground text-sm font-medium'>Type</p>
                                <p className='font-semibold'>{getTypeLabel()}</p>
                            </div>
                        </div>

                        <div className='space-y-3 rounded-lg border p-4'>
                            <div>
                                <p className='text-muted-foreground text-sm font-medium'>Amount</p>
                                <p className={`text-2xl font-bold ${getAmountColor()}`}>
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
                                <p className='font-medium'>{tx.description || 'No description provided'}</p>
                            </div>

                            <div>
                                <p className='text-muted-foreground text-sm font-medium'>Date</p>
                                <p className='font-medium'>
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
                                <p className='font-medium'>{tx.wallet?.name || 'Unknown Wallet'}</p>
                            </div>

                            {tx.type === 'e-transfer' && tx.recipientUser && (
                                <>
                                    <div>
                                        <p className='text-muted-foreground text-sm font-medium'>Recipient</p>
                                        <p className='font-medium'>{tx.recipientUser.fullName}</p>
                                        <p className='text-muted-foreground text-xs'>{tx.recipientUser.email}</p>
                                    </div>
                                    {tx.recipientWallet && (
                                        <div>
                                            <p className='text-muted-foreground text-sm font-medium'>Recipient Wallet</p>
                                            <p className='font-medium'>{tx.recipientWallet.name}</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {tx.toWallet && (
                                <div>
                                    <p className='text-muted-foreground text-sm font-medium'>To Wallet</p>
                                    <p className='font-medium'>{tx.toWallet.name}</p>
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
                                <p className='font-mono text-xs'>{tx._id}</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
