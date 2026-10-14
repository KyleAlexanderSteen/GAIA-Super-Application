import test from "node:test";
import assert from "node:assert/strict";
import { queryLocalKnowledge } from "../src/knowledge.js";
import { validateQueryRequest, QUERY_CONTRACT_VERSION } from "../src/contract.js";

test("query contract has an explicit version", () => {
  assert.equal(QUERY_CONTRACT_VERSION, "0.1.0");
});

test("validates a non-empty bounded query", () => {
  assert.deepEqual(validateQueryRequest({ query: "  evidence status  " }), {
    ok: true,
    value: { query: "evidence status" }
  });
  assert.equal(validateQueryRequest({ query: " ".repeat(4) }).ok, false);
  assert.equal(validateQueryRequest({ query: "x".repeat(501) }).ok, false);
  assert.equal(validateQueryRequest({ query: 42 }).ok, false);
  assert.equal(validateQueryRequest(null).ok, false);
});

test("returns deterministic matching knowledge with provenance", () => {
  const result = queryLocalKnowledge("evidence implementation status");
  assert.equal(result.status, "matched");
  assert.ok(result.answer.includes("implemented and verified"));
  assert.ok(result.sources.length > 0);
  assert.ok(result.sources.every((source) =>
    source.id && source.source && source.sourceType === "local_test_fixture" && source.version
  ));
});

test("does not invent a response when there is no match", () => {
  const result = queryLocalKnowledge("volcanoes on mars");
  assert.equal(result.status, "no_match");
  assert.deepEqual(result.sources, []);
  assert.ok(result.answer.includes("not a live GAIA model response"));
});

test("punctuation-only queries do not match", () => {
  assert.equal(queryLocalKnowledge("?!...").status, "no_match");
});
