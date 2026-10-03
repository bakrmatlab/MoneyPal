# Wallet and financial dialog verification

Actual components with synthetic fixtures, October 3, 2026. No backend mutations or real financial data.

- [Withdrawal, mobile dark](withdraw-mobile-dark.jpg): existing over-balance error and disabled submission at 390 × 844.
- [Wallet settings, mobile dark](wallet-settings-mobile-dark.jpg).
- [Wallet creation, mobile light](create-wallet-mobile-light.jpg).

Build and ESLint on all seven changed components pass. Type checking retains the same four onboarding errors. Existing type-only import and inferred wallet type lint issues were corrected in touched files.

Browser checks covered withdrawal opening, category selection, over-balance validation and cancellation; wallet settings opening/cancellation; transfer over-balance validation/cancellation; recipient menu opening/dismissal; send cancellation; wallet creation opening. Wallet settings has no horizontal overflow and scrolls at 320 × 568. No financial submission was executed.

Before: plain dialog headers, smaller fields, a fixed 400px recipient popup, and no short-screen height cap. After: divided headers/actions, larger controls, trigger-width popups, and vertically scrollable dialog panels. Category labels are now associated with their controls; wallet choice labels show keyboard focus.

Live mutation/pending/error behavior, budget confirmations, destructive confirmations, full keyboard navigation, and the complete theme/breakpoint matrix remain release gates. Handler bodies, queries, field semantics, balance checks, and confirmation steps are preserved. No shared shadcn sources were edited.
