import { SignIn } from '@clerk/clerk-react';
import { authAppearance } from './auth-appearance';
import { AuthPresentation } from './auth-presentation';

export function SignInPage() {
    return (
        <AuthPresentation>
            <>
                <SignIn forceRedirectUrl='/dashboard' appearance={authAppearance} />
            </>
        </AuthPresentation>
    );
}
