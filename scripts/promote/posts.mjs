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

// A short summary of a post as Telegraph-style nodes: the opening paragraph (with its links made absolute)
// and the section headings. Platforms get this plus a link to the full article, never a full copy.
const inline = (md) =>
  md
    .split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("**")) return { tag: "b", children: [part.slice(2, -2)] };
      if (part.startsWith("`")) return { tag: "code", children: [part.slice(1, -1)] };
      const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (link) return { tag: "a", attrs: { href: new URL(link[2], SITE).href }, children: inline(link[1]) };
      return part;
    });

export function summary(post) {
  const body = readFileSync(new URL(`${post.slug}.mdx`, folder), "utf8").replace(/^---\n[\s\S]*?\n---\n/, "");
  const lead = body.split(/\n\n+/).find((p) => /^[A-Za-z*]/.test(p.trim()));
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]).filter((h) => !/^(Related|Summary|Further reading)/.test(h));
  const fig = body.match(/^!\[([^\]]*)\]\((\/figures\/[^)\s]+)\.webp\)\s*\n+_(.+)_\s*$/m);
  const points = (body.split(/^## Summary\s*$/m)[1] ?? "")
    .split(/\n## /)[0]
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => ({ tag: "li", children: inline(l.slice(2).trim()) }));
  return [
    { tag: "p", children: inline(lead.trim().replace(/\n/g, " ")) },
    ...(fig
      ? [
          {
            tag: "figure",
            children: [
              { tag: "img", attrs: { src: `${SITE}${fig[2]}.jpg`, alt: fig[1] } },
              { tag: "figcaption", children: [fig[3]] },
            ],
          },
        ]
      : []),
    ...(points.length
      ? [
          { tag: "h4", children: ["Key points"] },
          { tag: "ul", children: points },
        ]
      : []),
    { tag: "h4", children: ["What the full article covers"] },
    { tag: "ul", children: headings.map((h) => ({ tag: "li", children: inline(h) })) },
    { tag: "p", children: ["Read the full article, with code, on ", { tag: "a", attrs: { href: post.url }, children: ["aliahmed.si"] }, "."] },
    {
      tag: "p",
      children: [
        {
          tag: "i",
          children: [
            "By ",
            { tag: "a", attrs: { href: `${SITE}/` }, children: ["Ali Ahmed"] },
            " (QuantumBreakz on GitHub), AI engineer in Lahore who builds LLM systems and KYC computer vision and OCR, and contributes to open-source AI and developer infrastructure.",
          ],
        },
      ],
    },
  ];
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const toHtml = (nodes) =>
  nodes
    .map((n) =>
      typeof n === "string"
        ? esc(n)
        : n.tag === "img"
          ? `<img src="${esc(n.attrs.src)}" alt="${esc(n.attrs.alt ?? "")}" loading="lazy" style="max-width:100%;height:auto">`
          : `<${n.tag}${n.attrs?.href ? ` href="${esc(n.attrs.href)}"` : ""}>${toHtml(n.children ?? [])}</${n.tag}>`
    )
    .join("");
