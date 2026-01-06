import { useState } from 'react';
import { api } from '@convex/_generated/api';
import { useMutation } from 'convex/react';
import { ArrowUpFromLine, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TransactionDialogProps } from './types';

export const WithdrawDialog = ({ walletId, walletName, balance = 0 }: TransactionDialogProps) => {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [isPending, setIsPending] = useState(false);
    const withdraw = useMutation(api.wallets.withdraw);

    const numAmount = parseFloat(amount) || 0;
    const isOverBalance = numAmount > balance;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNaN(numAmount) || numAmount <= 0 || isOverBalance) return;

        setIsPending(true);
        try {
            await withdraw({ walletId, amount: numAmount });
            setAmount('');
            setOpen(false);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='flex-1 gap-2' disabled={balance === 0}>
                    <ArrowUpFromLine className='size-4' />
                    Withdraw
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Withdraw Funds</DialogTitle>
                        <DialogDescription>
                            Withdraw from {walletName ?? 'this wallet'}. Available: {formatCurrency(balance)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className='py-4'>
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
                                className='pl-7'
                                autoFocus
                            />
                        </div>
                        {isOverBalance && <p className='text-destructive mt-2 text-sm'>Amount exceeds available balance</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type='button' variant='outline' disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type='submit' disabled={isPending || !amount || numAmount <= 0 || isOverBalance}>
                            {isPending && <Loader2 className='size-4 animate-spin' />}
                            Withdraw
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
