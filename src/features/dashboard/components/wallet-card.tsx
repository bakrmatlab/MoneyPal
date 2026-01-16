import { Wallet, CreditCard, Banknote, PiggyBank, Coins, Settings } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DepositDialog } from './deposit-dialog';
import { TransferDialog } from './transfer-dialog';
import { Wallet as WalletType } from './types';
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
    slate: 'bg-slate-500/10 border-slate-500/20 group-hover:border-slate-500/30',
    red: 'bg-red-500/10 border-red-500/20 group-hover:border-red-500/30',
    orange: 'bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/30',
    amber: 'bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/30',
    green: 'bg-green-500/10 border-green-500/20 group-hover:border-green-500/30',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/30',
    blue: 'bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/30',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/30',
    purple: 'bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/30',
    pink: 'bg-pink-500/10 border-pink-500/20 group-hover:border-pink-500/30',
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
        <Card className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${colorClass}`}>
            <CardHeader className='relative p-4 md:p-6'>
                <div className='flex items-start justify-between gap-2 md:gap-3'>
                    <div className='flex flex-1 items-start gap-2 md:gap-3'>
                        <div className={`rounded-lg p-1.5 md:p-2 ${iconColorClass}`}>
                            <IconComponent className='size-4 md:size-5' />
                        </div>
                        <div className='min-w-0 flex-1'>
                            <CardTitle className='truncate text-sm md:text-base'>{wallet.name ?? 'Unnamed Wallet'}</CardTitle>
                            <CardDescription className='text-[10px] md:text-xs'>Created {formatDate(wallet._creationTime)}</CardDescription>
                        </div>
                    </div>
                    <div className='flex items-center gap-1 md:gap-2'>
                        <Badge variant={wallet.balance > 0 ? 'default' : 'secondary'} className='shrink-0 px-1.5 text-[10px] md:px-2 md:text-xs'>
                            {wallet.balance > 0 ? 'Active' : 'Empty'}
                        </Badge>
                        <WalletSettingsDialog
                            walletId={wallet._id}
                            trigger={
                                <Button
                                    size='icon'
                                    variant='ghost'
                                    className='size-7 opacity-0 transition-opacity group-hover:opacity-100 md:size-8'
                                    title='Wallet settings'>
                                    <Settings className='size-3.5 md:size-4' />
                                </Button>
                            }
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className='relative p-4 pt-0 md:p-6 md:pt-0'>
                <p className='mb-3 text-xl font-bold tracking-tight md:mb-4 md:text-2xl'>{formatCurrency(wallet.balance, wallet.currency || 'USD')}</p>
                <div className='flex flex-wrap gap-2'>
                    <DepositDialog walletId={wallet._id} walletName={wallet.name} />
                    <WithdrawDialog walletId={wallet._id} walletName={wallet.name} balance={wallet.balance} />
                    <TransferDialog walletId={wallet._id} walletName={wallet.name} balance={wallet.balance} />
                </div>
            </CardContent>
        </Card>
    );
};
