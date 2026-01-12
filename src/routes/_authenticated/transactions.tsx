import { createFileRoute } from '@tanstack/react-router';
import { TransactionsPage } from '@/features/transactions';

export const Route = createFileRoute('/_authenticated/transactions')({
    component: RouteComponent,
});

function RouteComponent() {
    return <TransactionsPage />;
}
