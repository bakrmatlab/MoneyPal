import { Wallet, CreditCard, Banknote, PiggyBank, Coins, Settings } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DepositDialog } from './deposit-dialog';
import { TransferDialog } from './transfer-dialog';
import type { Wallet as WalletType } from './types';
import { WalletSettingsDialog } from './wallet-settings-dialog';
import { WithdrawDialog } from './withdraw-dialog';

type WalletCardProps = {
    wallet: WalletType;
};

const WALLET_ICON_MAP = {
    wallet: Wallet,
    'credit-card': CreditCard,
    banknote: Banknote,
    'piggy-bank': PiggyBank,
    coins: Coins,
};

const WALLET_COLOR_MAP = {
    slate: 'border-t-slate-500',
    red: 'border-t-red-500',
    orange: 'border-t-orange-500',
    amber: 'border-t-amber-500',
    green: 'border-t-green-500',
    emerald: 'border-t-emerald-500',
    blue: 'border-t-blue-500',
    indigo: 'border-t-indigo-500',
    purple: 'border-t-purple-500',
    pink: 'border-t-pink-500',
};

const WALLET_ICON_COLOR_MAP = {
    slate: 'text-slate-600 dark:text-slate-400',
    red: 'text-red-600 dark:text-red-400',
    orange: 'text-orange-600 dark:text-orange-400',
    amber: 'text-amber-600 dark:text-amber-400',
    green: 'text-green-600 dark:text-green-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    purple: 'text-purple-600 dark:text-purple-400',
    pink: 'text-pink-600 dark:text-pink-400',
};

export const WalletCard = ({ wallet }: WalletCardProps) => {
    const IconComponent = wallet.icon ? WALLET_ICON_MAP[wallet.icon as keyof typeof WALLET_ICON_MAP] || Wallet : Wallet;
    const colorClass = wallet.color ? WALLET_COLOR_MAP[wallet.color as keyof typeof WALLET_COLOR_MAP] : WALLET_COLOR_MAP.slate;
    const iconColorClass = wallet.color ? WALLET_ICON_COLOR_MAP[wallet.color as keyof typeof WALLET_ICON_COLOR_MAP] : WALLET_ICON_COLOR_MAP.slate;

    return (
        <Card className={`relative min-w-0 gap-5 overflow-hidden rounded-md border-t-2 py-6 shadow-none ${colorClass}`}>
            <CardHeader className='space-y-2 px-5 sm:px-6'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 flex-1 items-start gap-3'>
                        <div className={`shrink-0 rounded-sm p-1 ${iconColorClass}`}>
                            <IconComponent className='size-5' />
                        </div>
                        <div className='min-w-0 flex-1'>
                            <CardTitle className='text-base leading-snug break-words sm:text-lg'>{wallet.name ?? 'Unnamed Wallet'}</CardTitle>
                            <CardDescription className='text-xs'>Created {formatDate(wallet._creationTime)}</CardDescription>
                        </div>
                    </div>
                    <div className='flex shrink-0 items-center gap-1'>
                        <WalletSettingsDialog
                            walletId={wallet._id}
                            trigger={
                                <Button
                                    size='icon'
                                    variant='ghost'
                                    className='size-11 rounded-sm'
                                    aria-label={`Settings for ${wallet.name || 'unnamed wallet'}`}
                                    title='Wallet settings'>
                                    <Settings className='size-4' />
                                </Button>
                            }
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className='space-y-5 px-5 sm:px-6'>
                <p className='text-3xl font-medium tracking-tight break-all tabular-nums'>{formatCurrency(wallet.balance, wallet.currency || 'USD')}</p>
                <div className='text-muted-foreground flex items-center justify-between gap-3 font-mono text-[10px] tracking-wider'>
                    <span>{wallet.currency || 'USD'}</span>
                    <Badge variant='secondary' className='rounded-sm px-2 font-mono text-[10px]'>
                        {wallet.balance > 0 ? 'Active' : 'Empty'}
                    </Badge>
                </div>
                <div className='flex flex-wrap gap-2 border-t pt-5 [&>button]:min-h-11 [&>button]:rounded-sm [&>button]:px-3 [&>button]:text-xs'>
                    <DepositDialog walletId={wallet._id} walletName={wallet.name} />
                    <WithdrawDialog walletId={wallet._id} walletName={wallet.name} balance={wallet.balance} />
                    <TransferDialog walletId={wallet._id} walletName={wallet.name} balance={wallet.balance} />
                </div>
            </CardContent>
        </Card>
    );
};
