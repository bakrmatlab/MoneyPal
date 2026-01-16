import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

interface TrendsChartProps {
    walletId: Id<'wallets'>;
    startDate?: number;
    endDate?: number;
}

const chartConfig = {
    balance: {
        label: 'Balance',
        color: '#8b5cf6',
    },
} satisfies ChartConfig;

export const TrendsChart = ({ walletId, startDate, endDate }: TrendsChartProps) => {
    const { data: balanceHistory, isPending: isLoading } = useQuery(
        convexQuery(api.analytics.getWalletBalanceHistory, {
            walletId,
            startDate,
            endDate,
        })
    );

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Wallet Balance History</CardTitle>
                    <CardDescription>Track your wallet balance over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-[300px] w-full' />
                </CardContent>
            </Card>
        );
    }

    if (!balanceHistory || balanceHistory.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Wallet Balance History</CardTitle>
                    <CardDescription>Track your wallet balance over time</CardDescription>
                </CardHeader>
                <CardContent className='flex h-[300px] items-center justify-center'>
                    <p className='text-muted-foreground text-sm'>No balance history available</p>
                </CardContent>
            </Card>
        );
    }

    // Format date labels
    const chartData = balanceHistory.map((item) => ({
        ...item,
        label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    // Determine if balance is generally increasing or decreasing
    const firstBalance = chartData[0]?.balance ?? 0;
    const lastBalance = chartData[chartData.length - 1]?.balance ?? 0;
    const isIncreasing = lastBalance >= firstBalance;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Wallet Balance History</CardTitle>
                <CardDescription>Track your wallet balance over time</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className='h-[300px] w-full'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id='colorBalance' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='5%' stopColor='var(--color-balance)' stopOpacity={0.8} />
                                    <stop offset='95%' stopColor='var(--color-balance)' stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                            <XAxis
                                dataKey='label'
                                className='text-xs'
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                            />
                            <YAxis
                                className='text-xs'
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={{ stroke: 'hsl(var(--border))' }}
                                tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent formatter={(value) => formatCurrency(value as number)} labelFormatter={(label) => `Date: ${label}`} />
                                }
                            />
                            <Area type='monotone' dataKey='balance' stroke='var(--color-balance)' strokeWidth={2} fillOpacity={1} fill='url(#colorBalance)' />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className='mt-4 flex items-center justify-center gap-2'>
                    <span className='text-muted-foreground text-sm'>{isIncreasing ? '📈 Growing' : '📉 Declining'}</span>
                    <span className='text-sm font-semibold'>
                        {isIncreasing ? '+' : ''}
                        {formatCurrency(lastBalance - firstBalance)}
                    </span>
                    {firstBalance !== 0 && (
                        <span className='text-muted-foreground text-xs'>({(((lastBalance - firstBalance) / Math.abs(firstBalance)) * 100).toFixed(1)}%)</span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
