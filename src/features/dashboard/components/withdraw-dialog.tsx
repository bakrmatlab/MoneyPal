import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { ArrowUpFromLine, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CategorySelector } from './category-selector';
import type { TransactionDialogProps } from './types';

export const WithdrawDialog = ({ walletId, walletName, balance = 0 }: TransactionDialogProps) => {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<Id<'categories'> | undefined>();
    const [isPending, setIsPending] = useState(false);
    const [showBudgetWarning, setShowBudgetWarning] = useState(false);
    const withdraw = useMutation(api.wallets.withdraw);
    const { data: currentBudget } = useQuery(convexQuery(api.budgets.getCurrentBudget, {}));

    const numAmount = parseFloat(amount) || 0;
    const isOverBalance = numAmount > balance;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNaN(numAmount) || numAmount <= 0 || isOverBalance) return;

        if (currentBudget && currentBudget.spent + numAmount > currentBudget.amount) {
            setShowBudgetWarning(true);
            return;
        }

        setIsPending(true);
        try {
            await withdraw({ walletId, amount: numAmount, description, categoryId });
            setAmount('');
            setCategoryId(undefined);
            setDescription('');
            setOpen(false);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant='outline' size='sm' className='min-h-11 flex-1 gap-2 rounded-sm' disabled={balance === 0}>
                        <ArrowUpFromLine className='size-4' />
                        Withdraw
                    </Button>
                </DialogTrigger>
                <DialogContent className='max-h-[85dvh] overflow-y-auto rounded-sm'>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className='border-b pb-5 text-left'>
                            <DialogTitle className='text-xl font-semibold tracking-tight'>Withdraw Funds</DialogTitle>
                            <DialogDescription className='break-words'>
                                Withdraw from {walletName ?? 'this wallet'}. Available: {formatCurrency(balance)}
                            </DialogDescription>
                        </DialogHeader>
                        <div className='space-y-5 py-5'>
                            <div>
                                <Label htmlFor='withdraw-amount'>Amount</Label>
                                <div className='relative mt-2'>
                                    <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2'>$</span>
                                    <Input
                                        id='withdraw-amount'
                                        type='number'
                                        min='0.01'
                                        step='0.01'
                                        max={balance}
                                        placeholder='0.00'
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className='h-11 rounded-sm pl-7 text-base text-xl tabular-nums'
                                        autoFocus
                                    />
                                </div>
                                {isOverBalance && <p className='text-destructive mt-2 text-sm'>Amount exceeds available balance</p>}
                            </div>
                            <div>
                                <Label htmlFor='withdraw-category'>Category (Optional)</Label>
                                <div className='mt-2 mb-2'>
                                    <CategorySelector
                                        id='withdraw-category'
                                        type='expense'
                                        value={categoryId}
                                        onChange={setCategoryId}
                                        placeholder='Select expense category...'
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='withdraw-description'>Description (Optional)</Label>
                                    <div className='mt-2'>
                                        <Input
                                            id='withdraw-description'
                                            type='text'
                                            placeholder='e.g., Groceries, Rent, Entertainment'
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
                            <Button type='submit' disabled={isPending || !amount || numAmount <= 0 || isOverBalance} className='min-h-11 rounded-sm'>
                                {isPending && <Loader2 className='size-4 animate-spin' />}
                                Withdraw
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <AlertDialog open={showBudgetWarning} onOpenChange={setShowBudgetWarning}>
                <AlertDialogContent className='max-h-[85dvh] overflow-y-auto rounded-sm'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Exceeds Monthly Budget</AlertDialogTitle>
                        <AlertDialogDescription>This withdrawal will exceed your monthly budget. Do you want to continue?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='min-h-11 rounded-sm'>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setShowBudgetWarning(false);
                                setIsPending(true);
                                void withdraw({ walletId, amount: numAmount, description, categoryId })
                                    .then(() => {
                                        setAmount('');
                                        setCategoryId(undefined);
                                        setDescription('');
                                        setOpen(false);
                                    })
                                    .finally(() => setIsPending(false));
                            }}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
