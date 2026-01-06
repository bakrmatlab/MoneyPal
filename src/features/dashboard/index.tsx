import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { getConvexErrorMessage } from '@/lib/convex-errors';
import { formatCurrency } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTemplate } from '@/components/layout/page-template';
import { CreateWalletDialog } from './components/create-wallet-dialog';
import { WalletCard } from './components/wallet-card';

export function Dashboard() {
    const { data: wallets, isPending, error } = useQuery(convexQuery(api.wallets.getMyWallets));

    const totalBalance = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0) ?? 0;

    useEffect(() => {
        if (error) {
            toast.error(getConvexErrorMessage(error));
        }
    }, [error]);

    return (
        <PageTemplate>
            <div className='container mx-auto max-w-5xl py-8'>
                {/* Header Section */}
                <div className='mb-8'>
                    <div className='mb-2 flex items-center gap-3'>
                        <div className='bg-primary/10 flex size-10 items-center justify-center rounded-lg'>
                            <Wallet className='text-primary size-5' />
                        </div>
                        <div>
                            <h1 className='text-2xl font-bold tracking-tight'>My Wallets</h1>
                            <p className='text-muted-foreground text-sm'>Manage your wallets and transactions</p>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className='mb-8 grid gap-4 sm:grid-cols-2'>
                    <Card className='from-primary/5 bg-linear-to-br to-transparent'>
                        <CardHeader className='pb-2'>
                            <CardDescription>Total Balance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {wallets === undefined ? (
                                <Skeleton className='h-9 w-32' />
                            ) : (
                                <p className='text-3xl font-bold tracking-tight'>{formatCurrency(totalBalance)}</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='pb-2'>
                            <CardDescription>Total Wallets</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {wallets === undefined ? <Skeleton className='h-9 w-16' /> : <p className='text-3xl font-bold tracking-tight'>{wallets.length}</p>}
                        </CardContent>
                    </Card>
                </div>

                {/* Wallets List Header */}
                <div className='mb-4 flex items-center justify-between'>
                    <h2 className='text-lg font-semibold'>Wallets</h2>
                    <CreateWalletDialog />
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
                    <Card className='py-12 text-center'>
                        <CardContent>
                            <div className='bg-muted mx-auto mb-4 flex size-12 items-center justify-center rounded-full'>
                                <Wallet className='text-muted-foreground size-6' />
                            </div>
                            <h3 className='mb-1 font-semibold'>No wallets yet</h3>
                            <p className='text-muted-foreground mb-4 text-sm'>Create your first wallet to get started</p>
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
        </PageTemplate>
    );
}
