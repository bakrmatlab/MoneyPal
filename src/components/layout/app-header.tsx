import { Link } from '@tanstack/react-router';
import { useConvexAuth } from '@convex-dev/react-query';
import { Fan, LayoutDashboard } from 'lucide-react';
import { ProfileDropdown } from '../profile-dropdown';
import { ThemeSwitch } from '../theme-switch';
import { Button } from '../ui/button';
import { Header } from './header';

interface AppHeaderProps {
    fixed?: boolean;
}

export function AppHeader({ fixed }: AppHeaderProps) {
    const { isAuthenticated } = useConvexAuth();

    return (
        <Header fixed={fixed}>
            <Link to='/' className='flex items-center gap-2 transition-opacity hover:opacity-80'>
                <Fan />
                <span className='text-lg font-medium'>Money-Pal</span>
            </Link>
            <div className='ms-auto flex items-center space-x-4'>
                {isAuthenticated && (
                    <Button asChild>
                        <Link to='/dashboard'>
                            <LayoutDashboard />
                            Dashboard
                        </Link>
                    </Button>
                )}
                <ThemeSwitch />
                <ProfileDropdown />
            </div>
        </Header>
    );
}
