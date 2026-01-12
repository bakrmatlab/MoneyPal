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
        <div className='container mx-auto space-y-6 py-6'>
            <div>
                <h1 className='text-3xl font-bold'>Transactions</h1>
                <p className='text-muted-foreground mt-2'>View and manage all your transaction history</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter Transactions</CardTitle>
                    <CardDescription>Filter by wallet, type, category, or date range</CardDescription>
                </CardHeader>
                <CardContent>
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
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>All your financial activities</CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionList walletId={walletId} type={type} categoryId={categoryId} dateRange={dateRange} />
                </CardContent>
            </Card>
        </div>
    );
};
