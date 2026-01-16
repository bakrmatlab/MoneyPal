import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryBreakdownProps {
    data?: Array<{
        categoryId: string;
        categoryName: string;
        categoryColor: string;
        categoryIcon: string;
        total: number;
        count: number;
        percentage: number;
    }>;
    topCategories?: Array<{
        categoryId: string;
        categoryName: string;
        categoryColor: string;
        categoryIcon: string;
        total: number;
        count: number;
    }>;
    isLoading: boolean;
}

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const CategoryBreakdown = ({ data, topCategories, isLoading }: CategoryBreakdownProps) => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState<number | undefined>();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                    <CardDescription>Spending by category</CardDescription>
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
                    <CardTitle>Category Breakdown</CardTitle>
                    <CardDescription>Spending by category</CardDescription>
                </CardHeader>
                <CardContent className='flex h-[300px] items-center justify-center'>
                    <p className='text-muted-foreground text-sm'>No expense data available for this period</p>
                </CardContent>
            </Card>
        );
    }

    // Take top 5 categories and group the rest as "Other"
    const topData = data.slice(0, 5);
    const otherTotal = data.slice(5).reduce((sum, item) => sum + item.total, 0);
    const otherCount = data.slice(5).reduce((sum, item) => sum + item.count, 0);
    const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

    const chartData = [
        ...topData.map((item, index) => ({
            name: item.categoryName,
            value: item.total,
            percentage: item.percentage,
            count: item.count,
            icon: item.categoryIcon,
            categoryId: item.categoryId,
            color: CHART_COLORS[index % CHART_COLORS.length],
        })),
    ];

    if (otherTotal > 0) {
        chartData.push({
            name: 'Other',
            value: otherTotal,
            percentage: (otherTotal / grandTotal) * 100,
            count: otherCount,
            icon: '📦',
            categoryId: 'other',
            color: '#6b7280',
        });
    }

    const chartConfig = chartData.reduce((config, item) => {
        config[item.name] = {
            label: item.name,
            color: item.color,
        };
        return config;
    }, {} as ChartConfig);

    const handlePieClick = (categoryId: string) => {
        if (categoryId !== 'other') {
            // Navigate to transactions page with category filter
            navigate({ to: '/transactions', search: { categoryId } });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Top spending categories</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    {/* Pie Chart */}
                    <div className='flex items-center justify-center'>
                        <ChartContainer config={chartConfig} className='h-[250px] w-full'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx='50%'
                                        cy='50%'
                                        labelLine={false}
                                        outerRadius={80}
                                        fill='#8884d8'
                                        dataKey='value'
                                        onMouseEnter={(_, index) => setActiveIndex(index)}
                                        onMouseLeave={() => setActiveIndex(undefined)}
                                        onClick={(data) => handlePieClick(data.categoryId)}
                                        className='cursor-pointer'>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.6}
                                            />
                                        ))}
                                    </Pie>
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                formatter={(value, name, props) => (
                                                    <div className='flex flex-col gap-1'>
                                                        <div className='flex items-center gap-2'>
                                                            <span>{props.payload.icon}</span>
                                                            <span className='font-medium'>{name}</span>
                                                        </div>
                                                        <div className='text-sm'>Amount: {formatCurrency(value as number)}</div>
                                                        <div className='text-muted-foreground text-xs'>
                                                            {props.payload.count} transaction{props.payload.count !== 1 ? 's' : ''} •{' '}
                                                            {props.payload.percentage.toFixed(1)}%
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        }
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>

                    {/* Top Categories List */}
                    <div className='space-y-2'>
                        <h4 className='text-sm font-semibold'>Top Categories</h4>
                        <div className='space-y-2'>
                            {topCategories?.slice(0, 5).map((category, index) => (
                                <div
                                    key={category.categoryId}
                                    className='hover:bg-accent flex cursor-pointer items-center justify-between rounded-lg border p-2 transition-colors'
                                    onClick={() => handlePieClick(category.categoryId)}>
                                    <div className='flex items-center gap-2'>
                                        <div className='h-3 w-3 rounded-full' style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                        <span className='text-sm'>
                                            {category.categoryIcon} {category.categoryName}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Badge variant='secondary' className='text-xs'>
                                            {category.count}
                                        </Badge>
                                        <span className='text-sm font-semibold'>{formatCurrency(category.total)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
