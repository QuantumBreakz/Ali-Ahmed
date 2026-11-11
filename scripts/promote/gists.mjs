// Publish each post's code as a public GitHub Gist that links back to the post.
//
//   node scripts/promote/gists.mjs            dry run: lists the gists it would create
//   node scripts/promote/gists.mjs --publish  creates them
//
// Auth: GIST_TOKEN (a GitHub token with the gist scope), or, locally, your `gh auth token`.
// A post gets one gist holding every fenced code block plus a README linking the post. Posts that
// already have a gist (matched by the post URL in its description) are skipped, so re-running is safe.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { posts } from "./posts.mjs";

const publish = process.argv.includes("--publish");
const EXT = {
  python: "py",
  py: "py",
  ts: "ts",
  typescript: "ts",
  js: "js",
  javascript: "js",
  bash: "sh",
  sh: "sh",
  json: "json",
  yaml: "yml",
  yml: "yml",
  sql: "sql",
  tsx: "tsx",
  go: "go",
  rust: "rs",
  java: "java",
  text: "txt",
};

function codeFiles(slug) {
  const source = readFileSync(new URL(`../../src/content/blog/${slug}.mdx`, import.meta.url), "utf8");
  const files = {};
  for (const [, lang, meta, body] of source.matchAll(/^```(\w+)([^\n]*)\n([\s\S]*?)^```$/gm)) {
    const title = meta.match(/title="([^"]+)"/)?.[1] ?? "";
    const ext = EXT[lang] ?? "txt";
    let name = /\.\w+$/.test(title.split(" ")[0])
      ? title.split(" ")[0]
      : `${title || "snippet"}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") + `.${ext}`;
    for (let n = 2; files[name]; n++) name = name.replace(/(-\d+)?(\.\w+)$/, `-${n}$2`);
    files[name] = { content: body };
  }
  return files;
}

const token =
  process.env.GIST_TOKEN ??
  (() => {
    try {
      return execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
    } catch {
      return "";
    }
  })();
const api = (path, init = {}) =>
  fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", ...init.headers },
  });

const existing = new Set();
if (token) {
  for (let page = 1; ; page++) {
    const res = await api(`/gists?per_page=100&page=${page}`);
    if (!res.ok) throw new Error(`GitHub rejected the token: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    for (const g of batch) for (const m of (g.description ?? "").matchAll(/https:\/\/aliahmed\.si\/blog\/[a-z0-9-]+\//g)) existing.add(m[0]);
    if (batch.length < 100) break;
  }
} else if (publish) {
  throw new Error("Set GIST_TOKEN or log in with `gh auth login`.");
}

let created = 0;
let failed = 0;
for (const post of posts) {
  const files = codeFiles(post.slug);
  if (Object.keys(files).length === 0) continue;
  if (existing.has(post.url)) {
    console.log(`skip (gist exists): ${post.slug}`);
    continue;
  }
  files["README.md"] = {
    content: `# ${post.title}\n\n${post.description}\n\nCode from the article: ${post.url}\n\nBy [Ali Ahmed](https://aliahmed.si), AI engineer.\n`,
  };
  const description = `${post.title}: code from ${post.url}`;
  if (!publish) {
    console.log(`would create: ${post.slug} (${Object.keys(files).join(", ")})`);
    continue;
  }
  const res = await api("/gists", { method: "POST", body: JSON.stringify({ description, public: true, files }) });
  if (!res.ok) {
    failed++;
    console.error(`FAILED ${post.slug}: ${res.status} ${await res.text()}`);
    continue;
  }
  created++;
  console.log(`created: ${(await res.json()).html_url} → ${post.url}`);
}
console.log(`\n${publish ? "publish" : "dry-run"}: ${created} created, ${failed} failed.`);
if (failed) process.exitCode = 1;
