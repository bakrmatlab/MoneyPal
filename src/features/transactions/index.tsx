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
                <h1 className='text-3xl font-semibold tracking-tight'>Transactions</h1>
                <p className='text-muted-foreground mt-2 text-sm sm:text-base'>Your financial activity, in one place.</p>
            </div>

            <Card className='gap-0 rounded-sm shadow-none'>
                <CardHeader className='space-y-2 border-b p-5 sm:p-6'>
                    <CardTitle className='font-mono text-xs font-medium tracking-widest uppercase'>01 / Filters</CardTitle>
                    <CardDescription className='text-sm'>Filter by wallet, type, category, or date range</CardDescription>
                </CardHeader>
                <CardContent className='p-5 sm:p-6'>
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

            <Card className='gap-0 rounded-sm shadow-none'>
                <CardHeader className='space-y-2 border-b p-5 sm:p-6'>
                    <CardTitle className='font-mono text-xs font-medium tracking-widest uppercase'>02 / Transaction history</CardTitle>
                    <CardDescription className='text-sm'>All your financial activities</CardDescription>
                </CardHeader>
                <CardContent className='p-5 sm:p-6'>
                    <TransactionList walletId={walletId} type={type} categoryId={categoryId} dateRange={dateRange} />
                </CardContent>
            </Card>
        </div>
    );
};
