import { useState } from 'react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { Archive, ArchiveRestore, Loader2, Settings, Trash2, Wallet, CreditCard, Banknote, PiggyBank, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/confirm-dialog';

type WalletSettingsDialogProps = {
    walletId: Id<'wallets'>;
    trigger?: React.ReactNode;
};

const WALLET_COLORS = [
    { value: 'slate', label: 'Slate', class: 'bg-slate-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
];

const WALLET_ICONS = [
    { value: 'wallet', label: 'Wallet', icon: Wallet },
    { value: 'credit-card', label: 'Credit Card', icon: CreditCard },
    { value: 'banknote', label: 'Banknote', icon: Banknote },
    { value: 'piggy-bank', label: 'Piggy Bank', icon: PiggyBank },
    { value: 'coins', label: 'Coins', icon: Coins },
];

const CURRENCIES = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
    { value: 'CAD', label: 'CAD ($)', symbol: 'CA$' },
    { value: 'AUD', label: 'AUD ($)', symbol: 'A$' },
];

export const WalletSettingsDialog = ({ walletId, trigger }: WalletSettingsDialogProps) => {
    const [open, setOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

    const wallet = useQuery(api.wallets.getMyWallet, open ? { walletId } : 'skip');
    const hasTransactions = useQuery(api.wallets.hasWalletTransactions, open ? { walletId } : 'skip');

    const [name, setName] = useState('');
    const [color, setColor] = useState('');
    const [icon, setIcon] = useState('');
    const [currency, setCurrency] = useState('');

    const [isPending, setIsPending] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    const updateWallet = useMutation(api.wallets.updateWallet);
    const deleteWallet = useMutation(api.wallets.deleteWallet);
    const archiveWallet = useMutation(api.wallets.archiveWallet);
    const unarchiveWallet = useMutation(api.wallets.unarchiveWallet);

    // Initialize form when wallet loads
    if (wallet && open && !name && !color && !icon && !currency) {
        setName(wallet.name ?? '');
        setColor(wallet.color ?? WALLET_COLORS[0].value);
        setIcon(wallet.icon ?? WALLET_ICONS[0].value);
        setCurrency(wallet.currency ?? 'USD');
    }

    // Check if wallet can be deleted (zero balance + no transactions)
    const canDelete = wallet?.balance === 0 && !hasTransactions;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        try {
            await updateWallet({
                walletId,
                name: name.trim() || undefined,
                color: color || undefined,
                icon: icon || undefined,
                currency: currency || undefined,
            });
            toast.success('Wallet updated successfully');
            setOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update wallet');
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Close dialogs first to stop queries
            setDeleteConfirmOpen(false);
            setOpen(false);

            await deleteWallet({ walletId });
            toast.success('Wallet deleted successfully');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete wallet');
            // Reopen dialog on error
            setOpen(true);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleArchiveToggle = async () => {
        setIsArchiving(true);
        try {
            if (wallet?.isArchived) {
                await unarchiveWallet({ walletId });
                toast.success('Wallet unarchived successfully');
            } else {
                await archiveWallet({ walletId });
                toast.success('Wallet archived successfully');
            }
            setArchiveConfirmOpen(false);
            setOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to archive wallet');
        } finally {
            setIsArchiving(false);
        }
    };

    const deleteDisabledReason =
        wallet?.balance !== 0 ? 'Cannot delete wallet with non-zero balance' : hasTransactions ? 'Cannot delete wallet with transaction history' : null;

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button size='sm' variant='outline' className='gap-2'>
                            <Settings className='size-4' />
                            Settings
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className='max-w-md'>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Wallet Settings</DialogTitle>
                            <DialogDescription>Customize your wallet appearance and settings.</DialogDescription>
                        </DialogHeader>
                        <div className='space-y-4 py-4'>
                            {/* Wallet Name */}
                            <div>
                                <Label htmlFor='wallet-name'>Wallet Name</Label>
                                <Input
                                    id='wallet-name'
                                    placeholder='e.g., Savings, Travel Fund'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className='mt-2'
                                />
                            </div>

                            {/* Currency */}
                            <div>
                                <Label htmlFor='currency'>Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger id='currency' className='mt-2'>
                                        <SelectValue placeholder='Select currency' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map((curr) => (
                                            <SelectItem key={curr.value} value={curr.value}>
                                                {curr.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Color */}
                            <div>
                                <Label>Color</Label>
                                <RadioGroup value={color} onValueChange={setColor} className='mt-2 grid grid-cols-5 gap-2'>
                                    {WALLET_COLORS.map((colorOption) => (
                                        <div key={colorOption.value} className='flex items-center justify-center'>
                                            <RadioGroupItem value={colorOption.value} id={`color-${colorOption.value}`} className='peer sr-only' />
                                            <Label
                                                htmlFor={`color-${colorOption.value}`}
                                                className={`peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-ring flex size-10 cursor-pointer items-center justify-center rounded-md border-2 border-transparent transition-all peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-offset-2 ${colorOption.class}`}
                                                title={colorOption.label}
                                            />
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Icon */}
                            <div>
                                <Label>Icon</Label>
                                <RadioGroup value={icon} onValueChange={setIcon} className='mt-2 grid grid-cols-5 gap-2'>
                                    {WALLET_ICONS.map((iconOption) => {
                                        const IconComponent = iconOption.icon;
                                        return (
                                            <div key={iconOption.value} className='flex items-center justify-center'>
                                                <RadioGroupItem value={iconOption.value} id={`icon-${iconOption.value}`} className='peer sr-only' />
                                                <Label
                                                    htmlFor={`icon-${iconOption.value}`}
                                                    className='border-muted bg-background hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-muted flex size-10 cursor-pointer items-center justify-center rounded-md border-2 transition-all'
                                                    title={iconOption.label}>
                                                    <IconComponent className='size-5' />
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </RadioGroup>
                            </div>
                        </div>
                        <DialogFooter className='flex-col gap-2 sm:flex-col'>
                            <div className='flex gap-2'>
                                <DialogClose asChild>
                                    <Button type='button' variant='outline' disabled={isPending} className='flex-1'>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type='submit' disabled={isPending} className='flex-1'>
                                    {isPending && <Loader2 className='size-4 animate-spin' />}
                                    Save Changes
                                </Button>
                            </div>
                            <div className='flex w-full gap-2 border-t pt-2'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    className='flex-1 gap-2'
                                    onClick={() => setArchiveConfirmOpen(true)}
                                    disabled={isPending}>
                                    {wallet?.isArchived ? (
                                        <>
                                            <ArchiveRestore className='size-4' />
                                            Unarchive
                                        </>
                                    ) : (
                                        <>
                                            <Archive className='size-4' />
                                            Archive
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type='button'
                                    variant='destructive'
                                    className='flex-1 gap-2'
                                    onClick={() => setDeleteConfirmOpen(true)}
                                    disabled={!canDelete || isPending}
                                    title={deleteDisabledReason ?? 'Permanently delete this wallet'}>
                                    <Trash2 className='size-4' />
                                    Delete
                                </Button>
                            </div>
                            {!canDelete && (
                                <p className='text-muted-foreground text-center text-xs'>
                                    {deleteDisabledReason}. {hasTransactions ? 'Use Archive instead.' : 'Withdraw funds first.'}
                                </p>
                            )}
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title='Delete Wallet'
                desc={`Are you sure you want to permanently delete "${wallet?.name || 'this wallet'}"? This action cannot be undone.`}
                confirmText='Delete Wallet'
                handleConfirm={handleDelete}
                isLoading={isDeleting}
                destructive
                className='sm:max-w-sm'
            />

            {/* Archive Confirmation Dialog */}
            <ConfirmDialog
                open={archiveConfirmOpen}
                onOpenChange={setArchiveConfirmOpen}
                title={wallet?.isArchived ? 'Unarchive Wallet' : 'Archive Wallet'}
                desc={
                    wallet?.isArchived
                        ? `Restore "${wallet?.name || 'this wallet'}" to your active wallets? It will be available for transactions again.`
                        : `Archive "${wallet?.name || 'this wallet'}"? It will be hidden from active operations but transaction history will be preserved.`
                }
                confirmText={wallet?.isArchived ? 'Unarchive' : 'Archive'}
                handleConfirm={handleArchiveToggle}
                isLoading={isArchiving}
                destructive={!wallet?.isArchived}
                className='sm:max-w-sm'
            />
        </>
    );
};
