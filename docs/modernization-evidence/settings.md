# Settings and onboarding verification

Actual components with synthetic fixtures, October 3, 2026. Onboarding screenshots use the temporary harness shell; production auth guards and standalone mounting are unchanged. No mutations executed.

- [Preferences mobile dark](preferences-mobile-dark.jpg)
- [Categories mobile dark, long name](categories-mobile-dark.jpg)
- [Onboarding wallet dark](onboarding-wallet-mobile-dark.jpg)
- [Onboarding budget light](onboarding-budget-mobile-light.jpg)

Build and ESLint on seven feature components plus the categories route pass. Type checking retains four existing Intl/implicit type errors in wallet-step; styling changes shift one reported line number.

Before: heavier cards, smaller inputs, unlabelled icon actions, categories page without consistent side padding. After: flatter sharp panels, larger controls, named category actions, connected currency label, consistent category page padding, and viewport-sized menus.

Browser verified long category names without main horizontal overflow at 320px, category dialog opening/cancellation, welcome to wallet progression, wallet skip to budget, and dark/light presentations. No preferences, category, wallet, budget, or onboarding completion mutation executed. React review confirms preserved handlers, options, initialization, and step transitions.

Release gates: configured backend saving/pending/error states, currency search/selection, emoji menu review, full responsive/theme matrix, and keyboard/contrast checks.
