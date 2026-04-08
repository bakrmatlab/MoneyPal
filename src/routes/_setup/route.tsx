import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { convexQuery, useConvexAuth } from '@convex-dev/react-query';
import { api } from '@convex/_generated/api';
import { LoadingPage } from '@/components/layout/loading-page';

function SetupLayout() {
    const { isAuthenticated, isLoading } = useConvexAuth();

    const { data: user, isPending: userPending } = useQuery({
        ...convexQuery(api.users.current, {}),
        enabled: isAuthenticated,
    });

    if (isLoading || (isAuthenticated && userPending)) {
        return <LoadingPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to='/sign-in' />;
    }

    // Redirect away if the user has already completed (or doesn't need) onboarding.
    // onboardingCompleted === false means a brand-new user; undefined means existing user.
    if (user?.onboardingCompleted !== false) {
        return <Navigate to='/dashboard' />;
    }

    return <Outlet />;
}

export const Route = createFileRoute('/_setup')({
    component: SetupLayout,
});
