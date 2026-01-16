import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

interface SpendingChartProps {
    data?: Array<{ month: string; income: number; expenses: number }>;
    isLoading: boolean;
    dateRange: string;
}

const chartConfig = {
    income: {
        label: 'Income',
        color: '#10b981',
    },
    expenses: {
        label: 'Expenses',
        color: '#ef4444',
    },
} satisfies ChartConfig;

export const SpendingChart = ({ data, isLoading, dateRange }: SpendingChartProps) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Spending Trends</CardTitle>
                    <CardDescription>Income and expenses over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-[300px] w-full' />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Spending Trends</CardTitle>
                    <CardDescription>Income and expenses over time</CardDescription>
                </CardHeader>
                <CardContent className='flex h-[300px] items-center justify-center'>
                    <p className='text-muted-foreground text-sm'>No data available for this period</p>
                </CardContent>
            </Card>
        );
    }

    // Format month labels based on date range
    const formatLabel = (month: string) => {
        // For daily grouping (today, last 7 days)
        if (['today', 'last7days'].includes(dateRange)) {
            const date = new Date(month);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        // For monthly grouping (last 30/90 days, all time)
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    };

    const chartData = data.map((item) => ({
        ...item,
        label: formatLabel(item.month),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Income and expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className='h-[300px] w-full'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                                    <ChartTooltipContent
                                        formatter={(value) => formatCurrency(value as number)}
                                        labelFormatter={(label) => `Period: ${label}`}
                                    />
                                }
                            />
                            <Line
                                type='monotone'
                                dataKey='income'
                                stroke='var(--color-income)'
                                strokeWidth={2}
                                dot={{ fill: 'var(--color-income)', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type='monotone'
                                dataKey='expenses'
                                stroke='var(--color-expenses)'
                                strokeWidth={2}
                                dot={{ fill: 'var(--color-expenses)', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
