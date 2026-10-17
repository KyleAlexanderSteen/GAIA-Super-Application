/** Local action route. No secrets. No private control plane. No network. */
import { runAction } from "./core-path.js";

export function handleAction(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { status: 400, body: { error: "Action body must be a JSON object." } };
  }
  const outcome = runAction(body, () => ({ value: "local-fixture-ok", sideEffect: "none-beyond-audit" }));
  return {
    status: outcome.ok ? 200 : 403,
    body: {
      mode: "local-demo",
      ok: outcome.ok,
      audit: outcome.audit
    }
  };
}
