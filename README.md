# GAIA-Super-Application

The public-facing GAIA application. This repository owns the public product UI and its API client; shared runtime/business logic belongs in the approved GAIA service repositories.

## Phase A: local knowledge-query slice

This is a **local-only development prototype** that establishes the application shell, a versioned request/response boundary, provenance-labelled fixture data, failure states, repeatable tests, and a workspace navigation foundation.

It is not a live GAIA runtime integration and is not a production deployment.

### Requirements

- Node.js 22 recommended (Node.js 20 or later supported).
- No runtime dependency is needed to run the server. Development verification uses Playwright for Chromium browser tests.

### Run locally

```sh
npm install
npx playwright install chromium
npm start
```

Open http://127.0.0.1:3000.

For automatic server restart while editing:

```sh
npm run dev
```

### Verify

```sh
npm test
npm run check
```

The test suite uses Node's built-in test runner for API/server checks and Playwright with Chromium for real-browser interaction smoke tests. CI installs development dependencies and Chromium, then runs syntax checks, unit/HTTP tests, and browser tests on pull requests and pushes to `main`.

Browser checks currently cover keyboard skip-link behavior, a successful local-fixture query with provenance, blank-query handling, navigation labels, and narrow-viewport horizontal overflow. These are focused regression checks—not a full WCAG audit, assistive-technology certification, or cross-browser test matrix.

### Design conventions

See [`docs/design-system.md`](docs/design-system.md) for the initial color, spacing, shape, accessibility, UI-state, API-adapter, and browser-verification conventions. The token set is a foundation; a full visual/accessibility audit remains outstanding.

### What works in this phase

- Responsive, keyboard-friendly public application shell.
- Primary workspace navigation with Knowledge marked as available.
- Chat, Research, Projects, Agents / Automation, Memory, and Settings shown as planned and disabled until implemented.
- Query form with loading, success, no-match, and error feedback.
- Local deterministic search over a small fixture set.
- Source metadata: stable fixture ID, title, source type, and version.
- Versioned local request/response contract, isolated behind a browser-side local-demo adapter.
- Health endpoint and bounded request validation.
- Automated server/API and Chromium browser tests for key interactions and selected accessibility/responsive behaviors.

### Explicit limitations

- The interface says **Local prototype** and responses identify themselves as `local-demo`.
- No live AI provider, API Gateway, authentication, personal memory, external tool, or privileged operation is connected.
- The local fixture data is demonstration material, not authoritative GAIA knowledge.
- The local query endpoint is not an authenticated production API. Do not expose this development server to the public internet.
- Navigation for unimplemented workspaces is intentionally disabled; no live functionality is implied.
- The Content Security Policy and input validation are prototype hardening, not a substitute for the approved GAIA security model.
- No production readiness or integration verification is claimed by this scaffold.

### Architecture decisions still required

Before connecting real services, reconcile the legacy `GAIA-3.0` Rust workspace with the intended multi-repository architecture and approve the repository boundaries and contracts tracked in:

- [GAIA-Documentation #163 — application boundaries](https://github.com/KyleAlexanderSteen/GAIA-Documentation/issues/163)
- [GAIA-Documentation #167 — monorepo/multi-repo ADR](https://github.com/KyleAlexanderSteen/GAIA-Documentation/issues/167)
- [GAIA-Documentation #172 — dependency and contract manifest](https://github.com/KyleAlexanderSteen/GAIA-Documentation/issues/172)
- [GAIA-Documentation #212 — requirements traceability](https://github.com/KyleAlexanderSteen/GAIA-Documentation/issues/212)

Never add provider keys, owner credentials, private Master Application code, or privileged control-plane routes to this public repository.
