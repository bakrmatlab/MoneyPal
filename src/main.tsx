import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ThemeProvider, useTheme } from './context/theme-provider';
// Generated Routes
import { routeTree } from './routeTree.gen';
// Styles
import './styles/index.css';

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

if (!PUBLISHABLE_KEY) {
    throw new Error('Add your VITE_CLERK_PUBLISHABLE_KEY to the .env file');
}

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;

if (!CONVEX_URL) {
    throw new Error('Add your VITE_CONVEX_URL to the .env file');
}

const convex = new ConvexReactClient(CONVEX_URL);

const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryKeyHashFn: convexQueryClient.hashFn(),
            queryFn: convexQueryClient.queryFn(),
        },
    },
});
convexQueryClient.connect(queryClient);

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {
        queryClient,
    },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export const App = () => {
    const { resolvedTheme } = useTheme();
    return (
        <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            appearance={{
                baseTheme: resolvedTheme === 'dark' ? dark : undefined,
            }}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router} />
                </QueryClientProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
};

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </StrictMode>
    );
}
