import test from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_REGISTRY,
  createMockProviderAdapter,
  filterRegistry,
  validateRegistryEntry
} from "../src/provider-registry.js";

test("initial registry entries have explicit evidence and honest unverified/unconfigured states", () => {
  assert.ok(INITIAL_REGISTRY.length >= 5);
  for (const entry of INITIAL_REGISTRY) {
    const checked = validateRegistryEntry(entry);
    assert.equal(checked.ok, true, checked.ok ? "" : checked.error);
    assert.equal(entry.connectionState, "unconfigured");
    assert.equal(entry.verificationStatus, "unverified");
    assert.ok(entry.evidence.length > 0);
    assert.ok(entry.limitations.length > 0);
  }
});

test("NVIDIA models, inference, lifecycle tooling, and specialized systems are distinct categories", () => {
  const nvidia = INITIAL_REGISTRY.filter((entry) => entry.providerId === "nvidia");
  assert.ok(nvidia.some((entry) => entry.kind === "model" && entry.id === "nvidia-nemotron"));
  assert.ok(nvidia.some((entry) => entry.kind === "inference_service" && entry.id === "nvidia-nim"));
  assert.ok(nvidia.some((entry) => entry.kind === "lifecycle_tool" && entry.id === "nvidia-nemo"));
  assert.ok(nvidia.some((entry) => entry.kind === "specialized_system" && entry.id === "nvidia-earth-2"));
  assert.ok(nvidia.some((entry) => entry.kind === "specialized_system" && entry.id === "nvidia-cosmos"));
});

test("filters registry entries by capability, kind, and verification status", () => {
  assert.ok(filterRegistry(INITIAL_REGISTRY, { capability: "simulation" }).some((entry) => entry.id === "nvidia-earth-2"));
  assert.ok(filterRegistry(INITIAL_REGISTRY, { kind: "provider" }).every((entry) => entry.kind === "provider"));
  assert.equal(filterRegistry(INITIAL_REGISTRY, { verificationStatus: "independently_tested" }).length, 0);
  assert.deepEqual(filterRegistry(INITIAL_REGISTRY, { capability: "does-not-exist" }), []);
});

test("registry validation rejects malformed entries, unsupported states, and unsafe evidence URLs", () => {
  assert.equal(validateRegistryEntry(null).ok, false);
  assert.equal(validateRegistryEntry({
    id: "x", name: "X", providerId: "x", kind: "model",
    connectionState: "healthy", verificationStatus: "verified",
    capabilities: [], modalities: [], deploymentModes: [], limitations: [], evidence: []
  }).ok, false);
  const invalidEvidence = {
    ...INITIAL_REGISTRY[0],
    evidence: [{ sourceUrl: "javascript:alert(1)", retrievedAt: null, establishes: "anything" }]
  };
  assert.equal(validateRegistryEntry(invalidEvidence).ok, false);
});

test("mock adapter fails closed when unconfigured and never claims to call a provider", async () => {
  const adapter = createMockProviderAdapter();
  assert.deepEqual(await adapter.invoke({ task: "summarize" }), {
    ok: false, status: "unconfigured", error: "Provider integration is not configured."
  });
  assert.equal((await adapter.invoke({})).status, "invalid_request");
  const configured = createMockProviderAdapter({ configured: true });
  const result = await configured.invoke({ task: "test" });
  assert.equal(result.ok, true);
  assert.equal(result.status, "mocked");
  assert.match(result.result.note, /no provider was called/i);
  assert.equal(JSON.stringify(result).includes("api_key"), false);
});
