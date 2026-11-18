// Cross-post blog posts to DEV (dev.to), each with canonical_url pointing at the original on aliahmed.si.
//
//   DEVTO_API_KEY=... node scripts/promote/devto.mjs            dry run: shows what would be posted
//   DEVTO_API_KEY=... node scripts/promote/devto.mjs --draft    creates unpublished drafts to review on dev.to
//   DEVTO_API_KEY=... node scripts/promote/devto.mjs --publish [--limit 8]  publishes (at most 8 new posts)
//
// Bodies come from the live site's Markdown export (https://aliahmed.si/blog/<slug>.md), so the post must be
// deployed first and every internal link is already an absolute aliahmed.si URL. Posts whose title
// or canonical URL already exists on the DEV account are skipped, so re-running is safe.
import { readFileSync } from "node:fs";
import { posts } from "./posts.mjs";

const taken = new Set(
  readFileSync(new URL("./devto-taken.txt", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
);

const mode = process.argv.includes("--publish") ? "publish" : process.argv.includes("--draft") ? "draft" : "dry-run";
const key = process.env.DEVTO_API_KEY;
const limitArg = process.argv.indexOf("--limit");
const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;
if (mode !== "dry-run" && !key) throw new Error("Set DEVTO_API_KEY (https://dev.to/settings/extensions)");

const devTags = (tags) => [...new Set(tags.map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, "")))].filter(Boolean).slice(0, 4);
const body = (md) => md.replace(/^[\s\S]*?\nPublished: .*\n(\nUpdated: .*\n)?\n/, "");

const api = (path, init = {}) =>
  fetch(`https://dev.to/api${path}`, {
    ...init,
    headers: { "api-key": key, "content-type": "application/json", accept: "application/vnd.forem.api-v1+json", ...init.headers },
  });

const existing = new Set();
if (key) {
  const res = await api("/articles/me/all?per_page=1000");
  if (!res.ok) throw new Error(`DEV rejected the key: ${res.status} ${await res.text()}`);
  for (const a of await res.json()) existing.add(a.title).add(a.canonical_url);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let created = 0;
let failed = 0;
for (const p of posts) {
  if (created + failed >= limit) break;
  if (existing.has(p.title) || existing.has(p.url) || taken.has(p.slug)) {
    console.log(`skip (already on DEV): ${p.title}`);
    continue;
  }
  const markdown = await fetch(`${p.url.slice(0, -1)}.md`);
  if (!markdown.ok) {
    console.log(`skip (not deployed yet): ${p.url}`);
    continue;
  }
  const article = {
    title: p.title,
    description: p.description,
    tags: devTags(p.tags),
    canonical_url: p.url,
    published: mode === "publish",
    body_markdown: body(await markdown.text()),
  };
  if (mode === "dry-run") {
    console.log(`would post: ${p.title}\n  canonical ${p.url}\n  tags ${article.tags.join(", ")} · ${article.body_markdown.length} chars`);
    continue;
  }
  // ponytail: fixed 35 s spacing; on a 429 stop and let the next daily run continue, rather than wait 5 minutes.
  if (created) await sleep(35_000);
  const res = await api("/articles", { method: "POST", body: JSON.stringify({ article }) });
  if (res.status === 429) {
    console.log(`DEV rate limit reached; stopping here. The next run continues from: ${p.title}`);
    break;
  }
  if (res.status === 422) {
    const error = await res.text();
    if (error.includes("Canonical url has already been taken")) {
      console.log(`skip (already on DEV under another title): ${p.title}`);
      continue;
    }
    failed++;
    console.error(`FAILED ${p.title}: 422 ${error}`);
    continue;
  }
  if (!res.ok) {
    failed++;
    console.error(`FAILED ${p.title}: ${res.status} ${await res.text()}`);
    continue;
  }
  created++;
  console.log(`${mode === "publish" ? "published" : "drafted"}: ${p.title} → ${(await res.json()).url}`);
}
console.log(`\n${mode}: ${posts.length} posts, ${created} created, ${failed} failed.`);
if (failed) process.exitCode = 1;
