import { useAuth } from '@clerk/clerk-react';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface SignOutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
    const { signOut } = useAuth();

    const handleSignOut = () => {
        signOut();
    };

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title='Sign out'
            desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
            confirmText='Sign out'
            handleConfirm={handleSignOut}
            className='sm:max-w-sm'
            destructive
        />
    );
}
