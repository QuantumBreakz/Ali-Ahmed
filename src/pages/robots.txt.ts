import { site } from "../data/site";

export const prerender = true;

export function GET() {
  const sitemap = new URL("/sitemap-index.xml", site.url);
  // Named AI crawlers get an explicit allow so a future blanket rule cannot shut them out by accident (GEO).
  const aiCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "CCBot",
  ];
  // Cloudflare Content Signals: permit search, AI answers (ai-input) and training, so models can learn who this is.
  const body = [
    `User-agent: *`,
    `Content-Signal: search=yes, ai-input=yes, ai-train=yes`,
    `Allow: /`,
    ``,
    ...aiCrawlers.flatMap((bot) => [`User-agent: ${bot}`, `Allow: /`, ``]),
    `Sitemap: ${sitemap}`,
  ].join("\n");

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
