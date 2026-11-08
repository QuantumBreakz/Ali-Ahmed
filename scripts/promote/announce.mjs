// Announce new posts on social networks.
//
//   node scripts/promote/announce.mjs <slug> [<slug> …]
//
// Each network runs only when its variables are set (as GitHub secrets in CI, or exported locally):
//   Bluesky   BLUESKY_HANDLE, BLUESKY_APP_PASSWORD           (an app password, never the account password)
//   Mastodon  MASTODON_INSTANCE, MASTODON_TOKEN              (token scope: write:statuses)
//   LinkedIn  LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_URN     (from scripts/promote/linkedin-token.mjs; expires after 60 days)
//   Threads   THREADS_ACCESS_TOKEN                           (from scripts/promote/threads-token.mjs; expires after 60 days)
//   X         X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET   (pay-per-use: each link post is billed)
//   Telegram  TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID           (chat id like @yourchannel; the bot must be a channel admin)
// Without any, the script prints what it would post.
import { createHmac, randomBytes } from "node:crypto";
import { posts } from "./posts.mjs";

const slugs = process.argv.slice(2).filter((s) => /^[a-z0-9-]+$/.test(s));
const chosen = posts.filter((p) => slugs.includes(p.slug));
if (chosen.length === 0) {
  console.log("No new posts to announce.");
  process.exit(0);
}

const env = process.env;
const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ok(res, what) {
  if (!res.ok) throw new Error(`${what} ${res.status} ${await res.text()}`);
  return res.status === 204 ? {} : res.json().catch(() => ({}));
}

async function bluesky(post) {
  const session = await ok(
    await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ identifier: env.BLUESKY_HANDLE, password: env.BLUESKY_APP_PASSWORD }),
    }),
    "login"
  );
  const lead = `${clip(post.title, 200)}\n\n`;
  const byteStart = Buffer.byteLength(lead);
  const record = {
    $type: "app.bsky.feed.post",
    text: lead + post.url,
    createdAt: new Date().toISOString(),
    facets: [
      {
        index: { byteStart, byteEnd: byteStart + Buffer.byteLength(post.url) },
        features: [{ $type: "app.bsky.richtext.facet#link", uri: post.url }],
      },
    ],
    embed: { $type: "app.bsky.embed.external", external: { uri: post.url, title: post.title, description: clip(post.description, 300) } },
  };
  await ok(
    await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${session.accessJwt}` },
      body: JSON.stringify({ repo: session.did, collection: "app.bsky.feed.post", record }),
    }),
    "post"
  );
}

async function mastodon(post) {
  const status = `${clip(post.title, 200)}\n\n${clip(post.description, 220)}\n\n${post.url}`;
  await ok(
    await fetch(`${env.MASTODON_INSTANCE.replace(/\/$/, "")}/api/v1/statuses`, {
      method: "POST",
      headers: { authorization: `Bearer ${env.MASTODON_TOKEN}`, "content-type": "application/json", "idempotency-key": post.slug },
      body: JSON.stringify({ status, visibility: "public" }),
    }),
    "post"
  );
}

// LinkedIn's "little text" format treats these characters as markup, so plain text must escape them.
const linkedinText = (text) => text.replace(/[\\|{}@[\]()<>#*_~]/g, (c) => `\\${c}`);

// LinkedIn retires API versions after about a year; three months back is always live unless overridden.
function linkedinVersion() {
  if (env.LINKEDIN_VERSION) return env.LINKEDIN_VERSION;
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - 3);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function linkedin(post) {
  await ok(
    await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
        "content-type": "application/json",
        "linkedin-version": linkedinVersion(),
        "x-restli-protocol-version": "2.0.0",
      },
      body: JSON.stringify({
        author: env.LINKEDIN_PERSON_URN,
        commentary: linkedinText(`${post.title}\n\n${clip(post.description, 600)}`),
        visibility: "PUBLIC",
        distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
        content: { article: { source: post.url, title: post.title, description: clip(post.description, 250) } },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
    }),
    "post"
  );
}

async function threads(post) {
  const base = "https://graph.threads.net/v1.0";
  const token = encodeURIComponent(env.THREADS_ACCESS_TOKEN);
  const me = await ok(await fetch(`${base}/me?fields=id&access_token=${token}`), "profile");
  const text = encodeURIComponent(`${clip(post.title, 200)}\n\n${clip(post.description, 200)}`);
  const container = await ok(
    await fetch(`${base}/${me.id}/threads?media_type=TEXT&text=${text}&link_attachment=${encodeURIComponent(post.url)}&access_token=${token}`, {
      method: "POST",
    }),
    "container"
  );
  // Meta asks callers to give a container time to process before publishing it.
  await sleep(15_000);
  await ok(await fetch(`${base}/${me.id}/threads_publish?creation_id=${container.id}&access_token=${token}`, { method: "POST" }), "publish");
}

// OAuth 1.0a user-context signature (RFC 5849). A JSON body is not part of the signature base string.
function xAuthHeader(method, url) {
  const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  const oauth = {
    oauth_consumer_key: env.X_API_KEY,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: env.X_ACCESS_TOKEN,
    oauth_version: "1.0",
  };
  const params = Object.keys(oauth)
    .sort()
    .map((k) => `${enc(k)}=${enc(oauth[k])}`)
    .join("&");
  const base = [method, enc(url), enc(params)].join("&");
  oauth.oauth_signature = createHmac("sha1", `${enc(env.X_API_SECRET)}&${enc(env.X_ACCESS_TOKEN_SECRET)}`)
    .update(base)
    .digest("base64");
  return (
    "OAuth " +
    Object.keys(oauth)
      .sort()
      .map((k) => `${enc(k)}="${enc(oauth[k])}"`)
      .join(", ")
  );
}

async function x(post) {
  const url = "https://api.x.com/2/tweets";
  await ok(
    await fetch(url, {
      method: "POST",
      headers: { authorization: xAuthHeader("POST", url), "content-type": "application/json" },
      body: JSON.stringify({ text: `${clip(post.title, 200)}\n\n${post.url}` }),
    }),
    "post"
  );
}

async function telegram(post) {
  await ok(
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `${post.title}\n\n${clip(post.description, 400)}\n\n${post.url}` }),
    }),
    "send"
  );
}

const networks = [
  env.BLUESKY_HANDLE && env.BLUESKY_APP_PASSWORD && ["Bluesky", bluesky],
  env.MASTODON_INSTANCE && env.MASTODON_TOKEN && ["Mastodon", mastodon],
  env.LINKEDIN_ACCESS_TOKEN && env.LINKEDIN_PERSON_URN && ["LinkedIn", linkedin],
  env.THREADS_ACCESS_TOKEN && ["Threads", threads],
  env.X_API_KEY && env.X_API_SECRET && env.X_ACCESS_TOKEN && env.X_ACCESS_TOKEN_SECRET && ["X", x],
  env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && ["Telegram", telegram],
].filter(Boolean);

let failed = 0;
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
