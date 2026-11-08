// Turn a short-lived Threads token into a 60-day one (or refresh it), and save it as a GitHub secret.
//
//   node scripts/promote/threads-token.mjs            exchange a short-lived token from the Meta app dashboard
//   node scripts/promote/threads-token.mjs --refresh  extend a long-lived token that is still valid
//
// One-time app setup (developers.facebook.com/apps): create an app with the "Access the Threads API"
// use case, add the permissions threads_basic and threads_content_publish, add your Threads account as a
// tester and accept the invite in the Threads app, then use the dashboard's User Token Generator.
import { ask, doneAsking, saveSecret } from "./secrets.mjs";

const refresh = process.argv.includes("--refresh");
let url;
if (refresh) {
  const token = await ask("Current long-lived Threads token (hidden): ", { hidden: true });
  url = `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(token)}`;
} else {
  const secret = await ask("Threads app secret (hidden): ", { hidden: true });
  const token = await ask("Short-lived token from the User Token Generator (hidden): ", { hidden: true });
  url = `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${encodeURIComponent(secret)}&access_token=${encodeURIComponent(token)}`;
}

doneAsking();
const res = await fetch(url);
if (!res.ok) throw new Error(`Threads rejected the token: ${res.status} ${await res.text()}`);
const { access_token, expires_in } = await res.json();

const me = await fetch(`https://graph.threads.net/v1.0/me?fields=username&access_token=${encodeURIComponent(access_token)}`).then((r) => r.json());
saveSecret("THREADS_ACCESS_TOKEN", access_token);
const expires = new Date(Date.now() + expires_in * 1000).toISOString().slice(0, 10);
console.log(`Connected as @${me.username ?? "unknown"}. The token expires on ${expires}; run with --refresh before then.`);
