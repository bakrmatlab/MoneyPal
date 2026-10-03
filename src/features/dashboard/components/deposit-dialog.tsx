import { useState } from 'react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { ArrowDownToLine, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategorySelector } from './category-selector';
import type { TransactionDialogProps } from './types';

export const DepositDialog = ({ walletId, walletName }: TransactionDialogProps) => {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState<Id<'categories'> | undefined>();
    const [isPending, setIsPending] = useState(false);
    const deposit = useMutation(api.wallets.deposit);
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        setIsPending(true);
        try {
            await deposit({ walletId, amount: numAmount, description, categoryId });
            setAmount('');
            setCategoryId(undefined);
            setDescription('');
            setOpen(false);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='min-h-11 flex-1 gap-2 rounded-sm'>
                    <ArrowDownToLine className='size-4' />
                    Deposit
                </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[85dvh] overflow-y-auto rounded-sm'>
                <form onSubmit={handleSubmit}>
                    <DialogHeader className='border-b pb-5 text-left'>
                        <DialogTitle className='text-xl font-semibold tracking-tight'>Deposit Funds</DialogTitle>
                        <DialogDescription className='break-words'>Add funds to {walletName ?? 'this wallet'}.</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-5 py-5'>
                        <div>
                            <Label htmlFor='deposit-amount'>Amount</Label>
                            <div className='relative mt-2'>
                                <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2'>$</span>
                                <Input
                                    id='deposit-amount'
                                    type='number'
                                    min='0.01'
                                    step='0.01'
                                    placeholder='0.00'
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className='h-11 rounded-sm pl-7 text-base text-xl tabular-nums'
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor='deposit-category'>Category (Optional)</Label>
                            <div className='mt-2 mb-2'>
                                <CategorySelector
                                    id='deposit-category'
                                    type='income'
                                    value={categoryId}
                                    onChange={setCategoryId}
                                    placeholder='Select income category...'
                                />
                            </div>
                            <div>
                                <Label htmlFor='deposit-description'>Description (Optional)</Label>
                                <div className='mt-2'>
                                    <Input
                                        id='deposit-description'
                                        type='text'
                                        placeholder='e.g., Salary, Freelance payment'
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className='h-11 rounded-sm text-base'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className='border-t pt-5'>
                        <DialogClose asChild>
                            <Button type='button' variant='outline' disabled={isPending} className='min-h-11 rounded-sm'>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type='submit' disabled={isPending || !amount || parseFloat(amount) <= 0} className='min-h-11 rounded-sm'>
                            {isPending && <Loader2 className='size-4 animate-spin' />}
                            Deposit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
