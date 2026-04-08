# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (run both concurrently)
bun run dev          # Start Vite frontend (port 5173)
bun run convex       # Start Convex backend (watch mode)

# Production
bun run build        # tsc -b && vite build
bun run convex:deploy  # Deploy Convex backend

# Code quality
bun run lint         # ESLint
bun run format       # Prettier (also sorts Tailwind classes and imports)
bun run knip         # Check for unused dependencies/exports
```

No test framework is configured.

## Architecture

MoneyPal is a personal finance app: React 19 SPA (Vite + TanStack Router) backed by Convex (serverless, real-time DB), with Clerk for auth.

**Key tech:** Bun · Convex · Clerk · TanStack Router (file-based) · TanStack Query · Shadcn UI (Radix + TailwindCSS 4) · Zustand · React Hook Form + Zod · Recharts

### Backend: `convex/`

Convex is the entire backend — no separate API server. Functions live in `convex/` and are organized by domain: `users`, `wallets`, `transactions`, `categories`, `analytics`, `userPreferences`.

- `schema.ts` — single source of truth for DB tables and indexes
- `auth.config.ts` — Clerk JWT validation config
- `http.ts` — HTTP endpoints; handles Clerk webhooks → `users.upsertFromClerk`
- `env.ts` — typed environment variable access

**Auth flow:** Clerk issues JWT → `ConvexProviderWithClerk` passes it to Convex → every authenticated function calls `getCurrentUser()` / `getCurrentUserOrThrow()`. Clerk webhooks sync user creation/updates to the Convex `users` table and seed default categories on first wallet creation.

**Transaction types:** `deposit`, `withdrawal`, `transfer` (same-user wallet-to-wallet), `etransfer` (between users). Transactions use soft delete (`isDeleted` boolean).

### Frontend: `src/`

```
routes/          # TanStack Router file-based routes
  __root.tsx     # Root wrapper (providers)
  index.tsx      # Landing page
  _authenticated/  # Protected layout group (auth guard)
  (auth)/        # Sign-in / sign-up (non-route grouping)
  (errors)/      # 404, 401, 403, 500, 503

features/        # Feature modules — one folder per page feature
  [name]/
    index.tsx    # Main exported component (mounted by route)
    components/  # Feature-local subcomponents

components/
  ui/            # Shadcn components — do not edit these
  layout/        # App shell (sidebar, header, PageTemplate)
```

All protected routes live under `_authenticated/route.tsx` which enforces auth. Every page wraps its content in `<PageTemplate>` for consistent layout.

### Data Fetching Pattern

```typescript
// Query
const { data, isPending } = useQuery(convexQuery(api.module.fnName, { args }));

// Mutation
const { mutate, isPending } = useMutation({
  mutationFn: useConvexMutation(api.module.fnName),
  onSuccess: () => { /* invalidate/toast */ },
  onError: (err) => toast.error(getConvexErrorMessage(err)),
});
```

Import `convexQuery` from `@convex-dev/react-query`, `useConvexMutation` from `convex/react`.

### Convex Function Conventions

Use the **new** validator syntax (not `v.object` wrappers at the top level):

```typescript
// query
export const myQuery = query({
  args: { id: v.id("tableName") },
  handler: async (ctx, args) => { ... },
});

// mutation
export const myMutation = mutation({
  args: { field: v.string() },
  handler: async (ctx, args) => { ... },
});
```

Internal functions use `internalQuery` / `internalMutation` / `internalAction`. Call them with `ctx.runQuery(internal.module.fn, args)`.

### Path Aliases

- `@/*` → `src/*`
- `@convex/*` → `convex/*`

### ESLint / Style Rules

- No `console` statements (error-level)
- Type-only imports enforced (`import type { ... }`)
- No duplicate imports
- `src/components/ui/` is excluded from linting (Shadcn-managed)
- All styling via TailwindCSS — no CSS files or inline styles
- Folders: kebab-case. Components: PascalCase files and exports.
