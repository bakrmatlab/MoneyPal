import { Navigate, Outlet } from '@tanstack/react-router';
import { useConvexAuth } from '@convex-dev/react-query';
import { LoadingPage } from '@/components/layout/loading-page';
import { SkipToMain } from '@/components/skip-to-main';

type AuthenticatedLayoutProps = {
    children?: React.ReactNode;
};

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    const { isAuthenticated, isLoading } = useConvexAuth();

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to='/sign-in' />;
    }

    return (
        <>
            <SkipToMain />
            {children ?? <Outlet />}
        </>
    );
}
