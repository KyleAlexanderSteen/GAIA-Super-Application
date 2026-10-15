/**
 * GAIA Integrity Gate — MVP metadata validator.
 *
 * This pure function validates change metadata before a broader review begins.
 * It does not approve changes, assess whether evidence is true, or replace CI,
 * security review, repository authorization, or human approval.
 */

const CHANGE_TYPES = new Set([
  "feature",
  "bugfix",
  "refactor",
  "documentation",
  "security",
  "test",
  "infrastructure"
]);

const RISK_LEVELS = new Set(["low", "medium", "high", "critical"]);
const REQUIRED_ARRAY_FIELDS = ["evidence", "assumptions", "repositories_affected"];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateStringArray(value, field, { allowEmpty = false } = {}) {
  if (!Array.isArray(value)) return { error: `${field} must be an array of strings.` };
  const cleaned = value.map(cleanString);
  if (cleaned.some((item) => !item)) {
    return { error: `${field} must not contain empty or non-string entries.` };
  }
  if (!allowEmpty && cleaned.length === 0) {
    return { error: `${field} must contain at least one entry.` };
  }
  return { value: cleaned };
}

/**
 * Validate the metadata required to start a GAIA change review.
 * @param {unknown} input
 * @returns {{ok: true, value: object, errors: []} | {ok: false, errors: string[]}}
 */
export function validateChangeMetadata(input) {
  if (!isRecord(input)) {
    return { ok: false, errors: ["Change metadata must be a JSON object."] };
  }

  const errors = [];
  const changeType = cleanString(input.change_type).toLowerCase();
  const riskLevel = cleanString(input.risk_level).toLowerCase();

  if (!CHANGE_TYPES.has(changeType)) {
    errors.push(`change_type must be one of: ${[...CHANGE_TYPES].join(", ")}.`);
  }
  if (!RISK_LEVELS.has(riskLevel)) {
    errors.push(`risk_level must be one of: ${[...RISK_LEVELS].join(", ")}.`);
  }

  const evidence = validateStringArray(input.evidence, "evidence");
  const assumptions = validateStringArray(input.assumptions, "assumptions", { allowEmpty: true });
  const repositories = validateStringArray(input.repositories_affected, "repositories_affected");

  for (const result of [evidence, assumptions, repositories]) {
    if (result.error) errors.push(result.error);
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    errors: [],
    value: {
      change_type: changeType,
      risk_level: riskLevel,
      evidence: evidence.value,
      assumptions: assumptions.value,
      repositories_affected: repositories.value
    }
  };
}
