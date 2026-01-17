import { createFileRoute } from '@tanstack/react-router';
import { ETransfersPage } from '@/features/e-transfers';

export const Route = createFileRoute('/_authenticated/e-transfers')({
    component: ETransfersPage,
});
