import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { convexQuery, useConvexAuth } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { Wallet, CreditCard, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { getConvexErrorMessage } from '@/lib/convex-errors';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateWalletDialog } from './components/create-wallet-dialog';
import { WalletCard } from './components/wallet-card';

export function Dashboard() {
    const { isAuthenticated } = useConvexAuth();
    const {
        data: wallets,
        isPending,
        error,
    } = useQuery({
        ...convexQuery(api.wallets.getMyWallets),
        enabled: isAuthenticated,
    });

    const totalBalance = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0) ?? 0;
    const activeWallets = wallets?.filter((w) => w.balance > 0).length ?? 0;

    useEffect(() => {
        if (error) {
            toast.error(getConvexErrorMessage(error));
        }
    }, [error]);

    return (
        <div className='container mx-auto max-w-7xl p-8'>
            {/* Stats Overview Cards */}
            <div className='mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {/* Total Balance Card */}
                <Card className='hover:border-primary/50 group relative overflow-hidden transition-all duration-300 hover:shadow-lg'>
                    <div className='from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                    <CardHeader className='relative pb-2'>
                        <div className='bg-primary/10 ring-primary/20 mb-2 inline-flex size-10 items-center justify-center rounded-xl ring-2 transition-transform duration-300 group-hover:scale-110'>
                            <Wallet className='text-primary size-5' />
                        </div>
                        <CardDescription className='font-medium'>Total Balance</CardDescription>
                    </CardHeader>
                    <CardContent className='relative'>
                        {isPending ? (
                            <Skeleton className='h-8 w-28' />
                        ) : (
                            <>
                                <p className='text-3xl font-bold tracking-tight'>{formatCurrency(totalBalance)}</p>
                                <p className='text-muted-foreground mt-1 text-xs font-medium'>Total Balance Spent</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Total Wallets Card */}
                <Card className='hover:border-primary/50 group relative overflow-hidden transition-all duration-300 hover:shadow-lg'>
                    <div className='from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                    <CardHeader className='relative pb-2'>
                        <div className='bg-primary/10 ring-primary/20 mb-2 inline-flex size-10 items-center justify-center rounded-xl ring-2 transition-transform duration-300 group-hover:scale-110'>
                            <CreditCard className='text-primary size-5' />
                        </div>
                        <CardDescription className='font-medium'>Active Wallets</CardDescription>
                    </CardHeader>
                    <CardContent className='relative'>
                        {isPending ? (
                            <Skeleton className='h-8 w-16' />
                        ) : (
                            <>
                                <p className='text-3xl font-bold tracking-tight'>{activeWallets}</p>
                                <p className='text-muted-foreground mt-1 text-xs font-medium'>Total Wallets: {wallets?.length ?? 0}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Settings Card */}
                <Card className='hover:border-primary/50 group relative overflow-hidden transition-all duration-300 hover:shadow-lg'>
                    <div className='from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                    <CardHeader className='relative pb-2'>
                        <div className='bg-primary/10 ring-primary/20 mb-2 inline-flex size-10 items-center justify-center rounded-xl ring-2 transition-transform duration-300 group-hover:scale-110'>
                            <Tags className='text-primary size-5' />
                        </div>
                        <CardDescription className='font-medium'>Categories</CardDescription>
                    </CardHeader>
                    <CardContent className='relative'>
                        <Button asChild variant='outline' className='w-full'>
                            <Link to='/categories'>Categories →</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Create Wallet Quick Action */}
                <Card className='hover:border-primary/50 group relative overflow-hidden border-dashed transition-all duration-300 hover:shadow-lg'>
                    <div className='from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
                    <CardHeader className='relative pb-2'>
                        <div className='bg-muted ring-muted-foreground/20 mb-2 inline-flex size-10 items-center justify-center rounded-xl ring-2 transition-transform duration-300 group-hover:scale-110'>
                            <Wallet className='text-muted-foreground size-5' />
                        </div>
                        <CardDescription className='font-medium'>Quick Action</CardDescription>
                    </CardHeader>
                    <CardContent className='relative'>
                        <CreateWalletDialog />
                    </CardContent>
                </Card>
            </div>

            {/* Your Wallets Section */}
            <div className='mb-4 flex items-center justify-between'>
                <div>
                    <h2 className='text-xl font-semibold'>Your Wallets</h2>
                    <p className='text-muted-foreground text-sm'>Manage your wallets with just a click of a button</p>
                </div>
            </div>

            {/* Wallets Grid */}
            {isPending ? (
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className='h-5 w-24' />
                                <Skeleton className='h-4 w-32' />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className='mb-4 h-8 w-20' />
                                <div className='flex gap-2'>
                                    <Skeleton className='h-9 w-full' />
                                    <Skeleton className='h-9 w-full' />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : wallets?.length === 0 ? (
                <Card className='py-16 text-center'>
                    <CardContent>
                        <div className='bg-muted mx-auto mb-4 flex size-16 items-center justify-center rounded-full'>
                            <Wallet className='text-muted-foreground size-8' />
                        </div>
                        <h3 className='mb-2 text-lg font-semibold'>You don't have any wallets currently</h3>
                        <p className='text-muted-foreground mb-6 text-sm'>No wallets at the moment. Create your first wallet to get started!</p>
                        <CreateWalletDialog />
                    </CardContent>
                </Card>
            ) : (
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {wallets?.map((wallet) => (
                        <WalletCard key={wallet._id} wallet={wallet} />
                    ))}
                </div>
            )}
        </div>
    );
}
