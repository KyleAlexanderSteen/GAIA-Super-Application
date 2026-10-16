/**
 * Browser-side adapter for the Phase A local-demo endpoints.
 *
 * This is deliberately not the approved GAIA Gateway client. Keep transport
 * details behind this interface until the canonical service contract is approved.
 */
export function createLocalDemoApi(fetchImpl = fetch) {
  async function readJson(response, fallbackMessage) {
    try {
      return await response.json();
    } catch {
      throw new Error(fallbackMessage);
    }
  }

  return {
    async query(query) {
      const response = await fetchImpl("/api/query", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await readJson(
        response,
        "The local service returned an unreadable response. Please try again."
      );
      if (!response.ok) {
        throw new Error(data.error ?? "The query could not be completed.");
      }
      return data;
    },

    async health() {
      const response = await fetchImpl("/api/health", {
        headers: { accept: "application/json" }
      });
      if (!response.ok) throw new Error("Service unavailable");
      return readJson(response, "The local service returned an unreadable health response.");
    },

    async providers() {
      const response = await fetchImpl("/api/v1/providers", {
        headers: { accept: "application/json" }
      });
      const data = await readJson(
        response,
        "The local provider catalogue returned an unreadable response."
      );
      if (!response.ok) {
        throw new Error(data.error ?? "The local provider catalogue is unavailable.");
      }
      if (data.schemaVersion !== 1 || !Array.isArray(data.providers)) {
        throw new Error("The local provider catalogue returned an unsupported response.");
      }
      return data;
    }
  };
}
