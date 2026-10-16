# AI provider registry and Explorer — initial proposal

**Status:** Implemented app-local catalogue foundation; not an approved cross-repository contract. The catalogue is a research preview, not a live provider integration.

## Integrity rules

- Registry records distinguish a provider ecosystem from a model, inference/deployment service, lifecycle tool, and specialized system.
- Connection/configuration state is separate from evidence verification.
- Verification status is one of `unverified`, `documented`, or `independently_tested`. A passing unit test does not verify a vendor capability claim.
- Unknown information stays unknown. Model versions, context limits, prices, latency, hardware requirements, license terms, and availability are not asserted as verified.
- Every entry must include at least one evidence record with an HTTPS source URL, a valid ISO calendar review date or explicit `null`, and a non-empty statement of what the source establishes.
- Seed entries remain `unconfigured` and `unverified`. Current source links are research starting points and do not establish every product-specific capability.
- The mock adapter performs no network calls, loads no secrets, and must never be presented as a live provider integration.

## Entry fields

- `id`, `name`, `providerId`: stable identity and display labels.
- `kind`: `provider`, `model`, `inference_service`, `lifecycle_tool`, or `specialized_system`.
- `capabilities`, `modalities`, `deploymentModes`: descriptive filter tags, not availability guarantees.
- `connectionState`: `unconfigured`, `available`, or `unavailable`.
- `verificationStatus`: `unverified`, `documented`, or `independently_tested`.
- `limitations`: explicit caveats that remain visible to consumers.
- `evidence`: source URL, review date, and a bounded statement of what that source establishes.

## Current implementation

- Registry module: `src/provider-registry.js`.
- API: read-only `GET /api/v1/providers`, schema version 1, served from static local configuration.
- UI: an AI Systems Explorer preview with category and capability filters, evidence links, limitations, and explicit connection/verification states.
- Tests: registry validation/filtering, API contract and method behavior, and Chromium browser interaction/responsive smoke coverage.
- The mock adapter demonstrates request validation and the unconfigured boundary without contacting a provider or handling credentials.

## Verification and next gates

1. Confirm the capability and evidence vocabulary against the canonical `GAIA-Standards`, `GAIA-Ontology`, and `GAIA-Architecture` repositories before treating this as a shared contract.
2. Review each seed entry against product-specific official documentation. Record the date reviewed and exactly what each source supports; otherwise leave claims unverified or remove unsupported tags.
3. Expand validation tests for malformed evidence metadata and preserve explicit unknowns.
4. Continue accessibility and browser checks for empty results, keyboard interaction, narrow viewports, and truthful unavailable states.
5. Any real adapter must remain server-side and receive a separate security review for secrets, timeouts, error redaction, permissions, and provider-specific tests.
6. Do not implement autonomous provider routing until task fit, evaluation, privacy, permissions, cost, latency, and deployment constraints have approved contracts.

This increment provides a local catalogue preview only. It does not establish live AI connectivity, production readiness, or an approved cross-repository schema.
