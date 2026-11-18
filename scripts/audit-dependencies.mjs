import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { hardenCache } from "./harden-cache.mjs";

const severities = ["info", "low", "moderate", "high", "critical"];

export function evaluateAudit(report, exitCode) {
  assert.equal(report?.auditReportVersion, 2, "Unsupported or malformed npm audit report.");
  assert.ok(!report.error && report.vulnerabilities && report.metadata?.vulnerabilities, "The dependency audit failed.");
  assert.ok(typeof report.vulnerabilities === "object" && !Array.isArray(report.vulnerabilities), "Malformed audit findings map.");
  const entries = Object.entries(report.vulnerabilities);
  const counts = report.metadata.vulnerabilities;
  assert.equal(counts.total, entries.length, "Audit findings and totals disagree.");
  for (const severity of severities) {
    assert.equal(counts[severity], entries.filter(([, entry]) => entry.severity === severity).length, "Audit severity totals disagree.");
  }
  assert.equal(
    severities.reduce((total, severity) => total + counts[severity], 0),
    counts.total,
    "Unknown audit severity."
  );
  assert.equal(entries.length, 0, "Dependency vulnerabilities must be fixed before building; no advisory exceptions are allowed.");
  assert.equal(exitCode, 0, "Audit command failed despite an empty report.");
  return "clean";
}

const advisoryId = (via) => (typeof via === "object" ? via.url?.match(/GHSA-[\w-]+$/)?.[0] : undefined);

/**
 * Drop findings that exist only because of advisories GitHub has withdrawn (published in error), including
 * packages flagged just for depending on such a finding. Anything else, even one real advisory, is kept.
 * Returns the report with recomputed totals.
 */
export function withoutWithdrawn(report, withdrawn) {
  const entries = { ...report.vulnerabilities };
  let changed = true;
  while (changed) {
    changed = false;
    for (const [name, entry] of Object.entries(entries)) {
      const onlyWithdrawn = entry.via.every((via) => (typeof via === "string" ? !(via in entries) : withdrawn.has(advisoryId(via))));
      if (onlyWithdrawn) {
        delete entries[name];
        changed = true;
      }
    }
  }
  const counts = Object.fromEntries(severities.map((severity) => [severity, Object.values(entries).filter((e) => e.severity === severity).length]));
  return {
    ...report,
    vulnerabilities: entries,
    metadata: { ...report.metadata, vulnerabilities: { ...counts, total: Object.keys(entries).length } },
  };
}

/** Advisory IDs in the report that GitHub marks as withdrawn. Any lookup failure counts as not withdrawn. */
async function withdrawnAdvisories(report) {
  const ids = new Set(Object.values(report.vulnerabilities ?? {}).flatMap((entry) => entry.via.map(advisoryId).filter(Boolean)));
  const withdrawn = new Set();
  for (const id of ids) {
    try {
      const res = await fetch(`https://api.github.com/advisories/${id}`, { headers: { accept: "application/vnd.github+json" } });
      if (res.ok && (await res.json()).withdrawn_at) withdrawn.add(id);
    } catch {
      // fail closed: the finding stays
    }
  }
  return withdrawn;
}

async function main() {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const result = spawnSync(
    "npm",
    [
      "audit",
      "--json",
      "--ignore-scripts",
      "--include=dev",
      "--include=optional",
      "--include=peer",
      "--registry=https://registry.npmjs.org",
      "--offline=false",
    ],
    {
      cwd: root,
      encoding: "utf8",
      timeout: 120_000,
      maxBuffer: 8 * 1024 * 1024,
    }
  );
  assert.ok(!result.error && !result.signal && Number.isInteger(result.status), "The dependency audit could not complete.");
  console.log(result.stdout);
  const report = JSON.parse(result.stdout);
  const withdrawn = await withdrawnAdvisories(report);
  const kept = withoutWithdrawn(report, withdrawn);
  if (withdrawn.size) console.log(`Ignoring advisories GitHub has withdrawn: ${[...withdrawn].join(", ")}`);
  // npm exits 1 for any finding; when only withdrawn ones remained, the audit is effectively clean.
  evaluateAudit(kept, withdrawn.size && kept.metadata.vulnerabilities.total === 0 ? 0 : result.status);
  return hardenCache(root).then(() => console.log("Dependency audit passed without exceptions; cache security guard verified."));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  Promise.resolve()
    .then(main)
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
