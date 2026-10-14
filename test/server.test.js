import test from "node:test";
import assert from "node:assert/strict";
import { createAppServer } from "../server.js";

async function withServer(run) {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("health endpoint explicitly reports local-demo mode", async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.mode, "local-demo");
    assert.equal(body.queryContractVersion, "0.1.0");
  });
});

test("query endpoint returns matching fixture and provenance", async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/query`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "knowledge provenance" })
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.mode, "local-demo");
    assert.equal(body.status, "matched");
    assert.ok(body.sources[0].id);
    assert.equal(body.sources[0].sourceType, "local_test_fixture");
  });
});

test("rejects empty and malformed JSON requests", async () => {
  await withServer(async (base) => {
    const empty = await fetch(`${base}/api/query`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: " " })
    });
    assert.equal(empty.status, 400);
    assert.ok((await empty.json()).error);

    const malformed = await fetch(`${base}/api/query`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json"
    });
    assert.equal(malformed.status, 400);
  });
});

test("returns an explicit no-match result instead of fabricating an answer", async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/query`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "interstellar time travel" })
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.status, "no_match");
    assert.deepEqual(body.sources, []);
  });
});

test("does not accept unsupported methods on query route", async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/query`, { method: "PUT" });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "GET, HEAD, POST");
  });
});

test("HEAD static response has GET headers and no response body", async () => {
  await withServer(async (base) => {
    const get = await fetch(`${base}/index.html`);
    const getBody = await get.text();
    const head = await fetch(`${base}/index.html`, { method: "HEAD" });
    const headBody = await head.text();

    assert.equal(get.status, 200);
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("content-type"), get.headers.get("content-type"));
    assert.equal(head.headers.get("content-length"), String(Buffer.byteLength(getBody)));
    assert.equal(headBody, "");
  });
});

test("serves the accessible application shell", async () => {
  await withServer(async (base) => {
    const response = await fetch(base);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /Prototype mode/);
  });
});
