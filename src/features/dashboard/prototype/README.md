# Dashboard design experiment

Throwaway, read-only dashboard study. No auth, backend, external fonts, persistence, or financial mutations. All values are synthetic and identical between variants. This standalone preview is intentionally separate from production routes because the checkout has no Clerk/Convex credentials and the plan calls for an isolated comparison. Inline CSS is confined to this disposable HTML; production implementation will use the existing Tailwind/shadcn system.

Open index.html directly in a browser, or run `bun run design:preview` from the repository root and open http://localhost:4174/index.html?variant=b.

- `?variant=a`: Robinhood-led, open balance overview and soft wallet cards.
- `?variant=b`: balanced, dark divided overview with technical labels and wallet panels.
- `?variant=c`: Marathon-led, horizontal navigation, lime balance block, ledger-style wallets.
- `&theme=light` or `&theme=dark`: inspect both themes.

Use the floating controls or left/right arrows to cycle. The theme toggle is interactive; other controls are presentation only. Refresh preserves the variant and theme in the URL. Readable native font fallbacks keep this offline and dependency-free.

Review the balance hierarchy, navigation, budget presentation, wallet density, and mobile layout. Record a selected direction in docs/modernization-plan.md after user feedback. The prototype will remain on its experiment branch and will not be shipped with the final release. It is not a substitute for baseline screenshots or later behavioral verification of the real app.
