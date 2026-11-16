// One-time Blogger setup: sign in with Google in your browser and save the refresh token as GitHub secrets.
//
//   node scripts/promote/blogger-auth.mjs --client ~/Downloads/client_secret_XXX.json --blog-url https://YOURBLOG.blogspot.com/
//
// The client file is an OAuth client of type "Desktop app" from Google Cloud (Blogger API v3 enabled).
// Saves BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET, BLOGGER_REFRESH_TOKEN and BLOGGER_BLOG_ID. Nothing is printed.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { saveSecret } from "./secrets.mjs";

const arg = (name) => process.argv[process.argv.indexOf(name) + 1];
const { installed } = JSON.parse(readFileSync(arg("--client"), "utf8"));
if (!installed) throw new Error("Use an OAuth client of type 'Desktop app'.");
const blogUrl = arg("--blog-url");

const server = createServer();
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const redirect = `http://127.0.0.1:${server.address().port}`;
const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
auth.search = new URLSearchParams({
  client_id: installed.client_id,
  redirect_uri: redirect,
  response_type: "code",
  scope: "https://www.googleapis.com/auth/blogger",
  access_type: "offline",
  prompt: "consent",
});
console.log(`Opening Google sign-in. If no browser opens, visit:\n${auth}`);
execFile("open", [auth.href]);

const code = await new Promise((resolve, reject) =>
  server.on("request", (req, res) => {
    const params = new URL(req.url, redirect).searchParams;
    res.end(params.get("code") ? "Blogger connected. You can close this tab." : "Sign-in failed.");
    server.close();
    params.get("code") ? resolve(params.get("code")) : reject(new Error(params.get("error") ?? "no code"));
  })
);

const tokens = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  body: new URLSearchParams({
    code,
    client_id: installed.client_id,
    client_secret: installed.client_secret,
    redirect_uri: redirect,
    grant_type: "authorization_code",
  }),
}).then((r) => r.json());
if (!tokens.refresh_token) throw new Error(`No refresh token returned: ${tokens.error ?? "unknown error"}`);

const blog = await fetch(`https://www.googleapis.com/blogger/v3/blogs/byurl?url=${encodeURIComponent(blogUrl)}`, {
  headers: { authorization: `Bearer ${tokens.access_token}` },
}).then((r) => r.json());
if (!blog.id) throw new Error(`Blog not found at ${blogUrl}: ${JSON.stringify(blog.error ?? blog)}`);

saveSecret("BLOGGER_CLIENT_ID", installed.client_id);
saveSecret("BLOGGER_CLIENT_SECRET", installed.client_secret);
saveSecret("BLOGGER_REFRESH_TOKEN", tokens.refresh_token);
saveSecret("BLOGGER_BLOG_ID", blog.id);
console.log(`Connected to "${blog.name}".`);
