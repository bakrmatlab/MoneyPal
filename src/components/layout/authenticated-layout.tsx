import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet } from '@tanstack/react-router';
import { convexQuery, useConvexAuth } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { useMutation as useConvexMutation } from 'convex/react';
import { LoadingPage } from '@/components/layout/loading-page';
import { SkipToMain } from '@/components/skip-to-main';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';

type AuthenticatedLayoutProps = {
    children?: React.ReactNode;
};

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { data: user, isPending: userPending } = useQuery({
        ...convexQuery(api.users.current, {}),
        enabled: isAuthenticated,
    });

    const ensureUserExists = useConvexMutation(api.users.ensureUserExists);

    // Create user record from JWT claims if the webhook hasn't fired yet
    useEffect(() => {
        if (isAuthenticated && !userPending && user === null) {
            ensureUserExists();
        }
    }, [isAuthenticated, userPending, user, ensureUserExists]);

    if (isLoading || (isAuthenticated && userPending)) {
        return <LoadingPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to='/sign-in' />;
    }

    // Still waiting for ensureUserExists to run and the query to refetch
    if (user === null) {
        return <LoadingPage />;
    }

    if (user?.onboardingCompleted === false) {
        return <Navigate to='/onboarding' />;
    }

    return (
        <div className='bg-background flex h-dvh overflow-hidden'>
            <SkipToMain />
            <AppSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileMenuOpen}
                onMobileOpenChange={setMobileMenuOpen}
            />
            <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
                <AppHeader onMenuClick={() => setMobileMenuOpen(true)} />
                <main id='content' tabIndex={-1} className='min-w-0 flex-1 overflow-y-auto scroll-smooth outline-none'>
                    {children ?? <Outlet />}
                </main>
            </div>
        </div>
    );
}
