# AI provider registry — initial contract

**Status:** Implemented foundation; not yet an approved cross-repository contract. The Explorer UI and a real provider integration are not implemented in this change.

## Integrity rules

- Registry records distinguish a provider ecosystem from a model, inference/deployment service, lifecycle tool, and specialized system.
- The connection state describes actual integration/configuration state. It is not the same as evidence verification.
- Verification status is one of unverified, documented, or independently_tested. Do not infer a higher status from vendor claims or a passing unit test.
- Unknown information must stay unknown. Do not fill in model versions, context limits, prices, latency, hardware, license terms, or availability without evidence.
- Each entry has evidence records containing an HTTPS source URL, a retrieval/review date or explicit null, and a statement of what the source establishes.
- The initial records are seed examples. Their provider-specific details are unverified, and every entry is marked unconfigured. The listed source links are evidence starting points, not proof of all listed capabilities.
- The mock adapter performs no network calls, loads no secrets, and must never be presented as a live provider integration.

## Entry fields

The initial JavaScript module documents the typed shape using JSDoc:

- id, name, providerId: stable identity and display labels.
- kind: provider, model, inference_service, lifecycle_tool, or specialized_system.
- capabilities, modalities, deploymentModes: filterable descriptive tags, not availability guarantees.
- connectionState: unconfigured, available, or unavailable.
- verificationStatus: unverified, documented, or independently_tested.
- limitations: explicit caveats that must remain visible to consumers.
- evidence: sourceUrl, retrievedAt, and establishes.

## Current implementation

- Module: src/provider-registry.js
- Tests: test/provider-registry.test.js
- Registry validation and capability/category/status filtering are deterministic and local.
- A mock adapter demonstrates the unconfigured/error boundary without exposing credentials or making a provider call.
- npm run check includes syntax validation for the module and the complete Node test suite.

## Next gates

1. Check the existing GAIA-Standards, GAIA-Ontology, and GAIA-Architecture repositories for canonical capability/evidence terms before finalizing this schema.
2. Verify each seeded entry against product-specific official documentation; record retrieval dates and precisely what each source supports.
3. Add the accessible AI Systems Explorer UI and capability filters.
4. Add UI tests for empty results, narrow viewports, keyboard operation, and truthful unconfigured/unverified states.
5. Keep any real adapter server-side, with explicit secret handling, timeout/error redaction, and provider-specific tests.
6. Do not implement autonomous routing until task-fit, evaluation, privacy, permissions, cost, latency, and deployment constraints have approved contracts.

This module is an initial build increment, not evidence of live AI connectivity or production readiness.
