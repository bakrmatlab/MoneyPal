import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { Send, ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendETransferDialog } from './components/send-e-transfer-dialog';

export const ETransfersPage = () => {
    const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

    const { data: wallets } = useQuery(convexQuery(api.wallets.getMyWallets, {}));
    const defaultWallet = wallets?.[0];

    const { data: eTransfers, isLoading, isError } = useQuery(convexQuery(api.transactions.getETransfers, { type: activeTab }));

    return (
        <div className='container mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                    <h1 className='text-3xl font-semibold tracking-tight'>E-Transfers</h1>
                    <p className='text-muted-foreground mt-2 text-sm sm:text-base'>Send money to other MoneyPal users</p>
                </div>
                {defaultWallet && (
                    <SendETransferDialog
                        walletId={defaultWallet._id}
                        walletName={defaultWallet.name}
                        balance={defaultWallet.balance}
                        triggerButton={
                            <Button size='lg' className='bg-brand text-brand-foreground hover:bg-brand/90 h-11 gap-2 rounded-sm'>
                                <Send className='size-4' />
                                Send E-Transfer
                            </Button>
                        }
                    />
                )}
            </div>

            <Card className='gap-0 rounded-sm shadow-none'>
                <CardHeader className='border-b p-5 sm:p-6'>
                    <CardTitle className='font-mono text-xs font-medium tracking-widest uppercase'>01 / Transfer history</CardTitle>
                    <CardDescription>View sent and received e-transfers</CardDescription>
                </CardHeader>
                <CardContent className='p-5 sm:p-6'>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sent' | 'received')}>
                        <TabsList className='bg-muted grid h-auto w-full grid-cols-2 rounded-sm p-1 sm:max-w-sm'>
                            <TabsTrigger value='sent' className='h-11 gap-2 rounded-sm'>
                                <ArrowUpFromLine className='size-4' />
                                Sent
                            </TabsTrigger>
                            <TabsTrigger value='received' className='h-11 gap-2 rounded-sm'>
                                <ArrowDownToLine className='size-4' />
                                Received
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value='sent' className='mt-6'>
                            {isError ? (
                                <p role='alert' className='text-destructive py-8'>
                                    Unable to load e-transfers. Please try again later.
                                </p>
                            ) : isLoading ? (
                                <div className='flex items-center justify-center py-12'>
                                    <Loader2 className='text-muted-foreground size-8 animate-spin' />
                                </div>
                            ) : eTransfers && eTransfers.length > 0 ? (
                                <div className='divide-border divide-y'>
                                    {eTransfers.map((transfer) => (
                                        <ETransferCard key={transfer._id} transfer={transfer} type='sent' />
                                    ))}
                                </div>
                            ) : (
                                <div className='text-muted-foreground py-12 text-center'>
                                    <Send className='mx-auto size-12 opacity-50' />
                                    <p className='mt-4 text-sm'>No sent e-transfers yet</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value='received' className='mt-6'>
                            {isError ? (
                                <p role='alert' className='text-destructive py-8'>
                                    Unable to load e-transfers. Please try again later.
                                </p>
                            ) : isLoading ? (
                                <div className='flex items-center justify-center py-12'>
                                    <Loader2 className='text-muted-foreground size-8 animate-spin' />
                                </div>
                            ) : eTransfers && eTransfers.length > 0 ? (
                                <div className='divide-border divide-y'>
                                    {eTransfers.map((transfer) => (
                                        <ETransferCard key={transfer._id} transfer={transfer} type='received' />
                                    ))}
                                </div>
                            ) : (
                                <div className='text-muted-foreground py-12 text-center'>
                                    <ArrowDownToLine className='mx-auto size-12 opacity-50' />
                                    <p className='mt-4 text-sm'>No received e-transfers yet</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

interface ETransferCardProps {
    transfer: {
        _id: string;
        type: string;
        amount: number;
        description?: string;
        _creationTime: number;
        wallet: { name?: string | null; currency?: string | null } | null;
        recipientEmail?: string;
        recipientUser?: { _id?: string; fullName: string; email: string } | null;
        recipientWallet?: { name?: string | null } | null;
        senderUser?: { _id?: string; fullName: string; email: string } | null;
    };
    type: 'sent' | 'received';
}

const ETransferCard = ({ transfer, type }: ETransferCardProps) => {
    const isSent = type === 'sent';
    const date = new Date(transfer._creationTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

    // With isOutgoing-based queries, we now query the user's own transaction records
    // For sent: recipientUser is the person who received the money
    // For received: recipientUser is the person who sent the money (stored as recipientUserId in the receive record)
    const otherPartyName = transfer.recipientUser?.fullName ?? transfer.recipientEmail ?? 'Unknown';

    // wallet is always the user's wallet in the transaction
    // recipientWallet is always the other party's wallet
    const fromWallet = isSent ? transfer.wallet?.name : transfer.recipientWallet?.name;
    const toWallet = isSent ? transfer.recipientWallet?.name : transfer.wallet?.name;

    return (
        <div className='flex min-w-0 flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex min-w-0 flex-1 items-start gap-3'>
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-sm ${isSent ? 'bg-warning/10' : 'bg-success/10'}`}>
                    {isSent ? <ArrowUpFromLine className='text-warning size-5' /> : <ArrowDownToLine className='text-success size-5' />}
                </div>
                <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-medium break-words'>
                            {isSent ? 'To: ' : 'From: '}
                            {otherPartyName}
                        </p>
                        <Badge variant='outline' className='rounded-sm text-xs'>
                            E-Transfer
                        </Badge>
                    </div>
                    <div className='text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm break-words'>
                        <span>{fromWallet ?? 'Wallet'}</span>
                        {toWallet && (
                            <>
                                <span>→</span>
                                <span>{toWallet}</span>
                            </>
                        )}
                    </div>
                    {transfer.description && <p className='text-muted-foreground mt-1 text-xs break-words'>{transfer.description}</p>}
                    <p className='text-muted-foreground mt-1 text-xs break-words'>{date}</p>
                </div>
            </div>
            <div className='min-w-0 pl-13 sm:max-w-[40%] sm:pl-0 sm:text-right'>
                <p className={`text-2xl font-medium break-all tabular-nums ${isSent ? 'text-warning' : 'text-success'}`}>
                    {isSent ? '-' : '+'}
                    {formatCurrency(transfer.amount)}
                </p>
            </div>
        </div>
    );
};
