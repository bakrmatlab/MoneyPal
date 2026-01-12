# Money-Pal 💰

A modern personal finance management application for multi-wallet money tracking with real-time synchronization.

## Features

- **Multi-Wallet Management** - Create and manage unlimited wallets
- **Real-Time Sync** - Instant updates across all devices via Convex
- **Transaction History** - Complete logs with filtering and search
- **Category Management** - Organize transactions with custom categories
- **Dashboard Analytics** - View total balance and quick stats
- **Dark/Light Mode** - Modern, responsive UI

## Tech Stack

- **Frontend**: React 19 + Vite + TanStack Router
- **Backend**: Convex (real-time serverless)
- **Auth**: Clerk
- **UI**: Shadcn UI + TailwindCSS 4

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) or Node.js 18+
- [Clerk account](https://clerk.com/)
- [Convex account](https://convex.dev/)

### Installation

```bash
# Clone and install
git clone https://github.com/bakrmatlab/MoneyPal.git
cd MoneyPal
bun install

# Set up environment variables
cp .env.example .env.local
# Fill in your Convex URL and Clerk keys

# Start development
bun run convex dev  # Terminal 1
bun run dev         # Terminal 2
```

### Environment Variables

```bash
# .env.local
VITE_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_convex_deployment
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### Convex Setup

Add these environment variables in your Convex dashboard:

```bash
CLERK_WEBHOOK_SECRET=whsec_your_secret
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
```

Set up a Clerk webhook pointing to `{convex_url}/clerk-users-webhook` for events: `user.created`, `user.updated`, `user.deleted`.

## Scripts

```bash
bun run dev      # Start dev server
bun run build    # Build for production
bun run lint     # Run ESLint
bun run format   # Format with Prettier
```

## License

MIT
