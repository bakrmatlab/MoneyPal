import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SpendingLimitStepProps = {
    onFinish: (budget?: number) => void;
    isPending: boolean;
};

export function SpendingLimitStep({ onFinish, isPending }: SpendingLimitStepProps) {
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(amount);
        onFinish(parsed > 0 ? parsed : undefined);
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='text-center'>
                <h2 className='mb-1 text-2xl font-bold tracking-tight'>Set a monthly budget</h2>
                <p className='text-muted-foreground text-sm'>
                    MoneyPal will track your spending against this limit. You can adjust it any time.
                </p>
            </div>

            <div className='flex flex-col gap-2'>
                <Label htmlFor='monthly-budget'>Monthly budget</Label>
                <div className='relative'>
                    <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 select-none text-sm'>$</span>
                    <Input
                        id='monthly-budget'
                        type='number'
                        min='1'
                        step='1'
                        placeholder='e.g., 2000'
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className='pl-7'
                        autoFocus
                    />
                </div>
                <p className='text-muted-foreground text-xs'>Leave empty to skip for now.</p>
            </div>

            <div className='flex flex-col gap-3'>
                <Button type='submit' size='lg' className='w-full' disabled={isPending}>
                    {isPending && <Loader2 className='size-4 animate-spin' />}
                    {amount ? 'Save & Finish' : 'Finish'}
                </Button>
                <Button type='button' variant='ghost' size='sm' onClick={() => onFinish(undefined)} disabled={isPending}>
                    Skip
                </Button>
            </div>
        </form>
    );
}
