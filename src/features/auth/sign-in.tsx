import { SignIn } from '@clerk/clerk-react';
import { PageTemplate } from '@/components/layout/page-template';

export function SignInPage() {
    return (
        <PageTemplate>
            <div className='flex h-full items-center justify-center'>
                <SignIn forceRedirectUrl='/dashboard' />
            </div>
        </PageTemplate>
    );
}
