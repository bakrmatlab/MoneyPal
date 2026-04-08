import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

interface BudgetHistoryRow {
    month: number;
    year: number;
    amount: number;
    spent: number;
}

interface BudgetHistoryChartProps {
    data: BudgetHistoryRow[] | undefined;
    isLoading: boolean;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const chartConfig = {
    Budget: {
        label: 'Budget',
        color: '#6366f1',
    },
    Spent: {
        label: 'Spent',
        color: '#f43f5e',
    },
} satisfies ChartConfig;

export function BudgetHistoryChart({ data, isLoading }: BudgetHistoryChartProps) {
    const chartData = (data ?? []).map((row) => ({
        name: `${MONTH_NAMES[row.month - 1]} ${row.year}`,
        Budget: row.amount,
        Spent: row.spent,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-lg sm:text-xl'>Budget vs Actual</CardTitle>
                <CardDescription className='text-sm'>Monthly budget limit compared to actual spending</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className='h-64 w-full' />
                ) : !data || data.length === 0 ? (
                    <div className='flex h-64 items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>No budget history yet.</p>
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className='h-64 w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
                                <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />} />
                                <Legend wrapperStyle={{ fontSize: '13px' }} />
                                <Bar dataKey='Budget' fill='var(--color-Budget)' radius={[4, 4, 0, 0]} />
                                <Bar dataKey='Spent' fill='var(--color-Spent)' radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
