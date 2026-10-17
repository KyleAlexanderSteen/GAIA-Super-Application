/** Four-field fixtures. Unknown is valid and non-actionable. */

export const earthFixture = {
  question: "What is the local fixture state of Earth?",
  intended: "report fixture state",
  observed: "refused-live-ingest",
  protected: "no person",
  pays: "none",
  epistemicStatus: "unverified",
  reason: "LIVE_FEED_NOT_PERMITTED"
};

export const cosmosFixture = {
  question: "What is the universe?",
  intended: "report a frame, not a replica",
  observed: "unknown",
  protected: "no person",
  pays: "none",
  epistemicStatus: "unknown",
  reason: "MODEL_IS_NOT_COSMOS"
};

export function canAct(fixture) {
  if (!fixture || fixture.epistemicStatus === "unknown") return false;
  return fixture.observed !== "refused-live-ingest";
}
