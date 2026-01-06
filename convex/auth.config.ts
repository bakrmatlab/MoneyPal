import { AuthConfig } from 'convex/server';
import { ConvexError } from 'convex/values';
import { CLERK_JWT_ISSUER_DOMAIN } from './env';

if (!CLERK_JWT_ISSUER_DOMAIN) {
    throw new ConvexError('CLERK_JWT_ISSUER_DOMAIN environment variable is not set');
}

export default {
    providers: [
        {
            // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
            domain: CLERK_JWT_ISSUER_DOMAIN,
            applicationID: 'convex',
        },
    ],
} satisfies AuthConfig;
