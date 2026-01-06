import { useState } from 'react';
import { api } from '@convex/_generated/api';
import { useMutation } from 'convex/react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const CreateWalletDialog = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [isPending, setIsPending] = useState(false);
    const createWallet = useMutation(api.wallets.createWallet);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        try {
            await createWallet({ name: name.trim() || undefined });
            setName('');
            setOpen(false);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size='sm' className='gap-2'>
                    <Plus className='size-4' />
                    New Wallet
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Wallet</DialogTitle>
                        <DialogDescription>Add a new wallet to manage your funds.</DialogDescription>
                    </DialogHeader>
                    <div className='py-4'>
                        <Label htmlFor='wallet-name'>Wallet Name (optional)</Label>
                        <Input
                            id='wallet-name'
                            placeholder='e.g., Savings, Travel Fund'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className='mt-2'
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type='button' variant='outline' disabled={isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type='submit' disabled={isPending}>
                            {isPending && <Loader2 className='size-4 animate-spin' />}
                            Create Wallet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
