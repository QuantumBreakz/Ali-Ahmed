// Announce new posts on Bluesky and Mastodon.
//
//   node scripts/promote/announce.mjs <slug> [<slug> …]
//
// Bluesky needs BLUESKY_HANDLE and BLUESKY_APP_PASSWORD (an app password, never the account password).
// Mastodon needs MASTODON_INSTANCE (e.g. https://fosstodon.org) and MASTODON_TOKEN (scope write:statuses).
// A network whose variables are unset is skipped. Without any, the script prints what it would post.
import { posts } from "./posts.mjs";

const slugs = process.argv.slice(2).filter((s) => /^[a-z0-9-]+$/.test(s));
const chosen = posts.filter((p) => slugs.includes(p.slug));
if (chosen.length === 0) {
  console.log("No new posts to announce.");
  process.exit(0);
}

const { BLUESKY_HANDLE, BLUESKY_APP_PASSWORD, MASTODON_INSTANCE, MASTODON_TOKEN } = process.env;
const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);
let failed = 0;

async function bluesky(post) {
  const session = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identifier: BLUESKY_HANDLE, password: BLUESKY_APP_PASSWORD }),
  }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Bluesky login ${r.status}`))));
  const lead = `${clip(post.title, 200)}\n\n`;
  const text = lead + post.url;
  const byteStart = Buffer.byteLength(lead);
  const record = {
    $type: "app.bsky.feed.post",
    text,
    createdAt: new Date().toISOString(),
    facets: [
      {
        index: { byteStart, byteEnd: byteStart + Buffer.byteLength(post.url) },
        features: [{ $type: "app.bsky.richtext.facet#link", uri: post.url }],
      },
    ],
    embed: { $type: "app.bsky.embed.external", external: { uri: post.url, title: post.title, description: clip(post.description, 300) } },
  };
  const res = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${session.accessJwt}` },
    body: JSON.stringify({ repo: session.did, collection: "app.bsky.feed.post", record }),
  });
  if (!res.ok) throw new Error(`Bluesky post ${res.status} ${await res.text()}`);
}

async function mastodon(post) {
  const status = `${clip(post.title, 200)}\n\n${clip(post.description, 220)}\n\n${post.url}`;
  const res = await fetch(`${MASTODON_INSTANCE.replace(/\/$/, "")}/api/v1/statuses`, {
    method: "POST",
    headers: { authorization: `Bearer ${MASTODON_TOKEN}`, "content-type": "application/json", "idempotency-key": post.slug },
    body: JSON.stringify({ status, visibility: "public" }),
  });
  if (!res.ok) throw new Error(`Mastodon post ${res.status} ${await res.text()}`);
}

const networks = [
  BLUESKY_HANDLE && BLUESKY_APP_PASSWORD && ["Bluesky", bluesky],
  MASTODON_INSTANCE && MASTODON_TOKEN && ["Mastodon", mastodon],
].filter(Boolean);

for (const post of chosen) {
  if (networks.length === 0) console.log(`would announce: ${post.title} → ${post.url}`);
  for (const [name, send] of networks) {
    try {
      await send(post);
      console.log(`${name}: announced ${post.url}`);
    } catch (error) {
      failed++;
      console.error(`${name}: FAILED ${post.url}: ${error.message}`);
    }
  }
}
if (failed) process.exitCode = 1;
