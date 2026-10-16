/**
 * Provider-agnostic AI capability registry foundation.
 *
 * Registry claims are intentionally unverified until evidence is reviewed.
 * This module contains no provider credentials and performs no network calls.
 */

/** @typedef {"provider"|"model"|"inference_service"|"lifecycle_tool"|"specialized_system"} RegistryEntryKind */
/** @typedef {"unconfigured"|"available"|"unavailable"} ConnectionState */
/** @typedef {"unverified"|"documented"|"independently_tested"} VerificationStatus */

/**
 * @typedef {object} EvidenceRecord
 * @property {string} sourceUrl
 * @property {string|null} retrievedAt ISO date when reviewed; null means not yet reviewed.
 * @property {string} establishes
 */

/**
 * @typedef {object} CapabilityEntry
 * @property {string} id Stable, lowercase registry identifier.
 * @property {string} name Human-readable name.
 * @property {RegistryEntryKind} kind Product category; do not conflate models and deployment tools.
 * @property {string} providerId Owning ecosystem identifier.
 * @property {string[]} capabilities
 * @property {string[]} modalities
 * @property {string[]} deploymentModes
 * @property {ConnectionState} connectionState Runtime connection state based on actual configuration/checks.
 * @property {VerificationStatus} verificationStatus Evidence status, separate from connection state.
 * @property {string[]} limitations
 * @property {EvidenceRecord[]} evidence
 */

/** @type {readonly CapabilityEntry[]} */
export const INITIAL_REGISTRY = Object.freeze([
  {
    id: "nvidia",
    name: "NVIDIA AI ecosystem",
    kind: "provider",
    providerId: "nvidia",
    capabilities: ["inference", "model-development", "simulation", "vision"],
    modalities: ["text", "image", "video"],
    deploymentModes: ["hosted-api", "cloud", "self-hosted", "local-edge"],
    connectionState: "unconfigured",
    verificationStatus: "unverified",
    limitations: ["Ecosystem entry only; individual products and capabilities require separate evidence review."],
    evidence: [{ sourceUrl: "https://www.nvidia.com/en-us/ai/", retrievedAt: null, establishes: "Official AI ecosystem landing page; specific capabilities not independently verified." }]
  },
  {
    id: "nvidia-nemotron",
    name: "Nemotron",
    kind: "model",
    providerId: "nvidia",
    capabilities: ["reasoning", "coding", "agent-tool-use"],
    modalities: ["text"],
    deploymentModes: ["hosted-api", "cloud", "self-hosted"],
    connectionState: "unconfigured",
    verificationStatus: "unverified",
    limitations: ["Illustrative catalogue record; exact model/version, modalities, terms, and benchmarks are not yet verified."],
    evidence: [{ sourceUrl: "https://www.nvidia.com/en-us/ai/", retrievedAt: null, establishes: "Provider ecosystem only; model-specific claims remain unverified." }]
  },
  {
    id: "nvidia-nim",
    name: "NVIDIA NIM",
    kind: "inference_service",
    providerId: "nvidia",
    capabilities: ["inference", "deployment"],
    modalities: ["unknown"],
    deploymentModes: ["cloud", "self-hosted"],
    connectionState: "unconfigured",
    verificationStatus: "unverified",
    limitations: ["Deployment compatibility, supported models, hardware, and commercial terms need product-specific review."],
    evidence: [{ sourceUrl: "https://www.nvidia.com/en-us/ai/", retrievedAt: null, establishes: "Provider ecosystem only; service details remain unverified." }]
  },
  {
    id: "nvidia-nemo",
    name: "NVIDIA NeMo",
    kind: "lifecycle_tool",
    providerId: "nvidia",
    capabilities: ["model-development", "model-customization", "evaluation"],
    modalities: ["unknown"],
    deploymentModes: ["cloud", "self-hosted"],
    connectionState: "unconfigured",
    verificationStatus: "unverified",
    limitations: ["Specific modules, compatibility, licensing, and operational requirements have not been verified."],
    evidence: [{ sourceUrl: "https://www.nvidia.com/en-us/ai/", retrievedAt: null, establishes: "Provider ecosystem only; tool-specific claims remain unverified." }]
  },
  {
    id: "nvidia-earth-2",
    name: "Earth-2",
    kind: "specialized_system",
    providerId: "nvidia",
    capabilities: ["weather", "climate", "simulation"],
    modalities: ["geospatial", "simulation-data"],
    deploymentModes: ["cloud", "self-hosted"],
    connectionState: "unconfigured",
    verificationStatus: "unverified",
    limitations: ["This is not a general-purpose chat model; use cases, data access, and deployment requirements need evidence review."],
    evidence: [{ sourceUrl: "https://www.nvidia.com/en-us/ai/", retrievedAt: null, establishes: "Provider ecosystem only; system-specific claims remain unverified." }]
  },
  {
    id: "nvidia-cosmos",
    name: "Cosmos",
    kind: "specialized_system",
    providerId: "nvidia",
    capabilities: ["world-modeling", "simulation", "video"],
    modalities: ["video", "simulation-data"],
    deploymentModes: ["cloud", "self-hosted"],
    connectionState: "unconfigured",
    verificationStatus: "unverified",
    limitations: ["Exact model family, versions, access terms, and supported workloads need evidence review."],
    evidence: [{ sourceUrl: "https://www.nvidia.com/en-us/ai/", retrievedAt: null, establishes: "Provider ecosystem only; system-specific claims remain unverified." }]
  },
  {
    id: "openai",
    name: "OpenAI ecosystem",
    kind: "provider",
    providerId: "openai",
    capabilities: ["reasoning", "coding", "vision", "audio", "image-generation", "embeddings"],
    modalities: ["text", "image", "audio", "video"],
    deploymentModes: ["hosted-api", "cloud"],
    connectionState: "unconfigured",
    verificationStatus: "unverified",
    limitations: ["Provider entry only; specific models, access, features, limits, and terms require separate verification."],
    evidence: [{ sourceUrl: "https://platform.openai.com/docs", retrievedAt: null, establishes: "Official documentation entry point; no live integration or model claim verified." }]
  }
]);

const ENTRY_KINDS = new Set(["provider", "model", "inference_service", "lifecycle_tool", "specialized_system"]);
const CONNECTION_STATES = new Set(["unconfigured", "available", "unavailable"]);
const VERIFICATION_STATUSES = new Set(["unverified", "documented", "independently_tested"]);
const STRING_ARRAY_FIELDS = ["capabilities", "modalities", "deploymentModes", "limitations"];

/**
 * Validate the registry's required fields without silently filling unknown data.
 * @param {unknown} entry
 * @returns {{ok: true, value: CapabilityEntry}|{ok: false, error: string}}
 */
export function validateRegistryEntry(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return { ok: false, error: "Registry entry must be an object." };
  }
  const value = /** @type {Record<string, unknown>} */ (entry);
  for (const field of ["id", "name", "providerId"]) {
    if (typeof value[field] !== "string" || !value[field].trim()) {
      return { ok: false, error: `Registry field '${field}' must be a non-empty string.` };
    }
  }
  if (!ENTRY_KINDS.has(String(value.kind))) return { ok: false, error: "Registry kind is unsupported." };
  if (!CONNECTION_STATES.has(String(value.connectionState))) return { ok: false, error: "Connection state is unsupported." };
  if (!VERIFICATION_STATUSES.has(String(value.verificationStatus))) return { ok: false, error: "Verification status is unsupported." };
  for (const field of STRING_ARRAY_FIELDS) {
    if (!Array.isArray(value[field]) || !value[field].every((item) => typeof item === "string")) {
      return { ok: false, error: `Registry field '${field}' must be an array of strings.` };
    }
  }
  if (!Array.isArray(value.evidence) || value.evidence.length === 0 || !value.evidence.every((item) => {
    if (!item || typeof item !== "object" || typeof item.sourceUrl !== "string" ||
        typeof item.establishes !== "string" || !item.establishes.trim()) return false;
    let source;
    try {
      source = new URL(item.sourceUrl);
    } catch {
      return false;
    }
    if (source.protocol !== "https:" || !source.hostname || source.username || source.password) return false;
    if (item.retrievedAt === null) return true;
    if (typeof item.retrievedAt !== "string" || !/^\\d{4}-\\d{2}-\\d{2}$/.test(item.retrievedAt)) return false;
    const date = new Date(`${item.retrievedAt}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === item.retrievedAt;
  })) {
    return { ok: false, error: "Evidence must contain at least one record with a valid HTTPS URL, an ISO calendar review date or explicit null, and a non-empty statement of what it establishes." };
  }
  return { ok: true, value: /** @type {CapabilityEntry} */ (value) };
}

/**
 * @param {readonly CapabilityEntry[]} entries
 * @param {{capability?: string, kind?: RegistryEntryKind, verificationStatus?: VerificationStatus}} filters
 */
export function filterRegistry(entries, filters = {}) {
  return entries.filter((entry) =>
    (!filters.capability || entry.capabilities.includes(filters.capability)) &&
    (!filters.kind || entry.kind === filters.kind) &&
    (!filters.verificationStatus || entry.verificationStatus === filters.verificationStatus)
  );
}

/**
 * Minimal adapter contract demonstration. It never performs network I/O and
 * never reads or returns credentials. A real adapter must be separately reviewed.
 */
export function createMockProviderAdapter({ configured = false } = {}) {
  return Object.freeze({
    id: "mock-provider-adapter",
    async invoke(request) {
      if (!request || typeof request !== "object" || typeof request.task !== "string" || !request.task.trim()) {
        return { ok: false, status: "invalid_request", error: "A non-empty task is required." };
      }
      if (!configured) {
        return { ok: false, status: "unconfigured", error: "Provider integration is not configured." };
      }
      return { ok: true, status: "mocked", result: { task: request.task, note: "Mock adapter only; no provider was called." } };
    }
  });
}
