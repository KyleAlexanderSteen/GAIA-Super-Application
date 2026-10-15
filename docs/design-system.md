# Public application design system (Phase A)

This is the initial design-system contract for `GAIA-Super-Application`. It is intentionally framework-free and implemented in `public/styles.css` so the current Node.js application can use it without adding dependencies.

## Principles

- **Truthful state:** distinguish available, planned, loading, unavailable, and unverified. Never style an unverified service as healthy.
- **Accessible by default:** semantic HTML, visible keyboard focus, explicit form labels, status announcements, and reduced-motion support.
- **Responsive by default:** flexible widths, wrapping, and horizontally scrollable workspace navigation on narrow screens.
- **Reuse before duplication:** use shared tokens and component classes rather than one-off colors, radii, or focus styles.
- **Public/private boundary:** public UI must not expose owner-only controls, credentials, or private Master Application implementation.

## Token groups

The `:root` tokens in `public/styles.css` define:

- **Color:** ink, muted text, paper, surfaces, borders, green action/active states, amber caution states, red error states, and blue loading states.
- **Spacing:** `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-6`, and `--space-8`.
- **Shape and elevation:** `--radius-control`, `--radius-field`, `--radius-card`, and `--shadow-card`.
- **Accessibility:** `--focus-ring` for visible keyboard focus.

These are the initial vocabulary, not a claim that every component has already migrated to tokens.

## State patterns

- **Loading:** use a clear text status, disable duplicate submission while a request is in flight, and set `aria-busy="true"` on the relevant region.
- **Success:** report only the result actually returned. Local fixture matches must explicitly remain identified as local-demo results.
- **Empty/no match:** explain that no match was found; do not fabricate an answer.
- **Error/unavailable:** show a plain-language recovery message and use the error color token.
- **Unverified:** use the caution treatment; do not imply a health check proves production readiness.
- **Planned:** unavailable workspaces remain disabled and visibly labelled until their behavior exists.

## API adapter boundary

The browser UI calls `public/api-client.js` rather than issuing HTTP requests directly from the form and health-status handlers. Its `createLocalDemoApi` interface isolates the current local-demo endpoints and normalizes unreadable/error responses for the UI. This is **not** the approved GAIA API Gateway client, does not authenticate requests, and does not connect a live provider. Replace or adapt this boundary only after the canonical ownership and contract decisions are approved.

## Adding a workspace

1. Confirm the feature's owning repository and approved API/event contract before integrating backend behavior.
2. Add semantic navigation and a route only when the route has real behavior.
3. Reuse the shared typography, spacing, form, card, focus, and state conventions.
4. Add tests for keyboard access, responsive layout assumptions, empty/loading/error states, and the route's behavior.
5. Update the README to state what is implemented and what remains a prototype or planned.
6. Never add Master Application privileges or secrets to this public repository.

## Verification baseline

Run `npm test` and `npm run check` with Node.js 20 or later. The current suite uses Node's built-in test runner; no third-party UI framework or component-test package is installed. Browser-level visual and accessibility audits remain a follow-up, not an already completed check.
