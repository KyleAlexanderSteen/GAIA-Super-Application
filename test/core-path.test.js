import test from "node:test";
import assert from "node:assert/strict";
import { runAction } from "../src/core-path.js";

const good = {
  approval: { allow: true, who: "human:1", what: "read", when: "2026-10-17", scope: "read" },
  consent: { granted: true, scope: "read" },
  provenance: { source: "fixture", version: "1", evidence: "unverified" },
  boundary: { principal: "human:1", allowed: ["read"] },
  requested: ["read"],
  requiredScope: "read"
};

test("valid request executes and audits", () => {
  let called = false;
  const out = runAction(good, () => {
    called = true;
    return { value: "ok" };
  });
  assert.equal(called, true);
  assert.equal(out.ok, true);
  assert.equal(out.audit.observed, "executed");
  assert.deepEqual(out.audit.steps, ["approval", "consent", "provenance", "authority"]);
  assert.equal(out.audit.epistemicStatus, "unverified");
});

test("missing approval blocks before side effect", () => {
  let called = false;
  const out = runAction({ ...good, approval: null }, () => { called = true; });
  assert.equal(called, false);
  assert.equal(out.ok, false);
  assert.equal(out.audit.blockedAt, "approval");
  assert.equal(out.audit.observed, "refused");
});

test("missing consent blocks before side effect", () => {
  let called = false;
  const out = runAction({ ...good, consent: null }, () => { called = true; });
  assert.equal(called, false);
  assert.equal(out.audit.blockedAt, "consent");
});

test("missing provenance blocks before side effect", () => {
  let called = false;
  const out = runAction({ ...good, provenance: null }, () => { called = true; });
  assert.equal(called, false);
  assert.equal(out.audit.blockedAt, "provenance");
});

test("unauthorised scope blocks and does not expand", () => {
  let called = false;
  const out = runAction({ ...good, requested: ["write"] }, () => { called = true; });
  assert.equal(called, false);
  assert.equal(out.audit.blockedAt, "authority");
  assert.deepEqual(good.boundary.allowed, ["read"]);
});
