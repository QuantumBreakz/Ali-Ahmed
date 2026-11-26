// Publish a short summary post per article on your Blogger (blogspot.com) blog, linking to the full article.
//
//   node scripts/promote/blogger.mjs [--limit 3]            dry run
//   node scripts/promote/blogger.mjs --publish [--limit 3]  publish up to 3 articles not yet on the blog
//   add --refresh 3 to also rewrite up to 3 posts whose live summary lacks the key points or figure the current format adds
//
// Needs BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET, BLOGGER_REFRESH_TOKEN, BLOGGER_BLOG_ID (blogger-auth.mjs saves them).
// Posts already on the blog (same title) are skipped. The small default limit drips the backlog out over days.
import { refreshToken } from "./google.mjs";
import { posts, summary, toHtml } from "./posts.mjs";

const { BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET, BLOGGER_REFRESH_TOKEN, BLOGGER_BLOG_ID } = process.env;
if (!BLOGGER_REFRESH_TOKEN || !BLOGGER_BLOG_ID) throw new Error("Run blogger-auth.mjs first (Blogger secrets missing).");
const limitArg = process.argv.indexOf("--limit");
const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : 3;
const publish = process.argv.includes("--publish");
const refreshArg = process.argv.indexOf("--refresh");
const refreshLimit = refreshArg > -1 ? Number(process.argv[refreshArg + 1]) : 0;

const headers = {
  authorization: `Bearer ${await refreshToken(BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET, BLOGGER_REFRESH_TOKEN)}`,
  "content-type": "application/json",
};
const api = `https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}/posts`;

const get = (url) => fetch(url, { headers }).then((r) => r.json());
let existing = await get(`${api}?fetchBodies=true&maxResults=500&status=live&status=draft&status=scheduled&view=ADMIN`);
if (existing.error?.code === 403) {
  // Diagnose: which blogs can this login see, and does the saved blog ID match one?
  const mine = await get("https://www.googleapis.com/blogger/v3/users/self/blogs");
  console.log(
    `Saved blog ID: ${BLOGGER_BLOG_ID.length} chars. Login's blogs: ${(mine.items ?? []).map((b) => `${b.id} ${b.url}`).join(", ") || JSON.stringify(mine.error)}`
  );
  existing = await get(`${api}?fetchBodies=true&maxResults=500`);
}
if (existing.error) throw new Error(`Blogger list failed: ${existing.error.code} ${existing.error.message}`);
const done = new Set((existing.items ?? []).map((p) => p.title));
const todo = posts.filter((p) => !done.has(p.title)).slice(0, limit);
console.log(`Blogger: ${done.size} already published, ${todo.length} to ${publish ? "publish" : "publish (dry run)"}.`);

for (const [i, post] of todo.entries()) {
  if (!publish) {
    console.log(`  would publish: ${post.title}`);
    continue;
  }
  if (i > 0) await new Promise((r) => setTimeout(r, 60_000)); // Blogger rejects quick bursts with 429
  const res = await fetch(api, {
    method: "POST",
    headers,
    body: JSON.stringify({ title: post.title, content: toHtml(summary(post)), labels: post.tags }),
  });
  const body = await res.json();
  if (res.status === 429) {
    console.log(`Blogger rate limit reached; stopping here. The next run continues from: ${post.title}`);
    break;
  }
  if (!res.ok) throw new Error(`Blogger insert failed: ${res.status} ${body.error?.message}`);
  console.log(`  ${body.url}`);
}

const byTitle = new Map(posts.map((p) => [p.title, p]));
// Blogger's `updated` doesn't reliably change on PATCH, so decide by content: refresh only when the current
// format would add key points or a figure that the live summary doesn't have yet.
const needsRefresh = (item) => {
  const post = byTitle.get(item.title);
  if (!post || item.status === "DRAFT") return false;
  const html = toHtml(summary(post));
  const live = item.content ?? "";
  return (html.includes("Key points") && !live.includes("Key points")) || (html.includes("<figure>") && !live.includes("<img"));
};
const stale = (existing.items ?? []).filter(needsRefresh).slice(0, refreshLimit);
if (refreshLimit) console.log(`Blogger refresh: ${stale.length} of the older summaries to ${publish ? "rewrite" : "rewrite (dry run)"}.`);
for (const item of stale) {
  if (!publish) {
    console.log(`  would refresh: ${item.title}`);
    continue;
  }
  await new Promise((r) => setTimeout(r, 60_000));
  const res = await fetch(`${api}/${item.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ content: toHtml(summary(byTitle.get(item.title))) }),
  });
  if (res.status === 429) {
    console.log("Blogger rate limit reached during refresh; the next run continues.");
    break;
  }
  if (!res.ok) throw new Error(`Blogger refresh failed: ${res.status} ${(await res.json()).error?.message}`);
  console.log(`  refreshed ${item.url}`);
}
