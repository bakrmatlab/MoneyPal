import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { convexQuery, useConvexAuth } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { Wallet, Tags, ChevronDown, ChevronUp, Archive, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getConvexErrorMessage } from '@/lib/convex-errors';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
            <div className='mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                    <h1 className='text-3xl font-semibold tracking-tight'>Your overview</h1>
                    <p className='text-muted-foreground mt-2 text-sm'>Your wallets and monthly budget, at a glance.</p>
                </div>
                <CreateWalletDialog
                    trigger={
                        <Button className='bg-brand text-brand-foreground hover:bg-brand/85 self-start rounded-sm'>
                            <Plus className='size-4' />
                            New wallet
                        </Button>
                    }
                />
            </div>

            <div className='mb-10 grid overflow-hidden rounded-md border lg:grid-cols-[1.5fr_1fr]'>
                <section
                    aria-labelledby='balance-heading'
                    className='bg-primary/5 dark:bg-primary/5 relative flex min-w-0 flex-col justify-between p-6 sm:p-8 lg:p-10'>
                    <h2 id='balance-heading' className='text-primary font-mono text-[11px] tracking-[0.14em] uppercase'>
                        01 / Total balance
                    </h2>
                    {isPending ? (
                        <Skeleton className='my-7 h-16 w-3/4' />
                    ) : error ? (
                        <p className='text-muted-foreground my-7 text-sm'>Balance unavailable</p>
                    ) : (
                        <p className='my-7 text-4xl leading-tight font-medium tracking-tight break-all tabular-nums sm:text-5xl xl:text-6xl'>
                            {formatCurrency(totalBalance)}
                        </p>
                    )}
                    <div className='text-muted-foreground flex flex-wrap justify-between gap-3 border-t pt-4 text-xs'>
                        {isPending ? (
                            <Skeleton className='h-4 w-36' />
                        ) : error ? (
                            <span>Wallet information unavailable</span>
                        ) : (
                            <>
                                <span>{wallets?.length ?? 0} wallets in total</span>
                                <span>{activeWallets} with a balance</span>
                            </>
                        )}
                    </div>
                </section>
                <BudgetCard />
            </div>

            <div className='mb-5 flex flex-wrap items-end justify-between gap-4'>
                <div>
                    <p className='text-primary mb-2 font-mono text-[11px] tracking-[0.14em] uppercase'>02 / Wallets</p>
                    <h2 className='text-2xl font-semibold tracking-tight'>Your money, organized.</h2>
                </div>
                <Button asChild variant='ghost' size='sm' className='text-muted-foreground rounded-sm'>
                    <Link to='/categories'>
                        <Tags className='size-4' />
                        Categories
                    </Link>
                </Button>
            </div>

            {/* Wallets Grid */}
            {isPending ? (
                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className='rounded-md shadow-none'>
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
            ) : error ? (
                <div role='alert' className='text-muted-foreground rounded-md border p-6 text-sm'>
                    Unable to load your wallets. {getConvexErrorMessage(error)}
                </div>
            ) : wallets?.length === 0 ? (
                <Card className='rounded-md border-dashed py-12 text-center shadow-none'>
                    <CardContent>
                        <div className='bg-muted mx-auto mb-6 flex size-16 items-center justify-center rounded-full'>
                            <Wallet className='text-muted-foreground size-8' />
                        </div>
                        <h3 className='mb-2 text-lg font-semibold'>A place for your money</h3>
                        <p className='text-muted-foreground mx-auto mb-6 max-w-md text-sm'>Create your first wallet to start organizing your money.</p>
                        <CreateWalletDialog />
                    </CardContent>
                </Card>
            ) : (
                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                    {wallets?.map((wallet) => (
                        <WalletCard key={wallet._id} wallet={wallet} />
                    ))}
                </div>
            )}

            {/* Archived Wallets Section */}
            {hasAnyWallet && (
                <div className='mt-10 border-t pt-6'>
                    <Collapsible open={showArchivedWallets} onOpenChange={setShowArchivedWallets}>
                        <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <div>
                                <h2 className='text-lg font-semibold tracking-tight'>Archived wallets</h2>
                                <p className='text-muted-foreground mt-1 text-sm'>View and restore your archived wallets</p>
                            </div>
                            <CollapsibleTrigger asChild>
                                <Button variant='ghost' size='sm' className='min-h-11 gap-2 self-start rounded-sm sm:self-auto'>
                                    <Archive className='size-4' />
                                    {showArchivedWallets ? 'Hide' : 'Show'} Archived
                                    {showArchivedWallets ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                            {isAllPending ? (
                                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                                    {[...Array(2)].map((_, i) => (
                                        <Card key={i} className='rounded-md shadow-none'>
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
                                <Card className='rounded-md border-dashed py-10 text-center shadow-none'>
                                    <CardContent>
                                        <div className='bg-muted mx-auto mb-4 flex size-12 items-center justify-center rounded-full'>
                                            <Archive className='text-muted-foreground size-6' />
                                        </div>
                                        <h3 className='mb-2 text-base font-semibold'>No Archived Wallets</h3>
                                        <p className='text-muted-foreground text-sm'>You haven't archived any wallets yet.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                                    {archivedWallets.map((wallet) => (
                                        <div key={wallet._id} className='relative'>
                                            <div className='absolute -top-2 -right-2 z-10'>
                                                <div className='bg-muted text-muted-foreground flex items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[10px]'>
                                                    <Archive className='size-3' />
                                                    Archived
                                                </div>
                                            </div>
                                            <div className='pt-1'>
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
