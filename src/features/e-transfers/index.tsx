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

    const { data: eTransfers, isLoading } = useQuery(convexQuery(api.transactions.getETransfers, { type: activeTab }));

    return (
        <div className='container mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>E-Transfers</h1>
                    <p className='text-muted-foreground mt-2 text-sm sm:text-base'>Send money to other MoneyPal users</p>
                </div>
                {defaultWallet && (
                    <SendETransferDialog
                        walletId={defaultWallet._id}
                        walletName={defaultWallet.name}
                        balance={defaultWallet.balance}
                        triggerButton={
                            <Button size='lg' className='gap-2'>
                                <Send className='size-4' />
                                Send E-Transfer
                            </Button>
                        }
                    />
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transfer History</CardTitle>
                    <CardDescription>View sent and received e-transfers</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sent' | 'received')}>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='sent' className='gap-2'>
                                <ArrowUpFromLine className='size-4' />
                                Sent
                            </TabsTrigger>
                            <TabsTrigger value='received' className='gap-2'>
                                <ArrowDownToLine className='size-4' />
                                Received
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value='sent' className='mt-6'>
                            {isLoading ? (
                                <div className='flex items-center justify-center py-12'>
                                    <Loader2 className='text-muted-foreground size-8 animate-spin' />
                                </div>
                            ) : eTransfers && eTransfers.length > 0 ? (
                                <div className='space-y-3'>
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
                            {isLoading ? (
                                <div className='flex items-center justify-center py-12'>
                                    <Loader2 className='text-muted-foreground size-8 animate-spin' />
                                </div>
                            ) : eTransfers && eTransfers.length > 0 ? (
                                <div className='space-y-3'>
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
        <div className='border-border hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors'>
            <div className='flex items-center gap-4'>
                <div className={`flex size-10 items-center justify-center rounded-full ${isSent ? 'bg-orange-500/10' : 'bg-green-500/10'}`}>
                    {isSent ? <ArrowUpFromLine className='size-5 text-orange-500' /> : <ArrowDownToLine className='size-5 text-green-500' />}
                </div>
                <div>
                    <div className='flex items-center gap-2'>
                        <p className='font-medium'>
                            {isSent ? 'To: ' : 'From: '}
                            {otherPartyName}
                        </p>
                        <Badge variant='outline' className='text-xs'>
                            E-Transfer
                        </Badge>
                    </div>
                    <div className='text-muted-foreground mt-1 flex items-center gap-2 text-sm'>
                        <span>{fromWallet ?? 'Wallet'}</span>
                        {toWallet && (
                            <>
                                <span>→</span>
                                <span>{toWallet}</span>
                            </>
                        )}
                    </div>
                    {transfer.description && <p className='text-muted-foreground mt-1 text-xs'>{transfer.description}</p>}
                    <p className='text-muted-foreground mt-1 text-xs'>{date}</p>
                </div>
            </div>
            <div className='text-right'>
                <p className={`text-lg font-semibold ${isSent ? 'text-orange-500' : 'text-green-500'}`}>
                    {isSent ? '-' : '+'}
                    {formatCurrency(transfer.amount)}
                </p>
            </div>
        </div>
    );
};
