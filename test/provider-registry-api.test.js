import test from "node:test";
import assert from "node:assert/strict";
import { createAppServer } from "../server.js";

test("versioned provider catalogue exposes only validated, unconfigured seed records", async (t) => {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve, reject) =>
    server.close((error) => error ? reject(error) : resolve())
  ));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  const response = await fetch(`${base}/api/v1/providers`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  const body = await response.json();
  assert.equal(body.schemaVersion, 1);
  assert.deepEqual(body.source, {
    id: "public-app-local-seed-registry",
    kind: "static-configuration"
  });
  assert.ok(body.providers.length >= 5);
  for (const entry of body.providers) {
    assert.equal(entry.connectionState, "unconfigured");
    assert.equal(entry.verificationStatus, "unverified");
    assert.ok(entry.evidence.length > 0);
    assert.ok(entry.limitations.length > 0);
  }
  assert.equal(JSON.stringify(body).includes("api_key"), false);
});

test("provider catalogue endpoint is read-only", async (t) => {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve, reject) =>
    server.close((error) => error ? reject(error) : resolve())
  ));
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/providers`, { method: "POST" });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});
