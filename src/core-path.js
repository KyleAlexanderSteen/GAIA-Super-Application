/**
 * Application path that calls the GAIA-Core contract sequence.
 * Source of truth is GAIA-Core. This module is the caller.
 * A missing check blocks before any side effect.
 */

export class PathBlocked extends Error {
  constructor(step, reason) {
    super(`${step}: ${reason}`);
    this.step = step;
    this.reason = reason;
  }
}

function requireApproval(approval) {
  if (!approval || approval.allow !== true) throw new PathBlocked("approval", "missing explicit allow");
  if (approval.withdrawn) throw new PathBlocked("approval", "allow withdrawn");
  if (!approval.who || !approval.what || !approval.when || !approval.scope) {
    throw new PathBlocked("approval", "allow record incomplete");
  }
  return approval;
}

function requireConsent(consent, requiredScope) {
  if (!consent || consent.granted !== true) throw new PathBlocked("consent", "missing consent");
  if (consent.withdrawn) throw new PathBlocked("consent", "consent withdrawn");
  if (requiredScope && consent.scope !== requiredScope) {
    throw new PathBlocked("consent", "consent scope mismatch");
  }
  return consent;
}

function requireProvenance(provenance) {
  if (!provenance || !provenance.source || !provenance.version) {
    throw new PathBlocked("provenance", "missing provenance");
  }
  const allowed = new Set(["verified", "unverified", "reconstructed", "unavailable"]);
  if (!allowed.has(provenance.evidence)) throw new PathBlocked("provenance", "evidence state invalid");
  return provenance;
}

function enforceAuthority(boundary, requested) {
  if (!boundary || !boundary.principal || !Array.isArray(boundary.allowed)) {
    throw new PathBlocked("authority", "boundary incomplete");
  }
  const allowed = new Set(boundary.allowed);
  const outside = (requested || []).filter((scope) => !allowed.has(scope));
  if (outside.length > 0) {
    throw new PathBlocked("authority", `scope expansion requires re-authorisation: ${outside.join(",")}`);
  }
  return boundary;
}

function auditOf(input, status, extra = {}) {
  return {
    intended: input.requested || [],
    observed: status,
    protected: input.boundary?.principal || "unknown",
    pays: input.approval?.who || "unknown",
    epistemicStatus: input.provenance?.evidence || "unknown",
    ...extra
  };
}

export function runAction(input, sideEffect) {
  const steps = [];
  try {
    requireApproval(input.approval);
    steps.push("approval");
    requireConsent(input.consent, input.requiredScope);
    steps.push("consent");
    requireProvenance(input.provenance);
    steps.push("provenance");
    enforceAuthority(input.boundary, input.requested || []);
    steps.push("authority");
    if (typeof sideEffect !== "function") throw new PathBlocked("execute", "no side effect");
    const result = sideEffect(input);
    return { ok: true, audit: auditOf(input, "executed", { steps, result }) };
  } catch (err) {
    if (err instanceof PathBlocked) {
      return { ok: false, audit: auditOf(input, "refused", { steps, blockedAt: err.step, reason: err.reason }) };
    }
    throw err;
  }
}
