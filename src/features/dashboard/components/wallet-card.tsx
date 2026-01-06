import { formatCurrency, formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DepositDialog } from './deposit-dialog';
import { TransferDialog } from './transfer-dialog';
import { Wallet } from './types';
import { WithdrawDialog } from './withdraw-dialog';

type WalletCardProps = {
    wallet: Wallet;
};

export const WalletCard = ({ wallet }: WalletCardProps) => {
    return (
        <Card className='group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md'>
            <div className='from-primary/5 absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
            <CardHeader className='relative'>
                <div className='flex items-start justify-between'>
                    <div>
                        <CardTitle className='text-base'>{wallet.name ?? 'Unnamed Wallet'}</CardTitle>
                        <CardDescription className='text-xs'>Created {formatDate(wallet._creationTime)}</CardDescription>
                    </div>
                    <Badge variant={wallet.balance > 0 ? 'default' : 'secondary'} className='text-xs'>
                        {wallet.balance > 0 ? 'Active' : 'Empty'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className='relative'>
                <p className='mb-4 text-2xl font-bold tracking-tight'>{formatCurrency(wallet.balance)}</p>
                <div className='flex flex-wrap gap-2'>
                    <DepositDialog walletId={wallet._id} walletName={wallet.name} />
                    <WithdrawDialog walletId={wallet._id} walletName={wallet.name} balance={wallet.balance} />
                    <TransferDialog walletId={wallet._id} walletName={wallet.name} balance={wallet.balance} />
                </div>
            </CardContent>
        </Card>
    );
};
