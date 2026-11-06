// Cross-post blog posts to DEV (dev.to), each with canonical_url pointing at the original on aliahmed.si.
//
//   DEVTO_API_KEY=... node scripts/promote/devto.mjs            dry run: shows what would be posted
//   DEVTO_API_KEY=... node scripts/promote/devto.mjs --draft    creates unpublished drafts to review on dev.to
//   DEVTO_API_KEY=... node scripts/promote/devto.mjs --publish  publishes
//
// Bodies come from the live site's Markdown export (https://aliahmed.si/blog/<slug>.md), so the post must be
// deployed first and every internal link is already an absolute aliahmed.si URL. Posts whose title already
// exists on the DEV account are skipped, so re-running is safe.
import { posts } from "./posts.mjs";

const mode = process.argv.includes("--publish") ? "publish" : process.argv.includes("--draft") ? "draft" : "dry-run";
const key = process.env.DEVTO_API_KEY;
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
  for (const a of await res.json()) existing.add(a.title);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let created = 0;
let failed = 0;
for (const p of posts) {
  if (existing.has(p.title)) {
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
  // ponytail: fixed 35 s spacing + one retry is enough for DEV's article rate limit at this volume.
  if (created) await sleep(35_000);
  let res = await api("/articles", { method: "POST", body: JSON.stringify({ article }) });
  if (res.status === 429) {
    await sleep(60_000);
    res = await api("/articles", { method: "POST", body: JSON.stringify({ article }) });
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
