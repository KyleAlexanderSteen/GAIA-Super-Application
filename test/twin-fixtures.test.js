import test from "node:test";
import assert from "node:assert/strict";
import { earthFixture, cosmosFixture, canAct } from "../src/twin-fixtures.js";

const fields = ["intended", "observed", "protected", "pays", "epistemicStatus"];

test("earth fixture returns all four fields and refuses live ingest", () => {
  for (const field of fields) assert.ok(earthFixture[field], field);
  assert.equal(earthFixture.observed, "refused-live-ingest");
  assert.equal(canAct(earthFixture), false);
});

test("cosmos fixture is unknown and cannot act", () => {
  for (const field of fields) assert.ok(field in cosmosFixture);
  assert.equal(cosmosFixture.epistemicStatus, "unknown");
  assert.equal(canAct(cosmosFixture), false);
});
