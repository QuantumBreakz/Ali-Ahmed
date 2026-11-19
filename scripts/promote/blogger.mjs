// Publish a short summary post per article on your Blogger (blogspot.com) blog, linking to the full article.
//
//   node scripts/promote/blogger.mjs [--limit 3]            dry run
//   node scripts/promote/blogger.mjs --publish [--limit 3]  publish up to 3 articles not yet on the blog
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

const headers = {
  authorization: `Bearer ${await refreshToken(BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET, BLOGGER_REFRESH_TOKEN)}`,
  "content-type": "application/json",
};
const api = `https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}/posts`;

const existing = await fetch(`${api}?fetchBodies=false&maxResults=500&status=live&status=draft&status=scheduled&view=ADMIN`, { headers }).then((r) => r.json());
if (existing.error) {
  const hint = existing.error.code === 403 ? " Check the saved login is an admin of this blog (re-run blogger-auth.mjs)." : "";
  throw new Error(`Blogger list failed: ${existing.error.message}.${hint}`);
}
const done = new Set((existing.items ?? []).map((p) => p.title));
const todo = posts.filter((p) => !done.has(p.title)).slice(0, limit);
console.log(`Blogger: ${done.size} already published, ${todo.length} to ${publish ? "publish" : "publish (dry run)"}.`);

for (const post of todo) {
  if (!publish) {
    console.log(`  would publish: ${post.title}`);
    continue;
  }
  const res = await fetch(api, {
    method: "POST",
    headers,
    body: JSON.stringify({ title: post.title, content: toHtml(summary(post)), labels: post.tags }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Blogger insert failed: ${res.status} ${body.error?.message}`);
  console.log(`  ${body.url}`);
}
