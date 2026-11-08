// Get a LinkedIn access token for posting to your own profile, and save it as GitHub secrets.
//
//   node scripts/promote/linkedin-token.mjs
//
// One-time app setup (linkedin.com/developers/apps): create an app, add the products
// "Share on LinkedIn" and "Sign In with LinkedIn using OpenID Connect", and under Auth add the
// redirect URL http://localhost:8765/callback. Tokens last 60 days; run this again to renew.
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { ask, doneAsking, saveSecret } from "./secrets.mjs";

const redirectUri = "http://localhost:8765/callback";
const clientId = await ask("LinkedIn app Client ID: ");
const clientSecret = await ask("LinkedIn app Client Secret (hidden): ", { hidden: true });
doneAsking();
const state = randomBytes(16).toString("hex");

const authorize = new URL("https://www.linkedin.com/oauth/v2/authorization");
authorize.search = new URLSearchParams({
  response_type: "code",
  client_id: clientId,
  redirect_uri: redirectUri,
  state,
  scope: "openid profile w_member_social",
}).toString();

const code = await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const url = new URL(req.url, redirectUri);
    if (url.pathname !== "/callback") return res.writeHead(404).end();
    const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");
    const valid = !error && url.searchParams.get("state") === state && url.searchParams.get("code");
    res
      .writeHead(200, { "content-type": "text/plain" })
      .end(valid ? "LinkedIn connected. You can close this tab." : `Failed: ${error ?? "state mismatch"}`);
    server.close();
    valid ? resolve(url.searchParams.get("code")) : reject(new Error(error ?? "State mismatch: start again."));
  }).listen(8765, "127.0.0.1", () => {
    console.log(`Opening LinkedIn to approve access. If nothing opens, visit:\n${authorize}\n`);
    execFile("open", [authorize.toString()], () => {});
  });
});

const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: clientId, client_secret: clientSecret }),
});
if (!tokenRes.ok) throw new Error(`Token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
const { access_token, expires_in } = await tokenRes.json();

const me = await fetch("https://api.linkedin.com/v2/userinfo", { headers: { authorization: `Bearer ${access_token}` } });
if (!me.ok) throw new Error(`Could not read your profile id: ${me.status} ${await me.text()}`);
const { sub, name } = await me.json();

saveSecret("LINKEDIN_ACCESS_TOKEN", access_token);
saveSecret("LINKEDIN_PERSON_URN", `urn:li:person:${sub}`);
const expires = new Date(Date.now() + expires_in * 1000).toISOString().slice(0, 10);
console.log(`\nConnected as ${name}. The token expires on ${expires}; run this script again before then.`);
