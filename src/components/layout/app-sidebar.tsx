import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useUser, useClerk } from '@clerk/clerk-react';
import {
    LayoutDashboard,
    Tags,
    ChevronLeft,
    ChevronRight,
    Settings,
    LogOut,
    ArrowRightLeft,
    SlidersHorizontal,
    BarChart3,
    Send,
    ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { SignOutDialog } from '@/components/sign-out-dialog';

const menuSections = [
    {
        label: 'MAIN MENU',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
            { label: 'Transactions', icon: ArrowRightLeft, to: '/transactions' },
            { label: 'E-Transfers', icon: Send, to: '/e-transfers' },
            { label: 'Analytics', icon: BarChart3, to: '/analytics' },
            { label: 'Categories', icon: Tags, to: '/categories' },
        ],
    },
    {
        label: 'SETTINGS',
        items: [{ label: 'Preferences', icon: SlidersHorizontal, to: '/preferences' }],
    },
];

type AppSidebarProps = {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen?: boolean;
    onMobileOpenChange?: (open: boolean) => void;
};

export function AppSidebar({ collapsed, onToggle, mobileOpen = false, onMobileOpenChange }: AppSidebarProps) {
    const location = useLocation();
    const { user } = useUser();
    const { openUserProfile } = useClerk();
    const [signOutOpen, setSignOutOpen] = useState(false);
    const isMobile = useIsMobile();

    const sidebarContent = (
        <>
            {/* Logo and Toggle */}
            <div className='border-sidebar-border flex h-20 shrink-0 items-center border-b px-4'>
                {isMobile && onMobileOpenChange ? (
                    <Link to='/' className='flex w-full items-center gap-2 transition-opacity hover:opacity-80' onClick={() => onMobileOpenChange(false)}>
                        <span className='bg-brand text-brand-foreground flex size-7 shrink-0 items-center justify-center rounded-sm'>
                            <ArrowUpRight className='size-4' aria-hidden='true' />
                        </span>
                        <span className='text-xl font-semibold tracking-tight'>MoneyPal</span>
                    </Link>
                ) : collapsed ? (
                    <button
                        onClick={onToggle}
                        aria-label='Expand navigation'
                        className='bg-background text-muted-foreground hover:bg-accent hover:text-foreground mx-auto flex size-9 items-center justify-center rounded-sm border shadow-none'>
                        <ChevronRight className='size-4' />
                    </button>
                ) : (
                    <div className='flex w-full items-center justify-between'>
                        <Link to='/' className='flex items-center gap-2 transition-opacity hover:opacity-80'>
                            <span className='bg-brand text-brand-foreground flex size-7 shrink-0 items-center justify-center rounded-sm'>
                                <ArrowUpRight className='size-4' aria-hidden='true' />
                            </span>
                            <span className='text-xl font-semibold tracking-tight'>MoneyPal</span>
                        </Link>
                        <button
                            onClick={onToggle}
                            aria-label='Collapse navigation'
                            className='bg-background text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 items-center justify-center rounded-sm border shadow-none'>
                            <ChevronLeft className='size-4' />
                        </button>
                    </div>
                )}
            </div>

            {/* Menu Sections */}
            <div className='flex-1 overflow-y-auto py-7'>
                {menuSections.map((section, sectionIdx) => (
                    <div key={sectionIdx} className={cn('mb-6', sectionIdx > 0 && 'mt-8')}>
                        {!(collapsed && !isMobile) && (
                            <div className='text-muted-foreground mb-2 px-4 font-mono text-[10px] tracking-[0.16em]'>{section.label}</div>
                        )}
                        <nav aria-label={section.label === 'MAIN MENU' ? 'Main navigation' : 'Settings navigation'} className='space-y-1 px-3'>
                            {section.items.map((item) => {
                                const isActive = location.pathname === item.to;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        aria-current={isActive ? 'page' : undefined}
                                        aria-label={item.label}
                                        title={collapsed && !isMobile ? item.label : undefined}
                                        onClick={() => isMobile && onMobileOpenChange?.(false)}
                                        className={cn(
                                            'focus-visible:ring-sidebar-ring flex min-h-11 items-center gap-3 rounded-sm border-l-2 px-3 py-2.5 transition-colors focus-visible:ring-2 focus-visible:outline-none',
                                            isActive
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground border-primary'
                                                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground border-transparent'
                                        )}>
                                        <Icon className='size-5 shrink-0' />
                                        {!(collapsed && !isMobile) && <span className='text-sm font-medium'>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>
            {/* User Profile */}
            <div className='border-sidebar-border border-t p-3'>
                <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            aria-label='Account menu'
                            className={cn(
                                'group hover:bg-sidebar-accent focus-visible:ring-sidebar-ring flex w-full items-center gap-3 rounded-sm p-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none',
                                collapsed && 'justify-center'
                            )}>
                            <Avatar className='h-9 w-9 border'>
                                <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                                <AvatarFallback>
                                    {user?.firstName?.charAt(0)}
                                    {user?.lastName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {!collapsed && (
                                <>
                                    <div className='flex-1 overflow-hidden'>
                                        <p className='truncate text-sm leading-none font-medium'>{user?.fullName}</p>
                                        <p className='text-muted-foreground truncate text-xs'>{user?.primaryEmailAddress?.emailAddress}</p>
                                    </div>
                                    <Settings className='text-muted-foreground ml-auto h-4 w-4 opacity-70' />
                                </>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align='start'
                        className='bg-popover text-popover-foreground w-56 overflow-hidden rounded-xl border shadow-md'
                        side='right'
                        sideOffset={10}>
                        <DropdownMenuItem className='cursor-pointer' onClick={() => openUserProfile()}>
                            <Settings className='mr-2 h-4 w-4' />
                            Account Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className='text-destructive focus:text-destructive cursor-pointer' onClick={() => setSignOutOpen(true)}>
                            <LogOut className='mr-2 h-4 w-4' />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
                <SheetContent side='left' className='bg-sidebar w-72 max-w-[85vw] p-0'>
                    <SheetTitle className='sr-only'>MoneyPal navigation</SheetTitle>
                    <SheetDescription className='sr-only'>Navigate between your wallets, transactions, analytics, and settings.</SheetDescription>
                    <div className='bg-sidebar flex h-full flex-col'>{sidebarContent}</div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <aside className={cn('bg-sidebar border-sidebar-border flex shrink-0 flex-col border-r transition-[width] duration-200', collapsed ? 'w-18' : 'w-60')}>
            {sidebarContent}
        </aside>
    );
}
