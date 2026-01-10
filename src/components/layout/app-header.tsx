import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { convexQuery } from '@convex-dev/react-query';
import { useConvexAuth } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { Wallet, LogOut } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { CreateWalletDialog } from '@/features/dashboard/components/create-wallet-dialog';
import { SignOutDialog } from '../sign-out-dialog';
import { ThemeSwitch } from '../theme-switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Header } from './header';

interface AppHeaderProps {
    fixed?: boolean;
}

export function AppHeader({ fixed }: AppHeaderProps) {
    const { isAuthenticated } = useConvexAuth();
    const { user: clerkUser } = useClerkUser();
    const [signOutOpen, setSignOutOpen] = useState(false);
    const { data: wallets, isPending } = useQuery({
        ...convexQuery(api.wallets.getMyWallets),
        enabled: isAuthenticated,
    });

    const totalBalance = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0) ?? 0;

    return (
        <Header fixed={fixed} className='bg-background'>
            <div className='flex items-center gap-3'>
                {isAuthenticated && clerkUser && (
                    <>
                        <Avatar className='size-10'>
                            <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.firstName || ''} />
                            <AvatarFallback>
                                {clerkUser?.firstName?.charAt(0)}
                                {clerkUser?.lastName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className='text-sm font-semibold'>{clerkUser?.fullName || 'User'}</p>
                            <p className='text-muted-foreground text-xs'>Welcome back to MoneyPal 👋</p>
                        </div>
                    </>
                )}
            </div>
            <div className='ms-auto flex items-center space-x-4'>
                {isAuthenticated && (
                    <>
                        <div className='flex items-center gap-3 border-l pl-4'>
                            <div className='text-right'>
                                <div className='text-muted-foreground text-xs'>Balance:</div>
                                {isPending ? <Skeleton className='h-5 w-20' /> : <div className='text-sm font-semibold'>{formatCurrency(totalBalance)}</div>}
                            </div>
                        </div>
                        <CreateWalletDialog
                            trigger={
                                <Button size='sm'>
                                    <Wallet className='size-4' />
                                    Deposit
                                </Button>
                            }
                        />
                    </>
                )}
                <ThemeSwitch />
                <Button variant='outline' size='icon' onClick={() => setSignOutOpen(true)}>
                    <LogOut className='size-4' />
                </Button>
                <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
            </div>
        </Header>
    );
}
