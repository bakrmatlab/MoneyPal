import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { convexQuery, useConvexAuth } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { Wallet, CreditCard, Tags, ChevronDown, ChevronUp, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { getConvexErrorMessage } from '@/lib/convex-errors';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { BudgetCard } from './components/budget-card';
import { CreateWalletDialog } from './components/create-wallet-dialog';
import { WalletCard } from './components/wallet-card';

export function Dashboard() {
    const { isAuthenticated } = useConvexAuth();
    const [showArchivedWallets, setShowArchivedWallets] = useState(false);

    const {
        data: wallets,
        isPending,
        error,
    } = useQuery({
        ...convexQuery(api.wallets.getMyWallets, {}),
        enabled: isAuthenticated,
    });

    const { data: allWallets, isPending: isAllPending } = useQuery({
        ...convexQuery(api.wallets.getMyWallets, { includeArchived: true }),
        enabled: isAuthenticated && showArchivedWallets,
    });

    // Always check if there are any wallets at all (including archived) to show the archived section
    const { data: allWalletsCheck } = useQuery({
        ...convexQuery(api.wallets.getMyWallets, { includeArchived: true }),
        enabled: isAuthenticated,
    });

    const archivedWallets = allWallets?.filter((w) => w.isArchived) ?? [];
    const hasAnyWallet = (allWalletsCheck?.length ?? 0) > 0;

    const totalBalance = wallets?.reduce((sum, wallet) => sum + wallet.balance, 0) ?? 0;
    const activeWallets = wallets?.filter((w) => w.balance > 0).length ?? 0;

    useEffect(() => {
        if (error) {
            toast.error(getConvexErrorMessage(error));
        }
    }, [error]);

    return (
        <div className='container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
            {/* Stats Overview Cards */}
            <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
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

                <BudgetCard />
            </div>

            {/* Your Wallets Section */}
            <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                    <h2 className='text-xl font-bold tracking-tight sm:text-2xl'>Your Wallets</h2>
                    <p className='text-muted-foreground mt-1 text-sm'>Manage your wallets with just a click of a button</p>
                </div>
            </div>

            {/* Wallets Grid */}
            {isPending ? (
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
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
                <Card className='border-dashed py-16 text-center'>
                    <CardContent>
                        <div className='bg-muted mx-auto mb-6 flex size-16 items-center justify-center rounded-full'>
                            <Wallet className='text-muted-foreground size-8' />
                        </div>
                        <h3 className='mb-2 text-lg font-semibold'>You don't have any wallets currently</h3>
                        <p className='text-muted-foreground mx-auto mb-6 max-w-md text-sm'>
                            No wallets at the moment. Create your first wallet to get started!
                        </p>
                        <CreateWalletDialog />
                    </CardContent>
                </Card>
            ) : (
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {wallets?.map((wallet) => (
                        <WalletCard key={wallet._id} wallet={wallet} />
                    ))}
                </div>
            )}

            {/* Archived Wallets Section */}
            {hasAnyWallet && (
                <div className='mt-12'>
                    <Collapsible open={showArchivedWallets} onOpenChange={setShowArchivedWallets}>
                        <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <div>
                                <h2 className='text-xl font-bold tracking-tight sm:text-2xl'>Archived Wallets</h2>
                                <p className='text-muted-foreground mt-1 text-sm'>View and restore your archived wallets</p>
                            </div>
                            <CollapsibleTrigger asChild>
                                <Button variant='ghost' size='sm' className='gap-2 self-start sm:self-auto'>
                                    <Archive className='size-4' />
                                    {showArchivedWallets ? 'Hide' : 'Show'} Archived
                                    {showArchivedWallets ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                            {isAllPending ? (
                                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                                    {[...Array(2)].map((_, i) => (
                                        <Card key={i}>
                                            <CardHeader>
                                                <Skeleton className='h-5 w-24' />
                                                <Skeleton className='h-4 w-32' />
                                            </CardHeader>
                                            <CardContent>
                                                <Skeleton className='mb-4 h-8 w-20' />
                                                <Skeleton className='h-9 w-full' />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : archivedWallets.length === 0 ? (
                                <Card className='border-dashed py-12 text-center'>
                                    <CardContent>
                                        <div className='bg-muted mx-auto mb-4 flex size-12 items-center justify-center rounded-full'>
                                            <Archive className='text-muted-foreground size-6' />
                                        </div>
                                        <h3 className='mb-2 text-base font-semibold'>No Archived Wallets</h3>
                                        <p className='text-muted-foreground text-sm'>You haven't archived any wallets yet.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                                    {archivedWallets.map((wallet) => (
                                        <div key={wallet._id} className='relative'>
                                            <div className='absolute -top-2 -right-2 z-10'>
                                                <div className='bg-muted text-muted-foreground flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium shadow-sm'>
                                                    <Archive className='size-3' />
                                                    Archived
                                                </div>
                                            </div>
                                            <div className='opacity-75 transition-opacity hover:opacity-100'>
                                                <WalletCard wallet={wallet} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            )}
        </div>
    );
}
