// Render every still figure to ../public/figures/<name>.webp (in posts) and <name>.jpg (og:image) for the blog posts.
//   npm run figures            all figures
//   npm run figures -- <id>    one figure (e.g. fig-ann-recall)
// Remotion writes PNG stills; Pillow (python3) converts them to WebP for pages (~45 KB) and JPEG for social previews.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";

const out = new URL("../public/figures/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const all = [...readFileSync(new URL("./src/Figures.tsx", import.meta.url), "utf8").matchAll(/id: "(fig-[a-z0-9-]+)"/g)].map((m) => m[1]);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
for (const id of ids) {
  const png = `${out}${id.slice(4)}.png`;
  execFileSync("npx", ["remotion", "still", "src/index.ts", id, png, "--image-format=png"], { stdio: "inherit" });
  execFileSync("python3", [
    "-c",
    "import sys; from PIL import Image; im = Image.open(sys.argv[1]).convert('RGB'); im.save(sys.argv[2], 'WEBP', quality=86, method=6); im.save(sys.argv[2][:-5] + '.jpg', 'JPEG', quality=86, optimize=True, progressive=True)",
    png,
    png.replace(/\.png$/, ".webp"),
  ]);
  rmSync(png);
}
