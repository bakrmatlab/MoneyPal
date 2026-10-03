import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { convexQuery, useConvexAuth } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { Wallet, LogOut, Menu } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreateWalletDialog } from '@/features/dashboard/components/create-wallet-dialog';
import { SignOutDialog } from '../sign-out-dialog';
import { ThemeSwitch } from '../theme-switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Header } from './header';

interface AppHeaderProps {
    fixed?: boolean;
    onMenuClick?: () => void;
}

export function AppHeader({ fixed, onMenuClick }: AppHeaderProps) {
    const { isAuthenticated } = useConvexAuth();
    const { user: clerkUser } = useClerkUser();
    const [signOutOpen, setSignOutOpen] = useState(false);
    const isMobile = useIsMobile();
    const { data: wallets, isPending } = useQuery({
        ...convexQuery(api.wallets.getMyWallets),
        enabled: isAuthenticated,
    });

    const totalBalance = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0) ?? 0;

    return (
        <Header fixed={fixed} className='bg-background h-20 shrink-0 border-b'>
            {isMobile && isAuthenticated && (
                <Button variant='ghost' size='icon' onClick={onMenuClick} aria-label='Open navigation' className='-ml-2 shrink-0'>
                    <Menu className='size-5' />
                </Button>
            )}
            <div className='flex items-center gap-2 sm:gap-3'>
                {isAuthenticated && clerkUser && (
                    <>
                        <Avatar className='size-9 sm:size-10'>
                            <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.firstName || ''} />
                            <AvatarFallback>
                                {clerkUser?.firstName?.charAt(0)}
                                {clerkUser?.lastName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        {!isMobile && (
                            <div className='min-w-0'>
                                <p className='truncate text-sm font-semibold'>{clerkUser?.fullName || 'User'}</p>
                                <p className='text-muted-foreground truncate text-xs'>Your money, in focus.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className='ms-auto flex items-center gap-2 sm:gap-3 md:gap-4'>
                {isAuthenticated && (
                    <>
                        <div className={`flex items-center gap-2 sm:gap-3 ${!isMobile ? 'border-l pl-4' : ''}`}>
                            <div className='text-right'>
                                {!isMobile && <div className='text-muted-foreground font-mono text-[10px] tracking-wider uppercase'>Total balance</div>}
                                {isPending ? (
                                    <Skeleton className='h-5 w-20' />
                                ) : (
                                    <div className='text-sm font-semibold tabular-nums'>{formatCurrency(totalBalance)}</div>
                                )}
                            </div>
                        </div>
                        <CreateWalletDialog
                            trigger={
                                <Button
                                    size={isMobile ? 'icon' : 'sm'}
                                    aria-label='Create new wallet'
                                    className='bg-brand text-brand-foreground hover:bg-brand/85 shrink-0 rounded-sm'>
                                    <Wallet className='size-4' />
                                    {!isMobile && <span className='ml-2'>New Wallet</span>}
                                </Button>
                            }
                        />
                    </>
                )}
                <ThemeSwitch />
                {!isMobile && (
                    <Button variant='outline' size='icon' onClick={() => setSignOutOpen(true)} aria-label='Sign out' className='shrink-0 rounded-sm'>
                        <LogOut className='size-4' />
                    </Button>
                )}
                <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
            </div>
        </Header>
    );
}
