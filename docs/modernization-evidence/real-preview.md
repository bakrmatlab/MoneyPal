# Real redesign branch preview

Preview: https://money-pal-git-style-modernization-2b10f2-bakr-matlabs-projects.vercel.app

Configured 2026-10-03 for `style/modernization-public-pages`. No merge or push to main; production frontend environment variables and live backend were not changed.

## Isolation

- Vercel project `money-pal`: `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_CONVEX_URL` are scoped to **Preview** and the exact redesign branch.
- Clerk uses the existing development instance. Sign-in accounts are shared with that instance; do not change Clerk account profiles or delete accounts as part of testing.
- Separate Convex project `moneypal-redesign-test`, development deployment `trustworthy-shark-486` (`https://trustworthy-shark-486.convex.cloud`). Starts empty; live wallet and transaction records are not copied.
- Existing backend code from `b50c45e` deployed to the new backend with TypeScript checking enabled. No application features or backend logic changed.
- Auth issuer matches the Clerk test instance. The test webhook signing secret is independent; no Clerk webhook is registered for this backend. Existing `users.ensureUserExists` initializes users from their signed JWT on first sign-in. Clerk lifecycle webhook sync is outside this preview setup and is not verified.
- Keep admin credentials out of Git and frontend environment variables.

## Verified

- New Convex schema/functions deployed successfully; backend TypeScript check passed.
- Vercel preview rebuild is READY (`dpl_BCGmMVbra9GnzTfh2gHi6BJJpBR9`, source `b50c45e`, target Preview).
- Landing page renders instead of the former blank startup failure.
- Real Clerk sign-in form renders with Google sign-in and Development mode; no browser console errors observed on landing/sign-in.
- Main remains at `6b7a668d2726c4f296d8e991bfe3a246ed0c8e1f`.

## User acceptance testing before main

Sign in through the preview URL (Vercel may first require the owner account). All financial records created here belong to the isolated test database. This is a money-tracking application; use fictional amounts and recipients.

1. Sign in and complete onboarding. Confirm the account reaches the dashboard.
2. Create two wallets, add fictional deposits and withdrawals, transfer between the wallets. Check balances and transaction details.
3. Create/edit the monthly budget and categories; verify filters, totals, empty states, and analytics update.
4. Test preferences, light/dark themes, mobile navigation, dialog scrolling, archived wallets, and keyboard focus.
5. E-transfers require a second test user signed in to this same preview. Verify both sent and received histories.
6. Sign out and sign back in; confirm test data persists.

Authenticated end-to-end behavior is still pending user sign-in and testing. Do not report it as verified merely because sign-in renders. Resolve reported regressions and complete final release checks before requesting approval to merge the production redesign PR stack. Do not include the disposable experiment PR.

## Future branch updates

Vercel automatically rebuilds this branch with its branch-scoped variables. Backend code changes require a separate explicit deploy to the isolated test deployment; Vercel currently builds only the frontend. Keep production variables scoped to production. When preparing the final main release, preserve the existing production backend configuration rather than copying the test URL.
