/**
 * Explicitly local, deterministic demo knowledge.
 * Do not present these fixtures as a live model response or canonical GAIA knowledge.
 */

export const knowledgeFixtures = [
  {
    id: "fixture-gaia-evidence-001",
    title: "Evidence and implementation status",
    text: "GAIA should distinguish documented proposals from implemented and verified behavior. A claim about implementation should be supported by code, tests, and recorded evidence.",
    source: "Phase A demonstration fixture",
    sourceType: "local_test_fixture",
    version: "1.0.0"
  },
  {
    id: "fixture-gaia-knowledge-002",
    title: "Knowledge provenance",
    text: "A knowledge record should preserve a stable identifier, source, version, and enough provenance to trace where the information came from.",
    source: "Phase A demonstration fixture",
    sourceType: "local_test_fixture",
    version: "1.0.0"
  },
  {
    id: "fixture-gaia-security-003",
    title: "Safe integration boundaries",
    text: "The public application must not contain owner credentials or privileged Master Application operations. Server-side authorization and approved service contracts are required before sensitive integrations.",
    source: "Phase A demonstration fixture",
    sourceType: "local_test_fixture",
    version: "1.0.0"
  }
];

function tokenize(value) {
  return value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

export function queryLocalKnowledge(query) {
  const terms = [...new Set(tokenize(query))];
  if (terms.length === 0) return { answer: null, sources: [], status: "no_match" };

  const ranked = knowledgeFixtures
    .map((record) => {
      const searchable = tokenize([record.title, record.text].join(" "));
      const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id));

  if (ranked.length === 0) {
    return {
      answer: "I couldn't find a matching entry in the local demo knowledge. This is not a live GAIA model response.",
      sources: [],
      status: "no_match"
    };
  }

  const matches = ranked.slice(0, 2);
  return {
    answer: matches.map(({ record }) => record.text).join("\n\n"),
    sources: matches.map(({ record }) => ({
      id: record.id,
      title: record.title,
      source: record.source,
      sourceType: record.sourceType,
      version: record.version
    })),
    status: "matched"
  };
}
