import { createLocalDemoApi } from "./api-client.js";

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

checkHealth();
