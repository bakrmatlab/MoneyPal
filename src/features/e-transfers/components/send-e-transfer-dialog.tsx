import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { type Id } from '@convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { Send, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SendETransferDialogProps {
    walletId: Id<'wallets'>;
    walletName?: string | null;
    balance?: number;
    triggerButton?: React.ReactNode;
}

export const SendETransferDialog = ({ walletId, walletName, balance = 0, triggerButton }: SendETransferDialogProps) => {
    const [open, setOpen] = useState(false);
    const [comboboxOpen, setComboboxOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<Id<'users'> | null>(null);
    const [recipientWalletId, setRecipientWalletId] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isPending, setIsPending] = useState(false);

    const sendETransfer = useMutation(api.transactions.sendETransfer);

    // Get recent recipients
    const { data: recentRecipients = [] } = useQuery({
        ...convexQuery(api.transactions.getRecentRecipients, { limit: 5 }),
    });

    // Get all users with optional search filter
    const { data: allUsers = [] } = useQuery({
        ...convexQuery(api.users.listUsers, { searchText: searchText || undefined, limit: 100 }),
    });

    // Filter out recent recipients from all users to avoid duplicates in the dropdown (only when not searching)
    const recentRecipientIds = new Set(recentRecipients.map((u) => u._id));
    const filteredAllUsers = searchText ? allUsers : allUsers.filter((u) => !recentRecipientIds.has(u._id));

    // Get selected recipient info
    const selectedRecipient = [...recentRecipients, ...allUsers].find((u) => u._id === selectedUserId);

    // Get recipient's wallets if recipient selected - only query when we have a valid user ID
    const recipientWalletsQuery = useQuery({
        ...convexQuery(api.transactions.getRecipientWallets, {
            userId: selectedUserId ? selectedUserId : undefined,
        }),
        enabled: !!selectedUserId,
    });
    const recipientWallets = recipientWalletsQuery.data;

    const numAmount = parseFloat(amount) || 0;
    const isOverBalance = numAmount > balance;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientWalletId || !selectedRecipient) return;
        if (isNaN(numAmount) || numAmount <= 0 || isOverBalance) return;

        setIsPending(true);
        try {
            await sendETransfer({
                walletId,
                recipientEmail: selectedRecipient.email,
                recipientWalletId: recipientWalletId as Id<'wallets'>,
                amount: numAmount,
                description: description || undefined,
            });

            toast.success(`Sent ${formatCurrency(numAmount)} to ${selectedRecipient.fullName}`);

            // Reset form
            setAmount('');
            setSearchText('');
            setSelectedUserId(null);
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
            setSearchText('');
            setSelectedUserId(null);
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
                        {/* Recipient User Selection */}
                        <div>
                            <Label htmlFor='recipient-user'>Recipient</Label>
                            <div className='mt-2'>
                                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id='recipient-user'
                                            variant='outline'
                                            role='combobox'
                                            aria-expanded={comboboxOpen}
                                            className='w-full justify-between'
                                            disabled={isPending}>
                                            {selectedRecipient ? (
                                                <span className='flex items-center gap-2 truncate'>
                                                    <span className='font-medium'>{selectedRecipient.fullName}</span>
                                                    <span className='text-muted-foreground text-sm'>({selectedRecipient.email})</span>
                                                </span>
                                            ) : (
                                                <span className='text-muted-foreground'>Select recipient...</span>
                                            )}
                                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[400px] p-0' align='start'>
                                        <Command shouldFilter={false}>
                                            <CommandInput placeholder='Search by name or email...' value={searchText} onValueChange={setSearchText} />
                                            <CommandList>
                                                <CommandEmpty>{searchText ? 'No users found.' : 'Browse all users to get started.'}</CommandEmpty>

                                                {/* Recent Recipients */}
                                                {recentRecipients.length > 0 && !searchText && (
                                                    <CommandGroup heading='Recent'>
                                                        {recentRecipients.map((user) => (
                                                            <CommandItem
                                                                key={user._id}
                                                                value={`${user.fullName} ${user.email}`}
                                                                onSelect={() => {
                                                                    setSelectedUserId(user._id);
                                                                    setRecipientWalletId(null);
                                                                    setComboboxOpen(false);
                                                                }}>
                                                                <Check
                                                                    className={cn('mr-2 h-4 w-4', selectedUserId === user._id ? 'opacity-100' : 'opacity-0')}
                                                                />
                                                                <div className='flex flex-col'>
                                                                    <span className='font-medium'>{user.fullName}</span>
                                                                    <span className='text-muted-foreground text-xs'>{user.email}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                )}

                                                {/* All Users */}
                                                <CommandGroup heading={searchText ? 'Search Results' : 'All Users'}>
                                                    {filteredAllUsers.map((user) => (
                                                        <CommandItem
                                                            key={user._id}
                                                            value={`${user.fullName} ${user.email}`}
                                                            onSelect={() => {
                                                                setSelectedUserId(user._id);
                                                                setRecipientWalletId(null);
                                                                setComboboxOpen(false);
                                                            }}>
                                                            <Check className={cn('mr-2 h-4 w-4', selectedUserId === user._id ? 'opacity-100' : 'opacity-0')} />
                                                            <div className='flex flex-col'>
                                                                <span className='font-medium'>{user.fullName}</span>
                                                                <span className='text-muted-foreground text-xs'>{user.email}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Recipient Wallet Selection */}
                        {selectedRecipient && (
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
                        <Button type='submit' disabled={isPending || !selectedRecipient || !recipientWalletId || !amount || numAmount <= 0 || isOverBalance}>
                            {isPending && <Loader2 className='size-4 animate-spin' />}
                            Send E-Transfer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
