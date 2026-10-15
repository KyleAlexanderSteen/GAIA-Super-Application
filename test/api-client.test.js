import test from "node:test";
import assert from "node:assert/strict";
import { createLocalDemoApi } from "../public/api-client.js";

function response({ ok = true, status = 200, body, jsonError } = {}) {
  return {
    ok,
    status,
    async json() {
      if (jsonError) throw jsonError;
      return body;
    }
  };
}

test("local adapter sends the versioned query payload to the local endpoint", async () => {
  let request;
  const api = createLocalDemoApi(async (url, options) => {
    request = { url, options };
    return response({ body: { mode: "local-demo", contractVersion: "0.1.0", status: "no_match", sources: [] } });
  });

  const result = await api.query("  evidence provenance  ");
  assert.equal(request.url, "/api/query");
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers["content-type"], "application/json");
  assert.deepEqual(JSON.parse(request.options.body), { query: "  evidence provenance  " });
  assert.equal(result.mode, "local-demo");
  assert.equal(result.contractVersion, "0.1.0");
});

test("local adapter reports server errors without fabricating a result", async () => {
  const api = createLocalDemoApi(async () =>
    response({ ok: false, status: 400, body: { error: "Questions must be 500 characters or fewer." } })
  );
  await assert.rejects(api.query("x"), /500 characters or fewer/);
});

test("local adapter normalizes unreadable query responses", async () => {
  const api = createLocalDemoApi(async () => response({ jsonError: new Error("bad json") }));
  await assert.rejects(api.query("test"), /unreadable response/);
});

test("local adapter returns health without treating local-demo as a live connection", async () => {
  let requestedUrl;
  const api = createLocalDemoApi(async (url) => {
    requestedUrl = url;
    return response({ body: { status: "ok", mode: "local-demo", queryContractVersion: "0.1.0" } });
  });
  assert.deepEqual(await api.health(), {
    status: "ok",
    mode: "local-demo",
    queryContractVersion: "0.1.0"
  });
  assert.equal(requestedUrl, "/api/health");
});

test("local adapter rejects unavailable health endpoint", async () => {
  const api = createLocalDemoApi(async () => response({ ok: false, status: 503, body: {} }));
  await assert.rejects(api.health(), /Service unavailable/);
});
