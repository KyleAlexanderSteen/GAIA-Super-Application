# GAIA-Super-Application

The public-facing GAIA application. This repository owns the public product UI and its API client; shared runtime/business logic belongs in the approved GAIA service repositories.

## Phase A: local knowledge-query slice

This branch introduces a **local-only development prototype** to establish the application shell, a versioned request/response boundary, provenance-labelled fixture data, failure states, repeatable tests, and a workspace navigation foundation.

It is not a live GAIA runtime integration and is not a production deployment.

### Requirements

- Node.js 22 recommended (Node.js 20 or later supported).
- No package installation or third-party runtime dependency is required.

### Run locally

```sh
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

The test suite uses Node's built-in test runner and local HTTP requests. The CI workflow runs syntax checks and tests on pull requests and pushes to `main`.

### Design conventions

See [`docs/design-system.md`](docs/design-system.md) for the initial color, spacing, shape, accessibility, UI-state, and local API-adapter conventions. The token set is a foundation; visual/browser audits remain outstanding.

### What works in this phase

- Responsive, keyboard-friendly public application shell.
- Primary workspace navigation with Knowledge marked as available.
- Chat, Research, Projects, Agents / Automation, Memory, and Settings shown as planned and disabled until implemented.
- Query form with loading, success, no-match, and error feedback.
- Local deterministic search over a small fixture set.
- Source metadata: stable fixture ID, title, source type, and version.
- Versioned local request/response contract, isolated behind a browser-side local-demo adapter.
- Health endpoint and bounded request validation.
- Tests for query validation, provenance, no-match behavior, malformed JSON, unsupported methods, adapter request/response behavior, and the served UI.

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
