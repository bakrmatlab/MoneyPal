import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { Download, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryBreakdown } from './components/category-breakdown';
import { IncomeExpenseChart } from './components/income-expense-chart';
import { SpendingChart } from './components/spending-chart';
import { TrendsChart } from './components/trends-chart';

const getDateRangeTimestamp = (dateRange: string) => {
    const now = new Date();

    switch (dateRange) {
        case 'today': {
            // Start of today
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            return startOfDay.getTime();
        }
        case 'week': {
            // Start of current week (Monday)
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);
            return startOfWeek.getTime();
        }
        case 'month': {
            // Start of current month
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            return startOfMonth.getTime();
        }
        case 'year': {
            // Start of current year
            const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
            return startOfYear.getTime();
        }
        case 'last7days': {
            // Last 7 days
            const last7 = new Date(now);
            last7.setDate(last7.getDate() - 7);
            last7.setHours(0, 0, 0, 0);
            return last7.getTime();
        }
        case 'last30days': {
            // Last 30 days
            const last30 = new Date(now);
            last30.setDate(last30.getDate() - 30);
            last30.setHours(0, 0, 0, 0);
            return last30.getTime();
        }
        case 'last90days': {
            // Last 90 days
            const last90 = new Date(now);
            last90.setDate(last90.getDate() - 90);
            last90.setHours(0, 0, 0, 0);
            return last90.getTime();
        }
        default:
            return undefined; // For "all" time
    }
};

const getEndDateTimestamp = () => {
    // End of today - ensures we capture all transactions up to now
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return endOfDay.getTime();
};

export const AnalyticsPage = () => {
    const [dateRange, setDateRange] = useState<string>('last30days');
    const [walletId, setWalletId] = useState<Id<'wallets'> | undefined>();

    const startDate = getDateRangeTimestamp(dateRange);
    const endDate = dateRange === 'all' ? undefined : getEndDateTimestamp();

    // Fetch data
    const { data: wallets = [] } = useQuery(convexQuery(api.wallets.getMyWallets, {}));

    const { data: stats, isPending: statsLoading } = useQuery(
        convexQuery(api.transactions.getTransactionStats, {
            walletId,
            startDate,
            endDate,
        })
    );

    const { data: monthlyTrends, isPending: trendsLoading } = useQuery(
        convexQuery(api.analytics.getMonthlyTrends, {
            walletId,
            startDate,
            endDate,
        })
    );

    const { data: incomeVsExpenses, isPending: comparisonLoading } = useQuery(
        convexQuery(api.analytics.getIncomeVsExpenses, {
            walletId,
            startDate,
            endDate,
            groupBy: ['today', 'last7days'].includes(dateRange) ? 'day' : 'month',
        })
    );

    const { data: categoryBreakdown, isPending: categoryLoading } = useQuery(
        convexQuery(api.analytics.getCategoryBreakdown, {
            walletId,
            startDate,
            endDate,
            type: 'expense',
        })
    );

    const { data: topCategories } = useQuery(
        convexQuery(api.analytics.getTopCategories, {
            walletId,
            startDate,
            endDate,
            limit: 5,
        })
    );

    // Calculate totals
    const totalExpenses = stats?.totalWithdrawals ?? 0;
    const transactionCount = stats?.totalTransactions ?? 0;

    // Calculate current balance
    const currentBalance = walletId ? (wallets.find((w) => w._id === walletId)?.balance ?? 0) : wallets.reduce((sum, w) => sum + w.balance, 0);

    // For "All Time", include initial wallet balances in Total Income
    // Starting Balance = Current Balance - (Deposits - Withdrawals)
    const transactionDeposits = stats?.totalDeposits ?? 0;
    const netChange = stats?.netChange ?? 0;
    const startingBalance = currentBalance - netChange;

    // Total Income includes both initial balance and deposits
    const totalIncome = dateRange === 'all' ? startingBalance + transactionDeposits : transactionDeposits;

    // Export data function
    const handleExportData = () => {
        const now = Date.now();
        const csvData = [
            ['Analytics Report'],
            [`Period: ${dateRange}`],
            [`Date Range: ${new Date(startDate || 0).toLocaleDateString()} - ${new Date(now).toLocaleDateString()}`],
            [],
            ['Summary'],
            ['Total Income', totalIncome],
            ['Total Expenses', totalExpenses],
            ['Net Change', totalIncome - totalExpenses],
            ['Transaction Count', transactionCount],
            [],
            ['Monthly Trends'],
            ['Month', 'Income', 'Expenses'],
            ...(monthlyTrends?.map((t) => [t.month, t.income, t.expenses]) || []),
            [],
            ['Category Breakdown'],
            ['Category', 'Amount', 'Count', 'Percentage'],
            ...(categoryBreakdown?.map((c) => [c.categoryName, c.total, c.count, c.percentage.toFixed(2) + '%']) || []),
        ];

        const csvContent = csvData.map((row) => row.join(',')).join('\\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className='container mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8'>
            {/* Header */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Analytics</h1>
                    <p className='text-muted-foreground mt-2 text-sm sm:text-base'>Comprehensive insights into your financial health</p>
                </div>
                <Button onClick={handleExportData} variant='outline' className='self-start sm:self-auto'>
                    <Download className='mr-2 size-4' />
                    Export Data
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className='space-y-1.5 p-6'>
                    <CardTitle className='text-lg sm:text-xl'>Filters</CardTitle>
                    <CardDescription className='text-sm'>Customize your analytics view</CardDescription>
                </CardHeader>
                <CardContent className='p-6 pt-0'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        {/* Date Range Filter */}
                        <div className='space-y-2'>
                            <Label htmlFor='date-filter'>Date Range</Label>
                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger id='date-filter'>
                                    <SelectValue placeholder='Select period' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='today'>Today</SelectItem>
                                    <SelectItem value='last7days'>Last 7 Days</SelectItem>
                                    <SelectItem value='last30days'>Last 30 Days</SelectItem>
                                    <SelectItem value='last90days'>Last 90 Days</SelectItem>
                                    <SelectItem value='all'>All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

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
                                            {wallet.icon} {wallet.name || 'Unnamed Wallet'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Summary Cards */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {/* Total Income Card */}
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 p-6 pb-2'>
                        <CardTitle className='text-sm font-medium'>Total Income</CardTitle>
                        <TrendingUp className='text-muted-foreground size-4' />
                    </CardHeader>
                    <CardContent className='px-6 pb-6'>
                        {statsLoading ? (
                            <Skeleton className='h-8 w-24' />
                        ) : (
                            <>
                                <div className='text-2xl font-bold'>{formatCurrency(totalIncome)}</div>
                                <p className='text-muted-foreground text-xs'>
                                    {dateRange === 'all'
                                        ? `Includes initial balance`
                                        : `${stats?.depositCount ?? 0} deposit${stats?.depositCount !== 1 ? 's' : ''}`}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Total Expenses Card */}
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 p-6 pb-2'>
                        <CardTitle className='text-sm font-medium'>Total Expenses</CardTitle>
                        <TrendingDown className='text-muted-foreground size-4' />
                    </CardHeader>
                    <CardContent className='px-6 pb-6'>
                        {statsLoading ? (
                            <Skeleton className='h-8 w-24' />
                        ) : (
                            <>
                                <div className='text-2xl font-bold'>{formatCurrency(totalExpenses)}</div>
                                <p className='text-muted-foreground text-xs'>
                                    {stats?.withdrawalCount ?? 0} withdrawal{stats?.withdrawalCount !== 1 ? 's' : ''}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Net Change Card */}
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 p-6 pb-2'>
                        <CardTitle className='text-sm font-medium'>{dateRange === 'all' ? 'Current Balance' : 'Net Change'}</CardTitle>
                        <DollarSign className='text-muted-foreground size-4' />
                    </CardHeader>
                    <CardContent className='px-6 pb-6'>
                        {statsLoading ? (
                            <Skeleton className='h-8 w-24' />
                        ) : (
                            <>
                                <div
                                    className={`text-2xl font-bold ${dateRange === 'all' || totalIncome - totalExpenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {dateRange === 'all' ? '' : totalIncome - totalExpenses >= 0 ? '+' : ''}
                                    {formatCurrency(dateRange === 'all' ? currentBalance : totalIncome - totalExpenses)}
                                </div>
                                <p className='text-muted-foreground text-xs'>
                                    {dateRange === 'all' ? 'Total across all wallets' : totalIncome - totalExpenses >= 0 ? 'Surplus' : 'Deficit'}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Transaction Count Card */}
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 p-6 pb-2'>
                        <CardTitle className='text-sm font-medium'>Transactions</CardTitle>
                        <Activity className='text-muted-foreground size-4' />
                    </CardHeader>
                    <CardContent className='px-6 pb-6'>
                        {statsLoading ? (
                            <Skeleton className='h-8 w-24' />
                        ) : (
                            <>
                                <div className='text-2xl font-bold'>{transactionCount}</div>
                                <p className='text-muted-foreground text-xs'>Total activities</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
                {/* Spending Trends */}
                <SpendingChart data={monthlyTrends} isLoading={trendsLoading} dateRange={dateRange} />

                {/* Income vs Expenses */}
                <IncomeExpenseChart data={incomeVsExpenses} isLoading={comparisonLoading} dateRange={dateRange} />
            </div>

            {/* Category Breakdown and Wallet Trends */}
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
                {/* Category Breakdown */}
                <CategoryBreakdown data={categoryBreakdown} topCategories={topCategories} isLoading={categoryLoading} />

                {/* Wallet Balance Trends */}
                {walletId && <TrendsChart walletId={walletId} startDate={startDate} endDate={endDate} />}
            </div>
        </div>
    );
};
