// Tell IndexNow engines (Bing, Yandex, Seznam, Naver, …) about every URL in the live sitemap.
// Run after a deploy: node scripts/promote/indexnow.mjs
// The key file lives at public/<key>.txt and is served at https://aliahmed.si/<key>.txt.
import { readdirSync } from "node:fs";

const host = "aliahmed.si";
const key = readdirSync(new URL("../../public/", import.meta.url))
  .find((f) => /^[0-9a-f]{32}\.txt$/.test(f))
  ?.slice(0, -4);
if (!key) throw new Error("No IndexNow key file in public/");

const keyOnSite = await fetch(`https://${host}/${key}.txt`).then((r) => (r.ok ? r.text() : ""));
if (keyOnSite.trim() !== key) throw new Error(`https://${host}/${key}.txt is not live yet: deploy first`);

const xml = async (url) => (await fetch(url)).text();
const locs = (doc) => [...doc.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const urls = (await Promise.all(locs(await xml(`https://${host}/sitemap-index.xml`)).map(async (s) => locs(await xml(s))))).flat();

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls }),
});
console.log(`IndexNow: submitted ${urls.length} URLs → ${res.status} ${res.statusText}`);
if (!res.ok && res.status !== 202) process.exitCode = 1;
