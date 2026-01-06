import { SignUp } from '@clerk/clerk-react';
import { PageTemplate } from '@/components/layout/page-template';

export function SignUpPage() {
    return (
        <PageTemplate>
            <div className='flex h-full items-center justify-center'>
                <SignUp />
            </div>
        </PageTemplate>
    );
}
