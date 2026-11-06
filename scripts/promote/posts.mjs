// Published blog posts, read from the content folder's front matter.
import { readFileSync, readdirSync } from "node:fs";

export const SITE = "https://aliahmed.si";
const folder = new URL("../../src/content/blog/", import.meta.url);

function frontmatter(src) {
  const fm = src.match(/^---\n([\s\S]*?)\n---/)[1];
  const get = (k) =>
    fm
      .match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1]
      .trim()
      .replace(/^"(.*)"$/, "$1");
  return {
    title: get("title"),
    description: get("description"),
    draft: get("draft") === "true",
    tags: (get("tags") ?? "[]")
      .replace(/[[\]]/g, "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };
}

export const posts = readdirSync(folder)
  .filter((f) => /^[a-z0-9-]+\.mdx?$/.test(f))
  .map((f) => {
    const slug = f.replace(/\.mdx?$/, "");
    return { slug, url: `${SITE}/blog/${slug}/`, ...frontmatter(readFileSync(new URL(f, folder), "utf8")) };
  })
  .filter((p) => !p.draft);
