import { createLocalDemoApi } from "./api-client.js";
import { INITIAL_REGISTRY, filterRegistry } from "../src/provider-registry.js";

const api = createLocalDemoApi();
const form = document.querySelector("#query-form");
const input = document.querySelector("#query-input");
const button = document.querySelector("#submit-button");
const feedback = document.querySelector("#feedback");
const result = document.querySelector("#result");
const answer = document.querySelector("#answer");
const sources = document.querySelector("#sources");
const healthBadge = document.querySelector("#health-badge");
const characterCount = document.querySelector("#character-count");
const queryWorkspace = document.querySelector("#query-workspace");

input.addEventListener("input", () => {
  characterCount.textContent = `${input.value.length} / 500`;
});

function showFeedback(message, kind = "info") {
  feedback.textContent = message;
  feedback.dataset.kind = kind;
}

function renderResult(data) {
  answer.replaceChildren();
  sources.replaceChildren();

  if (data.status === "no_match") {
    answer.textContent = data.answer ?? "No matching local knowledge was found.";
  } else {
    answer.textContent = data.answer;
  }

  for (const source of data.sources ?? []) {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = source.title;
    const detail = document.createElement("span");
    detail.textContent = `${source.source} · ${source.sourceType} · v${source.version} · ${source.id}`;
    item.append(title, detail);
    sources.append(item);
  }

  result.hidden = false;
}

async function checkHealth() {
  try {
    const health = await api.health();
    if (health.mode === "local-demo") {
      healthBadge.textContent = "Local demo · not connected";
      healthBadge.dataset.state = "unverified";
    } else {
      healthBadge.textContent = "Service status unverified";
      healthBadge.dataset.state = "unverified";
    }
  } catch {
    healthBadge.textContent = "Service unavailable";
    healthBadge.dataset.state = "error";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) {
    showFeedback("Enter a question before searching.", "error");
    input.focus();
    return;
  }

  button.disabled = true;
  queryWorkspace.setAttribute("aria-busy", "true");
  button.textContent = "Searching…";
  result.hidden = true;
  showFeedback("Searching the fixed local knowledge fixtures…", "loading");

  try {
    const data = await api.query(query);
    renderResult(data);
    showFeedback(
      data.status === "matched"
        ? "Found local fixture matches. This is not a live model response."
        : "No matching fixture was found. No answer was generated from an external provider.",
      data.status === "matched" ? "success" : "info"
    );
  } catch (error) {
    showFeedback(error.message || "The local service is unavailable. Please try again.", "error");
  } finally {
    queryWorkspace.setAttribute("aria-busy", "false");
    button.disabled = false;
    button.innerHTML = 'Search knowledge <span aria-hidden="true">→</span>';
  }
});

const capabilityFilter = document.querySelector("#capability-filter");
const kindFilter = document.querySelector("#kind-filter");
const catalogStatus = document.querySelector("#catalog-status");
const providerCatalog = document.querySelector("#provider-catalog");

function appendTextElement(parent, tagName, text, className) {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

function renderProviderCatalog() {
  const entries = filterRegistry(INITIAL_REGISTRY, {
    capability: capabilityFilter.value || undefined,
    kind: kindFilter.value || undefined
  });
  providerCatalog.replaceChildren();

  for (const entry of entries) {
    const card = document.createElement("li");
    card.className = "provider-card";
    const heading = document.createElement("div");
    heading.className = "provider-card-heading";
    appendTextElement(heading, "h3", entry.name);
    appendTextElement(heading, "span", entry.kind.replaceAll("_", " "), "provider-kind");
    card.append(heading);
    appendTextElement(card, "p", `Connection: ${entry.connectionState.replaceAll("_", " ")} · Evidence: ${entry.verificationStatus.replaceAll("_", " ")}`, "provider-state");
    appendTextElement(card, "p", entry.capabilities.join(" · "), "provider-capabilities");
    appendTextElement(card, "p", entry.limitations.join(" "), "provider-limitation");

    const evidence = entry.evidence[0];
    if (evidence) {
      const link = document.createElement("a");
      link.href = evidence.sourceUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Evidence starting point";
      link.setAttribute("aria-label", `Evidence starting point for ${entry.name} (opens in a new tab)`);
      card.append(link);
      appendTextElement(card, "p", evidence.establishes, "provider-evidence-note");
      appendTextElement(card, "p", evidence.retrievedAt ? `Reviewed: ${evidence.retrievedAt}` : "Source review date: not recorded", "provider-evidence-date");
    }
    providerCatalog.append(card);
  }

  catalogStatus.textContent = entries.length
    ? `${entries.length} catalogue entries · all seeded entries are unconfigured and unverified.`
    : "No catalogue entries match these filters. Try another capability or category.";
}

capabilityFilter.addEventListener("change", renderProviderCatalog);
kindFilter.addEventListener("change", renderProviderCatalog);
renderProviderCatalog();
checkHealth();
