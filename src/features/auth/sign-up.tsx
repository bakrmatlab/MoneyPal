import { SignUp } from '@clerk/clerk-react';
import { authAppearance } from './auth-appearance';
import { AuthPresentation } from './auth-presentation';

export function SignUpPage() {
    return (
        <AuthPresentation>
            <>
                <SignUp forceRedirectUrl='/dashboard' appearance={authAppearance} />
            </>
        </AuthPresentation>
    );
}
