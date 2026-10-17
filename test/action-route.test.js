import test from "node:test";
import assert from "node:assert/strict";
import { createAppServer } from "../server.js";

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address()));
  });
}

async function post(port, body) {
  const response = await fetch(`http://127.0.0.1:${port}/api/v1/actions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return { status: response.status, body: await response.json() };
}

const good = {
  approval: { allow: true, who: "human:1", what: "read", when: "2026-10-17", scope: "read" },
  consent: { granted: true, scope: "read" },
  provenance: { source: "fixture", version: "1", evidence: "unverified" },
  boundary: { principal: "human:1", allowed: ["read"] },
  requested: ["read"],
  requiredScope: "read"
};

test("local app serves a permitted action and an audit", async () => {
  const server = createAppServer();
  const address = await listen(server);
  try {
    const health = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    assert.equal(health.status, 200);
    const out = await post(address.port, good);
    assert.equal(out.status, 200);
    assert.equal(out.body.ok, true);
    assert.equal(out.body.audit.observed, "executed");
    assert.equal(out.body.audit.epistemicStatus, "unverified");
    assert.ok(out.body.audit.steps.includes("authority"));
  } finally {
    server.close();
  }
});

test("missing approval is refused by the running app", async () => {
  const server = createAppServer();
  const address = await listen(server);
  try {
    const out = await post(address.port, { ...good, approval: null });
    assert.equal(out.status, 403);
    assert.equal(out.body.ok, false);
    assert.equal(out.body.audit.blockedAt, "approval");
    assert.equal(out.body.audit.observed, "refused");
  } finally {
    server.close();
  }
});

test("unauthorised scope is refused and does not expand", async () => {
  const server = createAppServer();
  const address = await listen(server);
  try {
    const out = await post(address.port, { ...good, requested: ["write"] });
    assert.equal(out.status, 403);
    assert.equal(out.body.audit.blockedAt, "authority");
    assert.deepEqual(good.boundary.allowed, ["read"]);
  } finally {
    server.close();
  }
});
