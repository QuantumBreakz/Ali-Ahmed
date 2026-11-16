// Publish a short summary page per post on Telegraph (telegra.ph), linking to the full article.
//
//   node scripts/promote/telegraph.mjs --setup                one-time: create the account, save TELEGRAPH_TOKEN
//   node scripts/promote/telegraph.mjs [--limit 5]            dry run
//   node scripts/promote/telegraph.mjs --publish [--limit 5]  publish up to 5 posts not yet on Telegraph
//
// No signup or key needed: the API issues a token on createAccount. telegra.ph is blocked on some networks;
// if --setup times out, run it on a VPN or another connection (CI reaches it fine).
import { posts, SITE, summary } from "./posts.mjs";
import { saveSecret } from "./secrets.mjs";

const api = async (method, params) => {
  const res = await fetch(`https://api.telegra.ph/${method}`, { method: "POST", body: new URLSearchParams(params) });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegraph ${method} failed: ${data.error}`);
  return data.result;
};
const AUTHOR = { author_name: "Ali Ahmed", author_url: `${SITE}/` };

if (process.argv.includes("--setup")) {
  const account = await api("createAccount", { short_name: "aliahmed", ...AUTHOR });
  saveSecret("TELEGRAPH_TOKEN", account.access_token);
  process.exit(0);
}

const token = process.env.TELEGRAPH_TOKEN;
if (!token) throw new Error("Set TELEGRAPH_TOKEN (run with --setup once).");
const limitArg = process.argv.indexOf("--limit");
const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : 5;
const publish = process.argv.includes("--publish");

const { pages = [] } = await api("getPageList", { access_token: token, limit: "200" });
const done = new Set(pages.map((p) => p.title));
const todo = posts.filter((p) => !done.has(p.title)).slice(0, limit);
console.log(`Telegraph: ${done.size} already published, ${todo.length} to ${publish ? "publish" : "publish (dry run)"}.`);

for (const post of todo) {
  if (!publish) {
    console.log(`  would publish: ${post.title}`);
    continue;
  }
  const page = await api("createPage", { access_token: token, title: post.title, ...AUTHOR, content: JSON.stringify(summary(post)) });
  console.log(`  ${page.url}`);
}
