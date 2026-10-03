import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery, useConvexAuth } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { useMutation } from 'convex/react';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { getConvexErrorMessage } from '@/lib/convex-errors';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function BudgetCard() {
    const { isAuthenticated } = useConvexAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { data: budget, isPending } = useQuery({
        ...convexQuery(api.budgets.getCurrentBudget, {}),
        enabled: isAuthenticated,
    });

    const setBudget = useMutation(api.budgets.setBudget);

    const spent = budget?.spent ?? 0;
    const amount = budget?.amount ?? 0;
    const remaining = Math.max(0, amount - spent);
    const percentage = amount > 0 ? Math.min(100, (spent / amount) * 100) : 0;

    const progressColor = percentage >= 100 ? 'bg-destructive' : percentage >= 80 ? 'bg-warning' : 'bg-primary';

    const handleEdit = () => {
        setInputValue(budget ? String(budget.amount) : '');
        setIsEditing(true);
    };

    const handleSave = async () => {
        const num = parseFloat(inputValue);
        if (isNaN(num) || num <= 0) {
            toast.error('Enter a valid budget amount');
            return;
        }
        setIsSaving(true);
        try {
            await setBudget({ amount: num });
            toast.success('Budget updated');
            setIsEditing(false);
        } catch (err) {
            toast.error(getConvexErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setInputValue('');
    };

    return (
        <Card className='min-w-0 gap-6 rounded-none border-0 border-t py-6 shadow-none sm:py-8 lg:border-t-0 lg:border-l lg:py-10'>
            <CardHeader className='px-6 sm:px-8'>
                <div className='flex items-center justify-between gap-3'>
                    <h2 className='text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase'>Monthly budget</h2>
                    {!isEditing && (
                        <Button variant='ghost' size='icon' className='size-11 shrink-0 rounded-sm' onClick={handleEdit} aria-label='Edit monthly budget'>
                            <Pencil className='size-4' />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className='space-y-4 px-6 sm:px-8'>
                {isPending ? (
                    <>
                        <Skeleton className='h-8 w-28' />
                        <Skeleton className='h-2 w-full' />
                        <Skeleton className='h-4 w-36' />
                    </>
                ) : isEditing ? (
                    <div className='space-y-2'>
                        <div className='relative'>
                            <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm'>$</span>
                            <Input
                                type='number'
                                min='0.01'
                                step='0.01'
                                placeholder='0.00'
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className='rounded-sm pl-7'
                                aria-label='Monthly budget amount'
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') void handleSave();
                                    if (e.key === 'Escape') handleCancel();
                                }}
                            />
                        </div>
                        <div className='flex gap-2'>
                            <Button size='sm' onClick={() => void handleSave()} disabled={isSaving} className='flex-1'>
                                <Check className='mr-1 size-3.5' />
                                Save
                            </Button>
                            <Button size='sm' variant='outline' onClick={handleCancel} disabled={isSaving} aria-label='Cancel budget edit'>
                                <X className='size-3.5' />
                            </Button>
                        </div>
                    </div>
                ) : budget ? (
                    <>
                        <p className='text-primary text-3xl font-medium tracking-tight break-all tabular-nums sm:text-4xl'>{formatCurrency(spent)}</p>
                        <div
                            role='progressbar'
                            aria-label='Monthly budget spent'
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percentage}
                            className='bg-secondary relative h-2 w-full overflow-hidden rounded-sm'>
                            <div className={`h-full transition-[width] ${progressColor}`} style={{ width: `${percentage}%` }} />
                        </div>
                        <p className='text-muted-foreground text-sm'>
                            {percentage >= 100 ? (
                                <span className='text-destructive font-semibold'>Over budget by {formatCurrency(spent - amount)}</span>
                            ) : (
                                <>
                                    {formatCurrency(remaining)} remaining of {formatCurrency(amount)}
                                </>
                            )}
                        </p>
                    </>
                ) : (
                    <div className='space-y-2'>
                        <p className='text-muted-foreground text-sm'>No budget set for this month.</p>
                        <Button size='sm' variant='outline' onClick={handleEdit} className='w-full'>
                            Set Budget
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
