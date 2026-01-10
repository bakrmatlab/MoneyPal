import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useClerk, useUser as useClerkUser } from '@clerk/clerk-react';
import { useConvexAuth } from 'convex/react';
import { LogOut, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignOutDialog } from './sign-out-dialog';
import { Skeleton } from './ui/skeleton';

export function ProfileDropdown() {
    const [signOutOpen, setSignOutOpen] = useState(false);
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { user: clerkUser } = useClerkUser();
    const { openUserProfile } = useClerk();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className='flex items-center gap-2'>
                <Skeleton className='h-9 w-9' />
                <Skeleton className='h-9 w-24' />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className='flex items-center gap-2'>
                <Button variant='secondary' onClick={() => navigate({ to: '/sign-in' })}>
                    Login
                </Button>
                <Button onClick={() => navigate({ to: '/sign-up' })}>Register</Button>
            </div>
        );
    }

    return (
        <>
            <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />

            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                        <Avatar className='h-8 w-8'>
                            <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.firstName || ''} />
                            <AvatarFallback>
                                {clerkUser?.firstName?.charAt(0)}
                                {clerkUser?.lastName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end' forceMount>
                    <DropdownMenuLabel className='font-normal'>
                        <div className='flex flex-col gap-1.5'>
                            <p className='text-sm leading-none font-medium'>{clerkUser?.fullName}</p>
                            <p className='text-muted-foreground text-xs leading-none'>{clerkUser?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => openUserProfile()}>
                        <UserCircle />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSignOutOpen(true)} variant='destructive'>
                        <LogOut />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
