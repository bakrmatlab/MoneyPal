import { useState } from 'react';
import { api } from '@convex/_generated/api';
import { useMutation } from 'convex/react';
import { ArrowDownToLine, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TransactionDialogProps } from './types';

export const DepositDialog = ({ walletId, walletName }: TransactionDialogProps) => {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [isPending, setIsPending] = useState(false);
    const deposit = useMutation(api.wallets.deposit);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        setIsPending(true);
        try {
            await deposit({ walletId, amount: numAmount });
            setAmount('');
            setOpen(false);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='flex-1 gap-2'>
                    <ArrowDownToLine className='size-4' />
                    Deposit
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Deposit Funds</DialogTitle>
                        <DialogDescription>Add funds to {walletName ?? 'this wallet'}.</DialogDescription>
                    </DialogHeader>
                    <div className='py-4'>
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
                                className='pl-7'
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type='button' variant='outline' disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type='submit' disabled={isPending || !amount || parseFloat(amount) <= 0}>
                            {isPending && <Loader2 className='size-4 animate-spin' />}
                            Deposit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
