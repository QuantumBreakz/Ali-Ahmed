// Refresh existing DEV articles with the current text from the site (for example after adding figures).
//
//   DEVTO_API_KEY=... node scripts/promote/devto-update.mjs                  dry run: lists what would change
//   DEVTO_API_KEY=... node scripts/promote/devto-update.mjs --apply          updates articles whose body differs
//   ... --apply --only slug-a,slug-b                                         limit to some posts
//
// Matches articles by canonical URL, replaces body_markdown only (title, tags and canonical stay), never creates.
import { posts } from "./posts.mjs";

const key = process.env.DEVTO_API_KEY;
if (!key) throw new Error("Set DEVTO_API_KEY");
const apply = process.argv.includes("--apply");
const onlyArg = process.argv.indexOf("--only");
const only = onlyArg > -1 ? new Set(process.argv[onlyArg + 1].split(",")) : null;

const api = (path, init = {}) =>
  fetch(`https://dev.to/api${path}`, {
    ...init,
    headers: { "api-key": key, "content-type": "application/json", accept: "application/vnd.forem.api-v1+json", ...init.headers },
  });
// Same transform as devto.mjs: drop the export's title, description and date lines.
// DEV's parser drops a fence whose info string has attributes (```js title="x"), so the closing fence opens a block
// that swallows the rest of the article. Put the title on its own line above a plain fence.
const body = (md) =>
  md
    .replace(/^[\s\S]*?\nPublished: .*\n(\nUpdated: .*\n)?\n/, "")
    .replace(/^([ \t]*)```([\w+-]*)[ \t]+title="([^"]*)"[^\n]*$/gm, "$1**$3**\n\n$1```$2");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const res = await api("/articles/me/all?per_page=1000");
if (!res.ok) throw new Error(`DEV rejected the key: ${res.status} ${await res.text()}`);
const byCanonical = new Map((await res.json()).map((a) => [a.canonical_url, a]));

let updated = 0;
let unchanged = 0;
for (const p of posts) {
  if (only && !only.has(p.slug)) continue;
  const article = byCanonical.get(p.url);
  if (!article) continue;
  const markdown = await fetch(`${p.url.slice(0, -1)}.md`);
  if (!markdown.ok) continue;
  const next = body(await markdown.text());
  if (article.body_markdown?.trim() === next.trim()) {
    unchanged++;
    continue;
  }
  if (!apply) {
    console.log(`would update: ${p.title}`);
    continue;
  }
  if (updated) await sleep(5_000); // DEV limits article writes; space them out
  const put = await api(`/articles/${article.id}`, { method: "PUT", body: JSON.stringify({ article: { body_markdown: next } }) });
  if (put.status === 429) {
    console.log(`DEV rate limit reached; stopping. Run again later to continue from: ${p.title}`);
    break;
  }
  if (!put.ok) {
    console.error(`FAILED ${p.title}: ${put.status} ${await put.text()}`);
    process.exitCode = 1;
    continue;
  }
  updated++;
  console.log(`updated: ${p.title} → ${(await put.json()).url}`);
}
console.log(`\n${apply ? "apply" : "dry run"}: ${updated} updated, ${unchanged} already current.`);
