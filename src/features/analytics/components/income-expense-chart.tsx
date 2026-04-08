import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

interface IncomeExpenseChartProps {
    data?: Array<{ period: string; income: number; expenses: number; net: number }>;
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

export const IncomeExpenseChart = ({ data, isLoading, dateRange }: IncomeExpenseChartProps) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Income vs Expenses</CardTitle>
                    <CardDescription>Comparison by period</CardDescription>
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
                    <CardTitle>Income vs Expenses</CardTitle>
                    <CardDescription>Comparison by period</CardDescription>
                </CardHeader>
                <CardContent className='flex h-[300px] items-center justify-center'>
                    <p className='text-muted-foreground text-sm'>No data available for this period</p>
                </CardContent>
            </Card>
        );
    }

    // Format period labels
    const formatLabel = (period: string) => {
        // For daily grouping (today, last 7 days)
        if (['today', 'last7days'].includes(dateRange)) {
            const date = new Date(period);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        // For monthly grouping (last 30/90 days, all time)
        const [year, monthNum] = period.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    };

    const chartData = data.map((item) => ({
        ...item,
        label: formatLabel(item.period),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Comparison by period</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className='h-[300px] w-full'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                            <Legend wrapperStyle={{ fontSize: '13px' }} />
                            <Bar dataKey='income' fill='var(--color-income)' radius={[4, 4, 0, 0]} />
                            <Bar dataKey='expenses' fill='var(--color-expenses)' radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
