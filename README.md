# Money-Pal 💰

A modern personal finance management application for multi-wallet money tracking with real-time synchronization.

## Overview

Money-Pal helps you take control of your finances by allowing you to manage multiple wallets, track transactions in real-time, and gain insights into your spending habits. Built with modern web technologies for a fast, secure, and delightful user experience.

## Features

### Current Features ✅
- **Multi-Wallet Management** - Create and manage unlimited wallets for different purposes
- **Real-Time Sync** - Instant balance updates across all devices using Convex
- **Secure Authentication** - Full Clerk integration with user profile management
- **Wallet Operations**
  - Deposit funds to any wallet
  - Withdraw funds with balance validation
  - Transfer money between your wallets
- **Dashboard Analytics** - View total balance, wallet count, and quick stats
- **Beautiful UI** - Modern, responsive design with light/dark mode support
- **Accessibility** - WCAG 2.1 AA compliant interface

### Coming Soon 🚀
- Transaction history and detailed logs
- Budget tracking and spending insights
- Category-based expense tracking
- Data export (CSV/PDF)
- Savings goals
- Recurring transactions
- Multi-currency support

See the [Feature Roadmap](docs/money-pal-feature-roadmap.md) for detailed development plans.

## Tech Stack

- **Frontend**: React 19.2 + Vite 7.1
- **Routing**: TanStack Router (file-based)
- **Backend**: Convex (real-time serverless database)
- **Authentication**: Clerk
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: TailwindCSS 4.1
- **State Management**: TanStack Query with Convex integration
- **Type Safety**: TypeScript throughout

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [Clerk account](https://clerk.com/) (free tier available)
- [Convex account](https://convex.dev/) (free tier available)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/roynulrohan/money-pal.git
cd money-pal
```

2. **Install dependencies**

```bash
bun install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
VITE_CONVEX_URL=your_convex_url_here
CONVEX_DEPLOYMENT=your_convex_deployment_here
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

4. **Initialize Convex**

```bash
bun run convex dev
```

This will give you your Convex URL - add it to `.env.local`.

5. **Set up Clerk**

- Go to [Clerk Dashboard](https://dashboard.clerk.com/) → JWT Templates
- Create a new template named "convex"
- Copy the Issuer URL (looks like `https://your-app.clerk.accounts.dev`)

6. **Configure Convex environment variables**

In your Convex dashboard, add these environment variables:

```bash
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
```

7. **Set up Clerk webhooks**

In Clerk Dashboard → Webhooks:
- Endpoint URL: `{your_convex_url}/clerk-users-webhook`
- Subscribe to events: `user.created`, `user.updated`, `user.deleted`
- Copy the webhook secret and add it to Convex environment variables

8. **Start development server**

```bash
bun run dev
```

Your app should now be running at `http://localhost:5173`!

## Project Structure

```
money-pal/
├── convex/                      # Backend (Convex)
│   ├── _generated/              # Auto-generated API types
│   ├── auth.config.ts           # Clerk authentication config
│   ├── http.ts                  # HTTP actions & webhooks
│   ├── schema.ts                # Database schema
│   ├── users.ts                 # User queries/mutations
│   └── wallets.ts               # Wallet queries/mutations
│
├── docs/                        # Documentation
│   └── money-pal-feature-roadmap.md
│
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── layout/              # Layout components
│   │   └── ui/                  # Shadcn UI components
│   ├── context/                 # React contexts (theme, etc)
│   ├── features/                # Feature modules
│   │   ├── auth/                # Authentication pages
│   │   ├── dashboard/           # Main dashboard & wallet management
│   │   ├── errors/              # Error pages
│   │   └── landing/             # Landing page
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities & helpers
│   ├── routes/                  # TanStack Router routes
│   └── styles/                  # Global styles
│
└── public/                      # Static assets
```

## Usage

### Creating a Wallet

1. Sign up or log in to your account
2. Navigate to the Dashboard
3. Click "Create Wallet"
4. Enter a name (optional) and click "Create"

### Managing Money

**Deposit**: Click the deposit button on any wallet card, enter amount, and confirm.

**Withdraw**: Click the withdraw button, enter amount (must not exceed balance), and confirm.

**Transfer**: Click the transfer button, select destination wallet, enter amount, and confirm.

### Viewing Balances

- **Total Balance**: Displayed at the top of the dashboard
- **Individual Wallets**: Each wallet card shows its current balance
- **Real-Time Updates**: All balances update instantly across all your devices

## Data Models

### Users
```typescript
{
  _id: Id<'users'>,
  clerkUserId: string,     // Clerk user ID (indexed)
  email: string,
  fullName: string,
  username?: string,
  _creationTime: number
}
```

### Wallets
```typescript
{
  _id: Id<'wallets'>,
  userId: Id<'users'>,     // Owner (indexed)
  name?: string,           // Optional wallet name
  balance: number,         // Current balance
  _creationTime: number
}
```

## Technology Deep Dive

### TanStack Query + Convex

Money-Pal uses TanStack Query with Convex for state management. Unlike traditional polling, Convex provides **reactive subscriptions** - your UI updates automatically when data changes, with zero configuration.

#### Example: Fetching Wallets

```typescript
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';

function WalletList() {
  const { data: wallets, isPending } = useQuery(
    convexQuery(api.wallets.getAll, {})
  );

  if (isPending) return <div>Loading...</div>;
  
  return (
    <div>
      {wallets?.map(wallet => (
        <div key={wallet._id}>{wallet.name}: ${wallet.balance}</div>
      ))}
    </div>
  );
}
```

#### Example: Creating a Wallet

```typescript
import { useMutation } from '@tanstack/react-query';
import { useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

function CreateWalletButton() {
  const { mutate: createWallet, isPending } = useMutation({
    mutationFn: useConvexMutation(api.wallets.create),
    onSuccess: () => toast.success('Wallet created!'),
    onError: (error) => toast.error(error.message),
  });

  return (
    <button 
      onClick={() => createWallet({ name: 'Savings' })}
      disabled={isPending}
    >
      Create Wallet
    </button>
  );
}
```

**Key Benefits:**
- No manual cache invalidation needed
- Real-time updates across all clients
- Optimistic updates supported
- Automatic retry and error handling
- Type-safe end-to-end

### TanStack Router

Money-Pal uses file-based routing with TanStack Router. Routes are automatically generated from the file structure in `src/routes/`.

**Route Patterns:**

| Pattern           | Purpose                    | Example                          |
|-------------------|----------------------------|----------------------------------|
| `__root.tsx`      | Root layout                | Global layout with header        |
| `index.tsx`       | Index route                | Home/Landing page                |
| `route.tsx`       | Layout wrapper             | Authenticated layout             |
| `$param.tsx`      | Dynamic parameter          | `/users/$userId`                 |
| `_prefix/`        | Layout group (in path)     | `/_authenticated/dashboard`      |
| `(group)/`        | Pathless grouping          | `/(auth)/sign-in`                |

**Example Route:**

```typescript
// src/routes/_authenticated/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router';
import { Dashboard } from '@/features/dashboard';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
});
```

The `_authenticated` layout wrapper protects routes and redirects unauthenticated users to the sign-in page.

## Available Scripts

```bash
# Development
bun run dev              # Start dev server (Vite)
bun run convex dev       # Start Convex dev server

# Building
bun run build            # Build for production
bun run preview          # Preview production build

# Code Quality
bun run lint             # Run ESLint
bun run format           # Format code with Prettier
bun run knip             # Find unused dependencies
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## Roadmap

See [docs/money-pal-feature-roadmap.md](docs/money-pal-feature-roadmap.md) for the complete development roadmap.

### Upcoming Features
- **Phase 1**: Transaction history, wallet deletion, categories
- **Phase 2**: Analytics dashboard, spending charts, data export
- **Phase 3**: Budget tracking, savings goals, recurring transactions
- **Phase 4**: Multi-currency support, security enhancements
- **Phase 5**: User-to-user transfers, split bills, group expenses

## Security

- All data is encrypted in transit and at rest
- Clerk handles authentication with industry-standard security
- Convex provides ACID transactions for financial operations
- No sensitive data is stored in localStorage
- Regular security audits and dependency updates

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/roynulrohan/money-pal/issues)
- **Discussions**: [GitHub Discussions](https://github.com/roynulrohan/money-pal/discussions)
- **Email**: support@money-pal.app

## Acknowledgments

- [Convex](https://convex.dev) - Real-time backend platform
- [Clerk](https://clerk.com) - Authentication and user management
- [Shadcn UI](https://ui.shadcn.com) - Beautiful UI components
- [TanStack](https://tanstack.com) - Router and Query libraries
- [Vite](https://vitejs.dev) - Lightning-fast build tool

---

Built with ❤️ using modern web technologies

**Money-Pal** - Take control of your finances, one wallet at a time.

---

## Convex Backend

### Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
    users: defineTable({
        fullName: v.string(),
        email: v.string(),
        clerkUserId: v.string(),
    }).index('by_clerkUserId', ['clerkUserId']),
});
```

### Functions

| Type         | Purpose               |
| ------------ | --------------------- |
| `query`      | Read data (real-time) |
| `mutation`   | Write data            |
| `action`     | External API calls    |
| `httpAction` | HTTP endpoints        |

---

## Clerk Authentication

Clerk handles authentication and syncs users to Convex via webhooks.

### Webhook Events

| Event          | Action             |
| -------------- | ------------------ |
| `user.created` | Insert user record |
| `user.updated` | Update user record |
| `user.deleted` | Delete user record |

### Protected Routes

Add paths to `protectedRoutes` in `authenticated-layout.tsx`:

```typescript
const protectedRoutes: string[] = ['/dashboard', '/settings'];
```

---

## Resources

- [Convex + TanStack Query Docs](https://docs.convex.dev/client/tanstack/tanstack-query/)
- [Storing Users via Webhooks](https://docs.convex.dev/auth/database-auth#set-up-webhooks)
