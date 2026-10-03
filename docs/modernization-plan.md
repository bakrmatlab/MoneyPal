# MoneyPal visual modernization

Status: balanced direction selected; foundation, shell, and dashboard implementation prepared for draft review. Transactions and E-Transfers are also prepared for draft review. Remaining screens and release verification are pending.

## Objective and scope

Redesign the look and feel of existing MoneyPal screens. Preserve routes, capabilities, data fetching, validation, calculations, and submission flows. Keep React, Vite, Tailwind, shadcn, Clerk, and Convex. Backend, schema, dependency upgrades, and new features are outside this project. Record unrelated defects separately.

## Design direction

References: [Robinhood](https://robinhood.com/us/en/) and [Marathon](https://www.marathonthegame.com/).

Start with 70% Robinhood clarity and 30% Marathon graphic character in the authenticated app. Give the landing page more graphic freedom. The user selected B / Balanced on October 3, 2026. Use the balanced experiment as the reference for production implementation.

- Near-black and off-white surfaces with an electric lime brand accent.
- Large, readable financial figures and aligned digits.
- Space Grotesk headings and restrained monospace section labels.
- Flat panels, thin dividers, tight corners, minimal shadows.
- Selective section numbers and geometric details; ordinary financial language for actions.
- Separate brand accents from income, expense, transfer, warning, and error meanings.
- Preserve user-selected wallet colors and category identities.
- Use readable body text, clear focus states, and reduced-motion support.
- Create original MoneyPal graphics; use reference principles rather than their logos or assets.

## PR sequence

| PR | Branch | Scope | Completion criteria |
| --- | --- | --- | --- |
| 0 | docs/modernization-plan | This plan and PR template | Scope, sequence, and review process documented |
| 1 | design/modernization-experiment | Baseline captures and three isolated dashboard/wallet mockups: Robinhood-led, balanced, Marathon-led | Same sample content, desktop/mobile comparisons, preferred direction explicitly selected; production routes untouched |
| 2 | style/modernization-foundation | Theme tokens, typography, semantic colors, reusable presentation wrappers | Selected direction applied coherently in both themes; inspect all screens affected by global tokens |
| 3 | style/modernization-shell | Sidebar, header, shared page title/action presentation | Existing destinations and controls remain accessible at every breakpoint |
| 4 | style/modernization-dashboard | Balance/budget hierarchy, wallet cards, archived and empty states | All existing wallet and budget actions preserved; mobile action layout verified |
| 5 | style/modernization-transactions | Transaction list, filters, details, E-Transfers page | Filtering, details, sent/received distinctions, and existing transfer entry points preserved |
| 6 | style/modernization-dialogs | Wallet create/settings, deposit, withdrawal, transfer, E-Transfer dialogs | Same fields, validations, confirmation steps, pending states, and submissions; keyboard and mobile layouts verified |
| 7 | style/modernization-analytics | Existing charts, metrics, filters, legends, tooltips | All series, ranges, exports, and category drill-downs preserved; chart colors work in both themes |
| 8 | style/modernization-settings | Categories, preferences, onboarding | Existing choices, persisted preferences, and onboarding steps preserved |
| 9 | style/modernization-public-pages | Landing, sign-in/up presentation, error pages | Consistent brand; preview depicts existing functionality; auth redirects preserved |

Every implementation PR includes its own empty/loading/error states and visual verification. Avoid postponing quality work to a final cleanup PR. Split a row into smaller PRs if its diff becomes difficult to review.

## Branch and merge flow

1. Keep live main untouched. The integration branch is redesign/moneypal, created from main. Planning and implementation PRs target redesign/moneypal; only the final release PR targets main after the complete redesign is verified and the user explicitly approves release.
2. Open the design experiment as a draft. Review the three directions and record the chosen version here before production styling begins. Keep disposable previews separate from production routes.
3. Create each implementation branch from the latest redesign/moneypal after its prerequisite merges. Prefer sequential PRs over long dependency stacks. An early draft may target its prerequisite branch, then be retargeted to redesign/moneypal after that prerequisite merges.
4. Open a draft early, link this plan, state the scope and predecessor, and attach evidence before marking ready.
5. Review the visual result and preserved behavior. Resolve comments, then squash merge after explicit merge authorization. Do not auto-merge.
6. Update the tracker in the same PR with its URL and completed scope. No empty placeholder PRs for future work.

## Review evidence and checks

For visual PRs, compare before and after with the same sample data, viewport, and theme. Use synthetic or redacted financial data in published evidence. Capture 390px mobile, 768px tablet, and 1440px desktop views in light and dark themes; also check 320px for overflow. Include affected empty, loading, validation, and open-dialog states where relevant.

Check keyboard focus, accessible names, contrast, long wallet/category names, large amounts, and reduced motion. Preserve existing mobile navigation and financial action semantics. Screenshots should show the actual implementation, not just mockups.

Frontend checks: bun run lint, bun run typecheck, bun run build. Build and typecheck are separate scripts in this repository. Establish the baseline first and distinguish pre-existing failures from regressions. Application commands follow docs/bun-and-execution-policy.md: obtain explicit execution authorization before running them. No execution is needed for PR 0, which changes Markdown only.

Use the PR template for summary, before/after evidence, validation, and rollback impact. Shared theme and shell changes have broader impact than individual pages. Every PR should be independently revertible without database changes.

## Tracker

- [ ] PR 0: [Plan and review template (#2)](https://github.com/bakrmatlab/MoneyPal/pull/2) — targets redesign/moneypal
- [x] PR 1: [Design experiment (#3)](https://github.com/bakrmatlab/MoneyPal/pull/3); B / Balanced selected. Baseline comparisons now use actual components with synthetic fixtures; live authenticated verification remains pending.
- [ ] PR 2: [Foundation (#4)](https://github.com/bakrmatlab/MoneyPal/pull/4) — implemented, draft; targets planning branch
- [ ] PR 3: [Shell (#5)](https://github.com/bakrmatlab/MoneyPal/pull/5) — implemented, draft; targets foundation
- [ ] PR 4: [Dashboard and wallets (#6)](https://github.com/bakrmatlab/MoneyPal/pull/6) — implemented, draft; targets shell; [verification evidence](modernization-evidence/README.md)
- [ ] PR 5: [Transactions and E-Transfers (#7)](https://github.com/bakrmatlab/MoneyPal/pull/7) — implemented, draft; targets dashboard; [verification evidence](modernization-evidence/transactions.md)
- [ ] PR 6: [Dialogs (#8)](https://github.com/bakrmatlab/MoneyPal/pull/8) — implemented, draft; targets transactions; [verification evidence](modernization-evidence/dialogs.md)
- [ ] PR 7: [Analytics (#9)](https://github.com/bakrmatlab/MoneyPal/pull/9) — implemented, draft; targets dialogs; [verification evidence](modernization-evidence/analytics.md)
- [ ] PR 8: Settings and onboarding — implemented, draft pending; targets analytics; [verification evidence](modernization-evidence/settings.md)
- [ ] PR 9: Public, auth, and error pages

Selected design: B / Balanced, approved by the user on October 3, 2026.


## Selected direction implementation

Production branches start from the planning branch and exclude disposable prototype files. The first stack is foundation → shell → dashboard; each PR targets its predecessor until that predecessor merges into redesign/moneypal. Main remains untouched.

Keep the saved theme preference and system default. The lime brand token is separate from the primary text/action token: light mode uses readable olive primary text, while lime call-to-action surfaces carry dark text. Financial success, warning, and error colors stay semantic. Do not change currency formatting or calculations as part of visual work.
