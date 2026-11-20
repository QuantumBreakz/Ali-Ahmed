// Which searches show this site, and where: Search Console search analytics for the last 28 days.
//
//   node scripts/promote/gsc-queries.mjs --key ~/Downloads/key.json     (or GSC_SERVICE_ACCOUNT_JSON)
//
// Prints the top pages and queries by impressions, then "near misses": queries ranking 8-30, where a better
// or new article has the best chance of reaching page one.
import { readFileSync } from "node:fs";
import { serviceAccountToken } from "./google.mjs";

const keyArg = process.argv.indexOf("--key");
const raw = keyArg > -1 ? readFileSync(process.argv[keyArg + 1], "utf8") : process.env.GSC_SERVICE_ACCOUNT_JSON;
if (!raw) throw new Error("Pass --key path/to/key.json or set GSC_SERVICE_ACCOUNT_JSON.");
const site = process.env.GSC_SITE ?? "sc-domain:aliahmed.si";
const auth = { authorization: `Bearer ${await serviceAccountToken(JSON.parse(raw), "https://www.googleapis.com/auth/webmasters.readonly")}` };

const day = (offset) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
async function query(dimensions, rowLimit = 25) {
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify({ startDate: day(30), endDate: day(2), dimensions, rowLimit }), // data lags about 2 days
  });
  if (!res.ok) throw new Error(`Search analytics failed: ${res.status} ${await res.text()}`);
  return (await res.json()).rows ?? [];
}

const fmt = (r) =>
  `${String(r.impressions).padStart(6)} impr  ${String(r.clicks).padStart(4)} clicks  pos ${r.position.toFixed(1).padStart(5)}  ${r.keys.join("  ")}`;
const [pages, queries, all] = await Promise.all([query(["page"]), query(["query"]), query(["query"], 500)]);
console.log(`Search Console, ${day(30)} to ${day(2)}\n`);
console.log("Top pages\n" + (pages.map(fmt).join("\n") || "  no data yet") + "\n");
console.log("Top queries\n" + (queries.map(fmt).join("\n") || "  no data yet") + "\n");
const near = all
  .filter((r) => r.position >= 8 && r.position <= 30)
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 25);
console.log("Near misses (position 8-30)\n" + (near.map(fmt).join("\n") || "  none yet"));
