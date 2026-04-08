import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery, useConvexAuth } from '@convex-dev/react-query';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { PiggyBank, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { getConvexErrorMessage } from '@/lib/convex-errors';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
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

    const progressColor =
        percentage >= 100
            ? 'bg-destructive'
            : percentage >= 80
              ? 'bg-yellow-500'
              : 'bg-primary';

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
        <Card className='hover:border-primary/50 group relative overflow-hidden transition-all duration-300 hover:shadow-lg'>
            <div className='from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
            <CardHeader className='relative pb-2'>
                <div className='flex items-start justify-between'>
                    <div className='bg-primary/10 ring-primary/20 mb-2 inline-flex size-10 items-center justify-center rounded-xl ring-2 transition-transform duration-300 group-hover:scale-110'>
                        <PiggyBank className='text-primary size-5' />
                    </div>
                    {!isEditing && (
                        <Button variant='ghost' size='icon' className='size-7' onClick={handleEdit}>
                            <Pencil className='size-3.5' />
                        </Button>
                    )}
                </div>
                <CardDescription className='font-medium'>Monthly Budget</CardDescription>
            </CardHeader>
            <CardContent className='relative space-y-3'>
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
                                className='pl-7'
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
                            <Button size='sm' variant='outline' onClick={handleCancel} disabled={isSaving}>
                                <X className='size-3.5' />
                            </Button>
                        </div>
                    </div>
                ) : budget ? (
                    <>
                        <p className='text-3xl font-bold tracking-tight'>{formatCurrency(spent)}</p>
                        <div className='relative h-2 w-full overflow-hidden rounded-full bg-secondary'>
                            <div
                                className={`h-full rounded-full transition-all ${progressColor}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <p className='text-muted-foreground text-xs font-medium'>
                            {percentage >= 100 ? (
                                <span className='text-destructive font-semibold'>
                                    Over budget by {formatCurrency(spent - amount)}
                                </span>
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
