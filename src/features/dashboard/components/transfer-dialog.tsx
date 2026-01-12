import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { useMutation } from 'convex/react';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionDialogProps } from './types';

type TransferDialogProps = TransactionDialogProps & {
    onRequest?: (args: { fromWalletId: any; toWalletId: any; amount: number }) => void;
};

export const TransferDialog = ({ walletId, walletName, balance = 0, onRequest }: TransferDialogProps) => {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [toWalletId, setToWalletId] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isPending, setIsPending] = useState(false);
    const queryClient = useQueryClient();
    const transfer = useMutation(api.wallets.transfer);

    const { data: wallets } = useQuery(convexQuery(api.wallets.getMyWallets));

    const otherWallets = (wallets ?? []).filter((w: any) => String(w._id) !== String(walletId));
    const hasOtherWallets = otherWallets.length > 0;

    const numAmount = parseFloat(amount) || 0;
    const isOverBalance = numAmount > balance;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!toWalletId) return;
        if (isNaN(numAmount) || numAmount <= 0 || isOverBalance) return;

        setIsPending(true);
        try {
            await transfer({ fromWalletId: walletId, toWalletId, amount: numAmount, description: description || undefined });

            setAmount('');
            setToWalletId(null);
            setDescription('');
            setOpen(false);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant='outline'
                    size='sm'
                    className='flex-1 gap-2'
                    disabled={balance === 0 || !hasOtherWallets}
                    title={!hasOtherWallets ? 'Create another wallet to transfer funds' : undefined}>
                    <ArrowLeftRight className='size-4' />
                    Transfer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Transfer Funds</DialogTitle>
                        <DialogDescription>
                            Transfer from {walletName ?? 'this wallet'}. Available: {formatCurrency(balance)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='py-4'>
                        <Label htmlFor='to-wallet'>Destination Wallet</Label>
                        <div className='mt-2'>
                            <Select value={toWalletId ?? ''} onValueChange={(v) => setToWalletId(v || null)}>
                                <SelectTrigger id='to-wallet' className='w-full'>
                                    <SelectValue>{toWalletId ? undefined : 'Select wallet'}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {otherWallets.map((w: any) => (
                                        <SelectItem key={String(w._id)} value={String(w._id)}>
                                            {w.name ?? 'Unnamed Wallet'} — {formatCurrency(w.balance)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='py-4'>
                        <Label htmlFor='transfer-amount'>Amount</Label>
                        <div className='relative mt-2'>
                            <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2'>$</span>
                            <Input
                                id='transfer-amount'
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
                        {isOverBalance && <p className='text-destructive mt-2 text-sm'>Amount exceeds available balance</p>}
                    </div>
                    <div className='py-4'>
                        <Label htmlFor='transfer-description'>Description (Optional)</Label>
                        <div className='mt-2'>
                            <Input
                                id='transfer-description'
                                type='text'
                                placeholder='e.g., Moving savings, Splitting expenses'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type='button' variant='outline' disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type='submit' disabled={isPending || !amount || numAmount <= 0 || isOverBalance || !toWalletId}>
                            {isPending && <Loader2 className='size-4 animate-spin' />}
                            Transfer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
