# Public, auth, and error-page verification

October 3, 2026. Actual landing/error components rendered in the temporary harness. Auth state is synthetic; no live Clerk login performed.

- [Landing mobile light](landing-mobile-light.jpg)
- [Landing desktop dark](landing-desktop-dark.jpg)
- [404 mobile light](error-404-mobile-light.jpg)

Before: blurred gradients, rounded floating header, terminal-style illustration, authenticated header framing Clerk pages, small error actions. After: sharper flat panels, lime actions, clear headline, explicitly illustrative wallet overview, dedicated public auth frame, readable error codes and larger actions.

Build and changed-file lint pass. Type checking retains the same four onboarding errors; the auth appearance object introduces no new type errors. React review confirms unchanged authentication redirect URLs, landing auth redirect, routes, error back/home handlers, and Clerk components. No new features or dependency changes.

Browser checks covered mobile landing at 390px, no document horizontal overflow at 320px, existing signup link destinations, light/dark presentation, 404 display and Go Back navigation. Authentication UI was not simulated for evidence: live Clerk widget rendering, overflow, sign-in/up completion and redirect verification remain release gates. All error pages share reviewed presentation changes; remaining individual error routes and full theme/breakpoint checks remain pending.
