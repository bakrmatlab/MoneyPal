import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionItem } from './transaction-item';

interface TransactionListProps {
    walletId: Id<'wallets'> | undefined;
    type: 'deposit' | 'withdrawal' | 'transfer' | undefined;
    categoryId: Id<'categories'> | undefined;
    dateRange: string;
}

export const TransactionList = ({ walletId, type, categoryId, dateRange }: TransactionListProps) => {
    const getDateRangeTimestamp = () => {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));

        switch (dateRange) {
            case 'today':
                return startOfDay.getTime();
            case 'week': {
                const weekAgo = new Date(startOfDay);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return weekAgo.getTime();
            }
            case 'month': {
                const monthAgo = new Date(startOfDay);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return monthAgo.getTime();
            }
            case 'year': {
                const yearAgo = new Date(startOfDay);
                yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                return yearAgo.getTime();
            }
            default:
                return undefined;
        }
    };

    const { data: transactions = [], isLoading } = useQuery(
        convexQuery(api.transactions.getTransactions, {
            walletId,
            type,
            categoryId,
            limit: 100, //
        })
    );

    const startTimestamp = getDateRangeTimestamp();
    const filteredTransactions = startTimestamp ? transactions.filter((t) => t._creationTime >= startTimestamp) : transactions;

    if (isLoading) {
        return (
            <div className='space-y-2 md:space-y-3'>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className='flex items-center gap-4 rounded-lg border p-4'>
                        <Skeleton className='size-10 rounded-full' />
                        <div className='flex-1 space-y-2'>
                            <Skeleton className='h-4 w-[200px]' />
                            <Skeleton className='h-3 w-[150px]' />
                        </div>
                        <Skeleton className='h-6 w-20' />
                    </div>
                ))}
            </div>
        );
    }

    if (filteredTransactions.length === 0) {
        return (
            <Alert>
                <AlertCircle className='size-4' />
                <AlertDescription>No transactions found. Try adjusting your filters or make your first transaction!</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className='space-y-2'>
            {filteredTransactions.map((transaction) => (
                <TransactionItem key={transaction._id} transaction={transaction} />
            ))}

            {/* TODO: Add pagination or infinite scroll */}
        </div>
    );
};
