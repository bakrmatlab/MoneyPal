import { formatCurrency } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

export function BudgetHistoryChart({ data, isLoading }: BudgetHistoryChartProps) {
    const chartData = (data ?? []).map((row) => ({
        name: `${MONTH_NAMES[row.month - 1]} ${row.year}`,
        Budget: row.amount,
        Spent: row.spent,
    }));

    return (
        <Card>
            <CardHeader className='p-6 pb-2'>
                <CardTitle className='text-lg sm:text-xl'>Budget vs Actual</CardTitle>
                <CardDescription className='text-sm'>Monthly budget limit compared to actual spending</CardDescription>
            </CardHeader>
            <CardContent className='p-6 pt-2'>
                {isLoading ? (
                    <Skeleton className='h-64 w-full' />
                ) : !data || data.length === 0 ? (
                    <div className='flex h-64 items-center justify-center'>
                        <p className='text-muted-foreground text-sm'>No budget history yet.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width='100%' height={256}>
                        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
                            <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12 }} />
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '13px' }} />
                            <Bar dataKey='Budget' fill='#6366f1' radius={[4, 4, 0, 0]} />
                            <Bar dataKey='Spent' fill='#f43f5e' radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
