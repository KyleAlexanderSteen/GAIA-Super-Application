import test from "node:test";
import assert from "node:assert/strict";
import { validateChangeMetadata } from "../src/integrity-gate.js";

const validMetadata = {
  change_type: "feature",
  risk_level: "medium",
  evidence: ["Unit tests cover valid and invalid input."],
  assumptions: [],
  repositories_affected: ["KyleAlexanderSteen/GAIA-Super-Application"]
};

test("accepts complete metadata and normalizes supported enum values", () => {
  const result = validateChangeMetadata({
    ...validMetadata,
    change_type: "  FEATURE ",
    risk_level: " Medium ",
    evidence: ["  Unit tests pass locally.  "],
    repositories_affected: ["  KyleAlexanderSteen/GAIA-Super-Application  "]
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.value.change_type, "feature");
  assert.equal(result.value.risk_level, "medium");
  assert.deepEqual(result.value.evidence, ["Unit tests pass locally."]);
  assert.deepEqual(result.value.assumptions, []);
});

test("rejects null, arrays, and other non-object inputs", () => {
  for (const input of [null, [], "metadata", 42]) {
    const result = validateChangeMetadata(input);
    assert.equal(result.ok, false);
    assert.match(result.errors[0], /JSON object/);
  }
});

test("rejects unsupported change types and risk levels", () => {
  const result = validateChangeMetadata({
    ...validMetadata,
    change_type: "magic",
    risk_level: "unknown"
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.startsWith("change_type")));
  assert.ok(result.errors.some((error) => error.startsWith("risk_level")));
});

test("requires non-empty evidence and affected-repository lists", () => {
  const result = validateChangeMetadata({
    ...validMetadata,
    evidence: [],
    repositories_affected: []
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.startsWith("evidence")));
  assert.ok(result.errors.some((error) => error.startsWith("repositories_affected")));
});

test("rejects blank entries and non-string array values", () => {
  const result = validateChangeMetadata({
    ...validMetadata,
    evidence: ["valid evidence", "   "],
    assumptions: [false]
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.startsWith("evidence")));
  assert.ok(result.errors.some((error) => error.startsWith("assumptions")));
});

test("does not mutate the caller's metadata", () => {
  const input = {
    ...validMetadata,
    evidence: ["  evidence  "],
    repositories_affected: ["  repo/name  "]
  };
  const before = structuredClone(input);

  validateChangeMetadata(input);

  assert.deepEqual(input, before);
});
