// Ask Search Console why each sitemap URL is or isn't indexed (URL Inspection API, 2,000 checks a day).
//
//   node scripts/promote/gsc-inspect.mjs --key ~/Downloads/key.json     (or GSC_SERVICE_ACCOUNT_JSON)
//
// Prints one line per URL and a count per coverage state, e.g. "Discovered - currently not indexed".
// It reads status only: Google has no API to request indexing of ordinary pages, so fixes happen on the site.
import { readFileSync } from "node:fs";
import { serviceAccountToken } from "./google.mjs";

const keyArg = process.argv.indexOf("--key");
const raw = keyArg > -1 ? readFileSync(process.argv[keyArg + 1], "utf8") : process.env.GSC_SERVICE_ACCOUNT_JSON;
if (!raw) throw new Error("Pass --key path/to/key.json or set GSC_SERVICE_ACCOUNT_JSON.");
const site = process.env.GSC_SITE ?? "sc-domain:aliahmed.si";
const auth = { authorization: `Bearer ${await serviceAccountToken(JSON.parse(raw), "https://www.googleapis.com/auth/webmasters.readonly")}` };

const sitemap = await fetch("https://aliahmed.si/sitemap-0.xml").then((r) => r.text());
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const counts = {};
for (const url of urls) {
  const res = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: site }),
  });
  if (!res.ok) throw new Error(`Inspection failed for ${url}: ${res.status} ${await res.text()}`);
  const r = (await res.json()).inspectionResult.indexStatusResult;
  counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
  const canonical = r.googleCanonical && r.googleCanonical !== url ? `  google canonical: ${r.googleCanonical}` : "";
  console.log(`${r.verdict.padEnd(8)} ${url}  ${r.coverageState}  crawled ${r.lastCrawlTime ?? "never"}${canonical}`);
}
console.log("\nSummary:");
for (const [state, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${state}`);
