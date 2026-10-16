# GAIA-Super-Application

The public-facing GAIA application. This repository owns the public product UI and its API client; shared runtime/business logic belongs in the approved GAIA service repositories.

## Phase A: local knowledge and AI catalogue slices

This is a **local-only development prototype** that establishes the application shell, versioned request/response boundaries, provenance-labelled fixture data, failure states, repeatable tests, and workspace navigation.

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

Browser checks cover keyboard skip-link behavior, a successful local-fixture query with provenance, blank-query handling, workspace navigation, the AI Systems Explorer catalogue and category/capability filters, and narrow-viewport horizontal overflow. These are focused regression checks—not a full WCAG audit, assistive-technology certification, or cross-browser test matrix.

### What works in this phase

- Responsive, keyboard-friendly public application shell.
- Primary navigation to the Knowledge workspace and an AI Systems catalogue preview.
- Chat, Research, Projects, Agents / Automation, Memory, and Settings shown as planned and disabled until implemented.
- Query form with loading, success, no-match, and error feedback.
- Local deterministic search over a small fixture set, with source metadata.
- Versioned local query contract behind a browser-side adapter.
- Read-only versioned `GET /api/v1/providers` endpoint for the seed catalogue.
- Registry validation and capability/category filtering; provider, model, inference service, lifecycle tool, and specialized system are distinct categories.
- Explicit unconfigured/unverified status, limitations, and evidence starting points for every seed entry.
- Mock adapter contract that makes no network calls and does not handle credentials.
- Automated server/API, registry, and Chromium browser tests for selected behaviors.

### AI catalogue status and limitations

The AI Systems Explorer is a **catalogue preview**, not a provider integration. Initial entries include the NVIDIA ecosystem and illustrative records for Nemotron, NIM, NeMo, Earth-2, and Cosmos, plus an OpenAI ecosystem entry. Provider-specific capabilities are deliberately marked **unverified** and every entry is **unconfigured**. Evidence links are starting points, not proof of every listed claim; product-specific source review and review dates remain outstanding.

No live AI provider, API Gateway, authentication, personal memory, external tool, or privileged operation is connected. No model versions, prices, latency, context limits, hardware requirements, or license terms are asserted as verified. The local fixture data is demonstration material, not authoritative GAIA knowledge.

The local endpoints are not authenticated production APIs. Do not expose this development server to the public internet. The Content Security Policy and input validation are prototype hardening, not a substitute for the approved GAIA security model. No production readiness or integration verification is claimed.

### Architecture decisions still required

Before connecting real services, reconcile the legacy `GAIA-3.0` Rust workspace with the intended multi-repository architecture and approve the repository boundaries and contracts tracked in:

- [GAIA-Documentation #163 — application boundaries](https://github.com/KyleAlexanderSteen/GAIA-Documentation/issues/163)
- [GAIA-Documentation #167 — monorepo/multi-repo ADR](https://github.com/KyleAlexanderSteen/GAIA-Documentation/issues/167)
- [GAIA-Documentation #172 — dependency and contract manifest](https://github.com/KyleAlexanderSteen/GAIA-Documentation/issues/172)
- [GAIA-Documentation #212 — requirements traceability](https://github.com/KyleAlexanderSteen/GAIA-Documentation/issues/212)

The registry is an initial app-local proposal, not yet an approved cross-repository contract. Compare its capability/evidence vocabulary with `GAIA-Standards`, `GAIA-Ontology`, and `GAIA-Architecture` before expanding it. See [the registry design and verification gates](docs/ai-provider-registry.md).

Never add provider keys, owner credentials, private Master Application code, or privileged control-plane routes to this public repository.
