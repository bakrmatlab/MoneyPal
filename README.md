# MoneyPal 💰

A modern personal finance management application for multi-wallet money tracking with real-time synchronization and comprehensive financial analytics.

## Features

### Core Features

- **Multi-Wallet Management** - Create and manage unlimited wallets with custom colors and icons
- **Real-Time Sync** - Instant updates across all devices via Convex
- **Transaction Management** - Track deposits, withdrawals, and transfers
- **E-Transfer System** - Send and receive money between users
- **Category Management** - Organize transactions with custom categories (income/expense)
- **Analytics Dashboard** - Comprehensive financial insights and visualizations
- **User Preferences** - Customizable settings and preferences
- **Dark/Light Mode** - Modern, responsive UI with theme switching

### Transaction Types

- Deposits
- Withdrawals
- Wallet-to-wallet transfers
- E-transfers between users

## Tech Stack

- **Frontend**: React 19 + Vite + TanStack Router
- **Backend**: Convex (real-time serverless backend)
- **Auth**: Clerk (authentication & user management)
- **UI**: Shadcn UI + TailwindCSS 4
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for analytics
- **State**: Zustand + TanStack Query
- **Icons**: Iconify + Lucide React

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [Clerk account](https://clerk.com/) for authentication
- [Convex account](https://convex.dev/) for backend

### Installation

```bash
# Clone the repository
git clone https://github.com/bakrmatlab/MoneyPal.git
cd MoneyPal

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Fill in your Convex and Clerk credentials

# Start development servers
bun run convex    # Terminal 1 - Convex backend
bun run dev       # Terminal 2 - Vite dev server
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Convex
VITE_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_convex_deployment

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Convex Setup

Add these environment variables in your Convex dashboard (Settings → Environment Variables):

```bash
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
```

Set up a Clerk webhook:

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `{your_convex_url}/clerk-users-webhook`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`

## Project Structure

```
MoneyPal/
├── convex/               # Convex backend
│   ├── schema.ts        # Database schema
│   ├── wallets.ts       # Wallet operations
│   ├── transactions.ts  # Transaction logic
│   ├── categories.ts    # Category management
│   ├── analytics.ts     # Analytics queries
│   ├── userPreferences.ts
│   └── users.ts
├── src/
│   ├── components/      # Reusable UI components
│   ├── features/        # Feature modules
│   │   ├── analytics/
│   │   ├── dashboard/
│   │   ├── e-transfers/
│   │   ├── transactions/
│   │   └── settings/
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and helpers
│   └── routes/         # TanStack Router routes
└── docs/               # Documentation
```

## Available Scripts

```bash
# Development
bun run dev            # Start Vite dev server
bun run convex         # Start Convex dev backend

# Build & Deploy
bun run build          # Build for production
bun run preview        # Preview production build
bun run convex:deploy  # Deploy Convex backend

# Code Quality
bun run lint           # Run ESLint
bun run format         # Format with Prettier
bun run knip           # Check for unused dependencies
```

## Documentation

- [Convex Rules](docs/convex_rules.md) - Backend development guidelines
- [Convex + TanStack Query](docs/convex-tanstack-query.md) - Integration patterns
- [Frontend Guidelines](docs/frontend.md) - Frontend development standards
- [Bun & Execution Policy](docs/bun-and-execution-policy.md) - Setup troubleshooting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Author

Developed by [bakrmatlab](https://github.com/bakrmatlab)
