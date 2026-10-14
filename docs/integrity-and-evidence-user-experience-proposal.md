# Integrity and Evidence — Public Application UX Proposal

**Status:** Proposed — documentation only; not approved as normative or implemented.

**Canonical proposal:** https://github.com/KyleAlexanderSteen/GAIA-Documentation/blob/docs/alignment-attunement-self-improvement/GAIA-Documentation/GAIA-Universal-Principles-Integrity-Knowledge-and-Flourishing.md

This document translates the canonical GAIA-Documentation proposal into repository-specific requirements for review. It does not override approved decisions, create implementation evidence, authorize new capabilities, or change runtime behavior. Reconcile it with existing contracts and issues before adoption.

## User-facing expectations

The public application should help users distinguish what GAIA actually did from what it suggests or intends to do. When relevant to the response and available evidence, the interface should present:

- Source/provenance references and source freshness or version.
- A clear distinction between evidence, inference, estimate, and hypothesis.
- Material uncertainty, missing evidence, disagreement, and known limitations.
- Accurate operation status: proposed, running, completed, failed, or not performed.
- Clear notice when an answer is based on local demo fixtures rather than a live GAIA service.
- Correction notices when a prior material claim is revised.
- Appropriate next verification steps for consequential claims.

## UX safeguards

- Never display a verification badge merely because the model sounds confident.
- Do not imply live browsing, service execution, personal memory, or production integration unless it actually occurred and can be evidenced.
- Do not expose internal secrets, private evidence, or owner-only Master controls in public responses.
- Avoid overloading ordinary low-risk responses with excessive metadata; disclose proportionately to consequence and uncertainty.
- Make uncertainty understandable without falsely suggesting that every claim is equally uncertain.

## Implementation gate

The current local-only prototype and its fixture data must remain clearly labeled. Before any real service integration, define response contracts, source permissions, privacy rules, accessible UI behavior, and tests for missing provenance, conflicting sources, stale evidence, failed actions, and corrections. This proposal changes no runtime behavior.