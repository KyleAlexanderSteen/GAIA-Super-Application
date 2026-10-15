# GAIA Integrity Gate — MVP

## Purpose

The Integrity Gate is a small, deterministic metadata validator that checks whether a proposed change has the minimum information required to begin review. It operationalizes the existing GAIA workflow fields:

- `change_type`
- `risk_level`
- `evidence`
- `assumptions`
- `repositories_affected`

## Supported values

- `change_type`: `feature`, `bugfix`, `refactor`, `documentation`, `security`, `test`, or `infrastructure`
- `risk_level`: `low`, `medium`, `high`, or `critical`
- `evidence`: one or more non-empty strings describing relevant evidence
- `assumptions`: an array of strings; an empty array is allowed when no assumptions are being made
- `repositories_affected`: one or more non-empty repository identifiers

## Example

```js
import { validateChangeMetadata } from "./src/integrity-gate.js";

const result = validateChangeMetadata({
  change_type: "feature",
  risk_level: "medium",
  evidence: ["Unit tests cover accepted and rejected inputs."],
  assumptions: [],
  repositories_affected: ["KyleAlexanderSteen/GAIA-Super-Application"]
});

if (!result.ok) {
  console.error("Review cannot begin:", result.errors);
} else {
  console.log("Metadata is structurally complete:", result.value);
}
```

## Boundaries and limitations

- A passing result means only that the metadata is structurally complete.
- The validator does not establish that evidence is accurate, sufficient, or independently reproducible.
- It does not determine whether a change is safe, authorize a merge, enforce repository permissions, or replace security review.
- This MVP is a reusable module with automated unit tests. It is not yet wired to parse pull-request bodies or block merges; that integration should follow after the owner reviews the schema and allowed values.
- No runtime API, public UI behavior, repository visibility, or deployment behavior is changed.
