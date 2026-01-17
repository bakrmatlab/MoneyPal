import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { Send, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SendETransferDialogProps {
    walletId: Id<'wallets'>;
    walletName?: string | null;
    balance?: number;
    triggerButton?: React.ReactNode;
}

export const SendETransferDialog = ({ walletId, walletName, balance = 0, triggerButton }: SendETransferDialogProps) => {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientWalletId, setRecipientWalletId] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const sendETransfer = useMutation(api.transactions.sendETransfer);

    // Look up recipient by email
    const { data: recipient, refetch: searchRecipient } = useQuery({
        ...convexQuery(api.transactions.getUserByEmail, { email: recipientEmail }),
        enabled: false,
    });

    // Get recipient's wallets if recipient found - only query when we have a valid recipient ID
    const hasRecipient = !!recipient?._id;
    const recipientWalletsQuery = useQuery({
        ...convexQuery(api.transactions.getRecipientWallets, {
            userId: recipient?._id as Id<'users'>,
        }),
        enabled: hasRecipient,
    });
    const recipientWallets = hasRecipient ? recipientWalletsQuery.data : undefined;

    const numAmount = parseFloat(amount) || 0;
    const isOverBalance = numAmount > balance;

    const handleSearchRecipient = async () => {
        if (!recipientEmail.trim()) {
            toast.error('Please enter a recipient email');
            return;
        }

        setIsSearching(true);
        setRecipientWalletId(null);
        try {
            await searchRecipient();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error finding recipient');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientWalletId || !recipient) return;
        if (isNaN(numAmount) || numAmount <= 0 || isOverBalance) return;

        setIsPending(true);
        try {
            await sendETransfer({
                walletId,
                recipientEmail: recipient.email,
                recipientWalletId: recipientWalletId as Id<'wallets'>,
                amount: numAmount,
                description: description || undefined,
            });

            toast.success(`Sent ${formatCurrency(numAmount)} to ${recipient.fullName}`);

            // Reset form
            setAmount('');
            setRecipientEmail('');
            setRecipientWalletId(null);
            setDescription('');
            setOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send e-transfer');
        } finally {
            setIsPending(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset form when closing
            setAmount('');
            setRecipientEmail('');
            setRecipientWalletId(null);
            setDescription('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button variant='outline' size='sm' className='flex-1 gap-2' disabled={balance === 0}>
                        <Send className='size-4' />
                        E-Transfer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className='max-w-md'>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Send E-Transfer</DialogTitle>
                        <DialogDescription>
                            Send money from {walletName ?? 'this wallet'}. Available: {formatCurrency(balance)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4 py-4'>
                        {/* Recipient Email */}
                        <div>
                            <Label htmlFor='recipient-email'>Recipient Email</Label>
                            <div className='mt-2 flex gap-2'>
                                <Input
                                    id='recipient-email'
                                    type='email'
                                    placeholder='recipient@example.com'
                                    value={recipientEmail}
                                    onChange={(e) => {
                                        setRecipientEmail(e.target.value);
                                        setRecipientWalletId(null);
                                    }}
                                    disabled={isPending}
                                />
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleSearchRecipient}
                                    disabled={!recipientEmail.trim() || isSearching || isPending}>
                                    {isSearching ? <Loader2 className='size-4 animate-spin' /> : <Search className='size-4' />}
                                </Button>
                            </div>
                            {recipient && (
                                <p className='text-muted-foreground mt-2 text-sm'>
                                    Found: <span className='font-medium'>{recipient.fullName}</span>
                                </p>
                            )}
                        </div>

                        {/* Recipient Wallet Selection */}
                        {recipient && (
                            <div>
                                <Label htmlFor='recipient-wallet'>Recipient Wallet</Label>
                                <div className='mt-2'>
                                    {recipientWalletsQuery.isLoading ? (
                                        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                                            <Loader2 className='size-4 animate-spin' />
                                            Loading wallets...
                                        </div>
                                    ) : recipientWallets && recipientWallets.length > 0 ? (
                                        <Select value={recipientWalletId ?? ''} onValueChange={(v) => setRecipientWalletId(v || null)}>
                                            <SelectTrigger id='recipient-wallet' className='w-full'>
                                                <SelectValue placeholder='Select recipient wallet' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {recipientWallets.map((w) => (
                                                    <SelectItem key={String(w._id)} value={String(w._id)}>
                                                        {w.icon} {w.name ?? 'Unnamed Wallet'} ({w.currency ?? 'USD'})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className='text-destructive text-sm'>Recipient has no available wallets</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Amount */}
                        <div>
                            <Label htmlFor='e-transfer-amount'>Amount</Label>
                            <div className='relative mt-2'>
                                <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2'>$</span>
                                <Input
                                    id='e-transfer-amount'
                                    type='number'
                                    min='0.01'
                                    step='0.01'
                                    placeholder='0.00'
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className='pl-7'
                                    disabled={isPending}
                                />
                            </div>
                            {isOverBalance && <p className='text-destructive mt-2 text-sm'>Amount exceeds available balance</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor='e-transfer-description'>Description (Optional)</Label>
                            <div className='mt-2'>
                                <Input
                                    id='e-transfer-description'
                                    type='text'
                                    placeholder='e.g., Payment for dinner, Birthday gift'
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type='button' variant='outline' disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type='submit' disabled={isPending || !recipient || !recipientWalletId || !amount || numAmount <= 0 || isOverBalance}>
                            {isPending && <Loader2 className='size-4 animate-spin' />}
                            Send E-Transfer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
