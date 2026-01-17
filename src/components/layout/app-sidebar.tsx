import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useUser, useClerk } from '@clerk/clerk-react';
import { LayoutDashboard, Tags, ChevronLeft, ChevronRight, Settings, LogOut, ArrowRightLeft, SlidersHorizontal, BarChart3, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
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
            <div className='flex h-16 shrink-0 items-center border-b px-4'>
                {isMobile && onMobileOpenChange ? (
                    <Link to='/' className='flex w-full items-center gap-2 transition-opacity hover:opacity-80' onClick={() => onMobileOpenChange(false)}>
                        <span className='text-2xl font-bold tracking-tight'>MoneyPal</span>
                    </Link>
                ) : collapsed ? (
                    <button
                        onClick={onToggle}
                        className='bg-background text-muted-foreground hover:bg-accent hover:text-foreground mx-auto flex size-9 items-center justify-center rounded-full border shadow-sm'>
                        <ChevronRight className='size-4' />
                    </button>
                ) : (
                    <div className='flex w-full items-center justify-between'>
                        <Link to='/' className='flex items-center gap-2 transition-opacity hover:opacity-80'>
                            {/* <Fan className='size-6' /> */}
                            <span className='text-2xl font-bold tracking-tight'>MoneyPal</span>
                        </Link>
                        <button
                            onClick={onToggle}
                            className='bg-background text-muted-foreground hover:bg-accent hover:text-foreground flex size-8 items-center justify-center rounded-full border shadow-sm'>
                            <ChevronLeft className='size-4' />
                        </button>
                    </div>
                )}
            </div>

            {/* Menu Sections */}
            <div className='flex-1 overflow-y-auto py-4'>
                {menuSections.map((section, sectionIdx) => (
                    <div key={sectionIdx} className={cn('mb-6', sectionIdx > 0 && 'mt-8')}>
                        {!(collapsed && !isMobile) && (
                            <div className='text-muted-foreground mb-2 px-4 text-xs font-semibold tracking-wider'>{section.label}</div>
                        )}
                        <nav className='space-y-1 px-2'>
                            {section.items.map((item) => {
                                const isActive = location.pathname === item.to;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => isMobile && onMobileOpenChange?.(false)}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                                            isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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
            <div className='border-t p-2'>
                <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                'group hover:bg-accent flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors',
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
                                    <Settings className='text-muted-foreground ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100' />
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
                <SheetContent side='left' className='w-64 p-0'>
                    <div className='bg-background flex h-full flex-col'>{sidebarContent}</div>
                </SheetContent>
            </Sheet>
        );
    }

    return <aside className={cn('bg-background flex flex-col border-r transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>{sidebarContent}</aside>;
}
