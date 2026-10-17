import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { validateQueryRequest, QUERY_CONTRACT_VERSION } from "./src/contract.js";
import { knowledgeFixtures, queryLocalKnowledge } from "./src/knowledge.js";
import { INITIAL_REGISTRY, validateRegistryEntry } from "./src/provider-registry.js";
import { handleAction } from "./src/action-route.js";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = join(ROOT, "public");
const MAX_BODY_BYTES = 8 * 1024;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += bytes.byteLength;
    if (totalBytes > MAX_BODY_BYTES) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(bytes);
  }
  const body = Buffer.concat(chunks, totalBytes).toString("utf8");
  try {
    return JSON.parse(body);
  } catch {
    const error = new Error("Request body must contain valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

async function serveStatic(pathname, method, response) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const normalized = normalize(requested).replace(/^([.][.][/\\])+/, "");
  const filePath = join(PUBLIC_DIR, normalized);
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + sep)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  try {
    const data = await readFile(filePath);
    response.writeHead(200, {
      "content-type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
      "content-length": data.byteLength,
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'",
      "referrer-policy": "no-referrer",
      "cache-control": "no-store"
    });
    response.end(method === "HEAD" ? undefined : data);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

export function createAppServer() {
  return createHttpServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");

    if (url.pathname === "/api/health") {
      if (request.method !== "GET") {
        response.writeHead(405, { allow: "GET" });
        response.end("Method not allowed");
        return;
      }
      sendJson(response, 200, { status: "ok", mode: "local-demo", queryContractVersion: QUERY_CONTRACT_VERSION });
      return;
    }

    if (url.pathname === "/api/v1/actions") {
      if (request.method !== "POST") {
        response.writeHead(405, { allow: "POST" });
        response.end("Method not allowed");
        return;
      }
      try {
        const contentType = request.headers["content-type"]?.split(";")[0].trim().toLowerCase();
        if (contentType !== "application/json") {
          sendJson(response, 415, { error: "Content-Type must be application/json." });
          return;
        }
        const raw = await readJsonBody(request);
        const outcome = handleAction(raw);
        sendJson(response, outcome.status, outcome.body);
      } catch (error) {
        sendJson(response, error.statusCode ?? 500, {
          error: error.statusCode ? error.message : "The local action path encountered an unexpected error."
        });
      }
      return;
    }

    if (url.pathname === "/api/v1/providers") {
      if (request.method !== "GET") {
        response.writeHead(405, { allow: "GET" });
        response.end("Method not allowed");
        return;
      }
      const valid = INITIAL_REGISTRY.every((entry) => validateRegistryEntry(entry).ok);
      if (!valid) {
        sendJson(response, 500, { error: "The local provider catalogue is unavailable." });
        return;
      }
      sendJson(response, 200, {
        schemaVersion: 1,
        source: { id: "public-app-local-seed-registry", kind: "static-configuration" },
        providers: INITIAL_REGISTRY
      });
      return;
    }

    if (url.pathname === "/api/v1/knowledge") {
      if (request.method !== "GET") {
        response.writeHead(405, { allow: "GET" });
        response.end("Method not allowed");
        return;
      }
      sendJson(response, 200, {
        schemaVersion: 1,
        source: { id: "public-app-local-demo-fixtures", kind: "local_test_fixture" },
        records: knowledgeFixtures.map(({ id, title, text, source, sourceType, version }) => ({
          id, title, text, provenance: { source, sourceType, version }
        }))
      });
      return;
    }

    if (url.pathname === "/api/query") {
      if (request.method !== "POST") {
        response.writeHead(405, { allow: "POST" });
        response.end("Method not allowed");
        return;
      }
      try {
        const contentType = request.headers["content-type"]?.split(";")[0].trim().toLowerCase();
        if (contentType !== "application/json") {
          sendJson(response, 415, { error: "Content-Type must be application/json." });
          return;
        }
        const raw = await readJsonBody(request);
        const validated = validateQueryRequest(raw);
        if (!validated.ok) {
          sendJson(response, 400, { error: validated.error });
          return;
        }
        const result = queryLocalKnowledge(validated.value.query);
        sendJson(response, 200, { mode: "local-demo", contractVersion: QUERY_CONTRACT_VERSION, ...result });
      } catch (error) {
        sendJson(response, error.statusCode ?? 500, {
          error: error.statusCode ? error.message : "The local query service encountered an unexpected error."
        });
      }
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      sendJson(response, 404, { error: "Not found" });
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { allow: "GET, HEAD" });
      response.end("Method not allowed");
      return;
    }

    await serveStatic(url.pathname, request.method, response);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const host = process.env.HOST ?? "127.0.0.1";
  const port = Number(process.env.PORT ?? "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  createAppServer().listen(port, host, () => {
    console.log(`GAIA Phase A local demo listening at http://${host}:${port}`);
    console.log("Mode: local-demo; no live model provider or external service is connected.");
  });
}
