import { useState } from 'react';
import { Navigate, Outlet } from '@tanstack/react-router';
import { useConvexAuth } from '@convex-dev/react-query';
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

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to='/sign-in' />;
    }

    return (
        <div className='bg-background flex h-screen overflow-hidden'>
            <SkipToMain />
            <AppSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileMenuOpen}
                onMobileOpenChange={setMobileMenuOpen}
            />
            <div className='flex flex-1 flex-col overflow-hidden'>
                <AppHeader onMenuClick={() => setMobileMenuOpen(true)} />
                <main className='flex-1 overflow-y-auto scroll-smooth'>{children ?? <Outlet />}</main>
            </div>
        </div>
    );
}
