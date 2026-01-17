import { useState } from 'react';
import type { Id } from '@convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionFilters } from './components/transaction-filters';
import { TransactionList } from './components/transaction-list';

export const TransactionsPage = () => {
    const [walletId, setWalletId] = useState<Id<'wallets'> | undefined>();
    const [type, setType] = useState<'deposit' | 'withdrawal' | 'transfer' | 'e-transfer' | undefined>();
    const [categoryId, setCategoryId] = useState<Id<'categories'> | undefined>();
    const [dateRange, setDateRange] = useState<string>('all');

    const handleClearFilters = () => {
        setWalletId(undefined);
        setType(undefined);
        setCategoryId(undefined);
        setDateRange('all');
    };

    return (
        <div className='container mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8'>
            <div>
                <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Transactions</h1>
                <p className='text-muted-foreground mt-2 text-sm sm:text-base'>View and manage all your transaction history</p>
            </div>

            <Card>
                <CardHeader className='space-y-1.5 p-6'>
                    <CardTitle className='text-lg sm:text-xl'>Filter Transactions</CardTitle>
                    <CardDescription className='text-sm'>Filter by wallet, type, category, or date range</CardDescription>
                </CardHeader>
                <CardContent className='p-6 pt-0'>
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
                <CardHeader className='space-y-1.5 p-6'>
                    <CardTitle className='text-lg sm:text-xl'>Transaction History</CardTitle>
                    <CardDescription className='text-sm'>All your financial activities</CardDescription>
                </CardHeader>
                <CardContent className='p-6 pt-0'>
                    <TransactionList walletId={walletId} type={type} categoryId={categoryId} dateRange={dateRange} />
                </CardContent>
            </Card>
        </div>
    );
};
