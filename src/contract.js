/**
 * Phase A local query contract.
 *
 * This is a local prototype contract, not the approved GAIA API Gateway contract.
 * Keep this boundary isolated until GAIA-Documentation issues #163, #167, and #172
 * resolve repository ownership and authoritative service contracts.
 */

export const QUERY_CONTRACT_VERSION = "0.1.0";

export function validateQueryRequest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  if (typeof value.query !== "string") {
    return { ok: false, error: "The query field must be a string." };
  }

  const query = value.query.trim();
  if (!query) return { ok: false, error: "Enter a question to search the local demo knowledge." };
  if (query.length > 500) return { ok: false, error: "Questions must be 500 characters or fewer." };

  return { ok: true, value: { query } };
}
