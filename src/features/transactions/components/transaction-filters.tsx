import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionFiltersProps {
    walletId: Id<'wallets'> | undefined;
    setWalletId: (id: Id<'wallets'> | undefined) => void;
    type: 'deposit' | 'withdrawal' | 'transfer' | undefined;
    setType: (type: 'deposit' | 'withdrawal' | 'transfer' | undefined) => void;
    categoryId: Id<'categories'> | undefined;
    setCategoryId: (id: Id<'categories'> | undefined) => void;
    dateRange: string;
    setDateRange: (range: string) => void;
    onClearFilters: () => void;
}

export const TransactionFilters = ({
    walletId,
    setWalletId,
    type,
    setType,
    categoryId,
    setCategoryId,
    dateRange,
    setDateRange,
    onClearFilters,
}: TransactionFiltersProps) => {
    const { data: wallets = [] } = useQuery(convexQuery(api.wallets.getMyWallets, {}));

    const { data: categories = [] } = useQuery(convexQuery(api.categories.getCategories, {}));

    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4'>
                {/* Wallet Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='wallet-filter'>Wallet</Label>
                    <Select value={walletId ?? 'all'} onValueChange={(v) => setWalletId(v === 'all' ? undefined : (v as Id<'wallets'>))}>
                        <SelectTrigger id='wallet-filter'>
                            <SelectValue placeholder='All Wallets' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Wallets</SelectItem>
                            {wallets.map((wallet) => (
                                <SelectItem key={wallet._id} value={wallet._id}>
                                    {wallet.name || 'Unnamed Wallet'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Type Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='type-filter'>Type</Label>
                    <Select value={type ?? 'all'} onValueChange={(v) => setType(v === 'all' ? undefined : (v as 'deposit' | 'withdrawal' | 'transfer'))}>
                        <SelectTrigger id='type-filter'>
                            <SelectValue placeholder='All Types' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Types</SelectItem>
                            <SelectItem value='deposit'>Deposit</SelectItem>
                            <SelectItem value='withdrawal'>Withdrawal</SelectItem>
                            <SelectItem value='transfer'>Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Category Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='category-filter'>Category</Label>
                    <Select value={categoryId ?? 'all'} onValueChange={(v) => setCategoryId(v === 'all' ? undefined : (v as Id<'categories'>))}>
                        <SelectTrigger id='category-filter'>
                            <SelectValue placeholder='All Categories' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Categories</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category._id} value={category._id}>
                                    {category.icon} {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Range Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='date-filter'>Date Range</Label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger id='date-filter'>
                            <SelectValue placeholder='All Time' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Time</SelectItem>
                            <SelectItem value='today'>Today</SelectItem>
                            <SelectItem value='week'>This Week</SelectItem>
                            <SelectItem value='month'>This Month</SelectItem>
                            <SelectItem value='year'>This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Clear Filters Button */}
            <div className='flex justify-center sm:justify-end'>
                <Button variant='outline' size='sm' onClick={onClearFilters} className='w-full sm:w-auto'>
                    <X className='mr-2 size-4' />
                    Clear Filters
                </Button>
            </div>
        </div>
    );
};
