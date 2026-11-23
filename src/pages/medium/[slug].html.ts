// Plain-HTML copy of each post for Medium's importer, which drops the site's code blocks, tables and lead.
// Not linked anywhere and noindex. No rel=canonical: Medium follows it and imports the original page instead,
// so the canonical is set to the real article in each Medium story's settings after import.
import type { APIRoute } from "astro";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { getPublishedBlog, getWritingPath } from "../../lib/blog-source";
import { getBlogExport } from "../../lib/blog-export";

type Node = { type: string; children?: Node[]; value?: string; url?: string; depth?: number };

const cellText = (n: Node): string => n.value ?? (n.children ?? []).map(cellText).join("");

// Medium has no tables: each row becomes "**First cell**: Header: value; Header: value".
function tablesToLists(node: Node) {
  node.children = (node.children ?? []).map((child) => {
    if (child.type !== "table") return (tablesToLists(child), child);
    const [head, ...rows] = child.children ?? [];
    const headers = (head.children ?? []).map(cellText);
    return {
      type: "list",
      ordered: false,
      children: rows.map((row) => {
        const [first, ...rest] = row.children ?? [];
        const parts: Node[] = [{ type: "strong", children: first.children ?? [] }];
        rest.forEach((cell, i) => parts.push({ type: "text", value: `${i ? "; " : ": "}${headers[i + 1]}: ` }, ...(cell.children ?? [])));
        return { type: "listItem", children: [{ type: "paragraph", children: parts }] };
      }),
    } as Node;
  });
}

function fixImages(node: Node) {
  if (node.type === "image" && node.url) node.url = node.url.replace(/^https:\/\/aliahmed\.si(\/figures\/[^/]+)\.webp$/, "$1.jpg");
  node.children?.forEach(fixImages);
}

const icons =
  '<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="16x16 32x32 48x48">' +
  '<link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96">' +
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any">' +
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">';

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export async function getStaticPaths() {
  return (await getPublishedBlog()).map((entry) => ({ params: { slug: getWritingPath(entry).split("/")[2] }, props: { entry } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: Awaited<ReturnType<typeof getPublishedBlog>>[number] };
  const { markdownContent } = getBlogExport(entry);
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdownContent) as unknown as Node;
  // Drop the h1 (it becomes <title>) and the "Published:" line; the description paragraph stays as the lead.
  tree.children = (tree.children ?? []).filter(
    (n, i) => !(n.type === "heading" && n.depth === 1) && !(i < 4 && n.type === "paragraph" && /^Published:/.test(cellText(n)))
  );
  tablesToLists(tree);
  fixImages(tree);
  const hast = await unified()
    .use(remarkRehype)
    .run(tree as never);
  const body = unified()
    .use(rehypeStringify)
    .stringify(hast as never);
  const title = escape(entry.data.title);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><meta name="robots" content="noindex">${icons}</head><body><main><article><h1>${title}</h1>${body}</article></main></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
};
