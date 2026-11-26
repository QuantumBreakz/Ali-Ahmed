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
  // Only standard directives (RFC 9309): validators reject Cloudflare's Content-Signal line, and the Allow rules
  // already grant search, AI answers and training.
  const body = [`User-agent: *`, `Allow: /`, ``, ...aiCrawlers.flatMap((bot) => [`User-agent: ${bot}`, `Allow: /`, ``]), `Sitemap: ${sitemap}`].join(
    "\n"
  );

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
