import { useState } from 'react';
import type { Id } from '@convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionFilters } from './components/transaction-filters';
import { TransactionList } from './components/transaction-list';

export const TransactionsPage = () => {
    const [walletId, setWalletId] = useState<Id<'wallets'> | undefined>();
    const [type, setType] = useState<'deposit' | 'withdrawal' | 'transfer' | undefined>();
    const [categoryId, setCategoryId] = useState<Id<'categories'> | undefined>();
    const [dateRange, setDateRange] = useState<string>('all');

    const handleClearFilters = () => {
        setWalletId(undefined);
        setType(undefined);
        setCategoryId(undefined);
        setDateRange('all');
    };

    return (
        <div className='container mx-auto space-y-4 px-4 py-4 md:space-y-6 md:px-6 md:py-6'>
            <div>
                <h1 className='text-2xl font-bold md:text-3xl'>Transactions</h1>
                <p className='text-muted-foreground mt-1 text-xs md:mt-2 md:text-sm'>View and manage all your transaction history</p>
            </div>

            <Card>
                <CardHeader className='p-4 md:p-6'>
                    <CardTitle className='text-base md:text-lg'>Filter Transactions</CardTitle>
                    <CardDescription className='text-xs md:text-sm'>Filter by wallet, type, category, or date range</CardDescription>
                </CardHeader>
                <CardContent className='p-4 pt-0 md:p-6 md:pt-0'>
                    <TransactionFilters
                        walletId={walletId}
                        setWalletId={setWalletId}
                        type={type}
                        setType={setType}
                        categoryId={categoryId}
                        setCategoryId={setCategoryId}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        onClearFilters={handleClearFilters}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className='p-4 md:p-6'>
                    <CardTitle className='text-base md:text-lg'>Transaction History</CardTitle>
                    <CardDescription className='text-xs md:text-sm'>All your financial activities</CardDescription>
                </CardHeader>
                <CardContent className='p-4 pt-0 md:p-6 md:pt-0'>
                    <TransactionList walletId={walletId} type={type} categoryId={categoryId} dateRange={dateRange} />
                </CardContent>
            </Card>
        </div>
    );
};
