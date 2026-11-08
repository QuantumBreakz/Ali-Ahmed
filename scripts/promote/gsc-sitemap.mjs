// Submit the sitemap to Google Search Console through its API, and report what Google last read.
//
//   GSC_SERVICE_ACCOUNT_JSON="$(cat key.json)" node scripts/promote/gsc-sitemap.mjs   (CI uses the secret)
//   node scripts/promote/gsc-sitemap.mjs --key ~/Downloads/key.json [--save]         (--save stores the key as a GitHub secret)
//
// One-time setup: in Google Cloud, enable the "Google Search Console API", create a service account and
// a JSON key for it. In Search Console → Settings → Users and permissions, add the service account's email
// with Full permission. GSC_SITE defaults to the domain property sc-domain:aliahmed.si; set it to
// https://aliahmed.si/ if your property is a URL-prefix one.
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { saveSecret } from "./secrets.mjs";

const keyArg = process.argv.indexOf("--key");
const raw = keyArg > -1 ? readFileSync(process.argv[keyArg + 1], "utf8") : process.env.GSC_SERVICE_ACCOUNT_JSON;
if (!raw) throw new Error("Pass --key path/to/key.json or set GSC_SERVICE_ACCOUNT_JSON.");
const key = JSON.parse(raw);
if (process.argv.includes("--save")) saveSecret("GSC_SERVICE_ACCOUNT_JSON", raw);

const site = process.env.GSC_SITE ?? "sc-domain:aliahmed.si";
const sitemap = "https://aliahmed.si/sitemap-index.xml";

const b64 = (data) => Buffer.from(typeof data === "string" ? data : JSON.stringify(data)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
  iss: key.client_email,
  scope: "https://www.googleapis.com/auth/webmasters",
  aud: "https://oauth2.googleapis.com/token",
  iat: now,
  exp: now + 3600,
})}`;
const jwt = `${unsigned}.${createSign("RSA-SHA256").update(unsigned).sign(key.private_key, "base64url")}`;

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
});
if (!tokenRes.ok) throw new Error(`Google rejected the service account: ${tokenRes.status} ${await tokenRes.text()}`);
const { access_token } = await tokenRes.json();

const api = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps`;
const auth = { authorization: `Bearer ${access_token}` };
const submit = await fetch(`${api}/${encodeURIComponent(sitemap)}`, { method: "PUT", headers: auth });
if (!submit.ok) {
  const hint = submit.status === 403 ? ` Add ${key.client_email} to the ${site} property with Full permission.` : "";
  throw new Error(`Sitemap submit failed: ${submit.status} ${await submit.text()}${hint}`);
}
console.log(`Search Console: submitted ${sitemap} to ${site}.`);

const { sitemap: list = [] } = await fetch(api, { headers: auth }).then((r) => r.json());
for (const s of list) {
  const submitted = s.contents?.reduce((n, c) => n + Number(c.submitted ?? 0), 0) ?? 0;
  console.log(`  ${s.path}: last read ${s.lastDownloaded ?? "never"}, ${submitted} URLs, ${s.errors ?? 0} errors, ${s.warnings ?? 0} warnings`);
}
