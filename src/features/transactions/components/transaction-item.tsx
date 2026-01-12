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
        <div className='hover:bg-accent flex items-center gap-4 rounded-lg border p-4 transition-colors'>
            {/* Icon */}
            <div className='bg-muted flex size-10 items-center justify-center rounded-full'>{getIcon()}</div>

            {/* Transaction Details */}
            <div className='flex-1 space-y-1'>
                <div className='flex items-center gap-2'>
                    <p className='font-medium'>{tx.description || 'No description'}</p>
                    <Badge variant='outline' className='text-xs'>
                        {getTypeLabel()}
                    </Badge>
                    {tx.category && (
                        <Badge variant='secondary' className='text-xs' style={{ backgroundColor: tx.category.color + '20', color: tx.category.color }}>
                            {tx.category.icon} {tx.category.name}
                        </Badge>
                    )}
                </div>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <span>{tx.wallet?.name || 'Unknown Wallet'}</span>
                    {tx.toWallet && (
                        <>
                            <span>→</span>
                            <span>{tx.toWallet.name}</span>
                        </>
                    )}
                    <span>•</span>
                    <span>{new Date(tx._creationTime).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Amount */}
            <div className='flex items-center gap-4'>
                <p className={`text-lg font-semibold ${getAmountColor()}`}>
                    {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}
                    {formatCurrency(tx.amount)}
                </p>

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                            <MoreVertical className='size-4' />
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
