import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, MoreVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TransactionItemProps {
    transaction: {
        _id: string;
        type: 'deposit' | 'withdrawal' | 'transfer';
        amount: number;
        description?: string;
        _creationTime: number;
        wallet: { name?: string } | null;
        category?: { name: string; color: string; icon: string } | null;
        toWallet?: { name?: string } | null;
    };
}

export const TransactionItem = ({ transaction }: TransactionItemProps) => {
    const tx = transaction;

    const getIcon = () => {
        switch (tx.type) {
            case 'deposit':
                return <ArrowDownToLine className='size-5 text-green-500' />;
            case 'withdrawal':
                return <ArrowUpFromLine className='size-5 text-red-500' />;
            case 'transfer':
                return <ArrowLeftRight className='size-5 text-blue-500' />;
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
                    {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}
                    {formatCurrency(tx.amount)}
                </p>

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='size-8 shrink-0 md:size-9'>
                            <MoreVertical className='size-3.5 md:size-4' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className='text-destructive'>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
