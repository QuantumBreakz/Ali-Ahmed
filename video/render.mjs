// Render every composition to ../public/videos/<id>.mp4 plus a poster image, ready for the site.
//   npm run render            all videos
//   npm run render -- <id>    one video
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const out = new URL("../public/videos/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const all = ["kyc-pipeline", "mrz-check-digit", "slo-burn-rate"];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
const posterFrame = { "kyc-pipeline": 520, "mrz-check-digit": 600, "slo-burn-rate": 560 };

for (const id of ids) {
  const run = (...args) => execFileSync("npx", ["remotion", ...args], { stdio: "inherit" });
  // ponytail: CRF 28 keeps flat-colour explainers small (~1 MB); lower it if detailed footage is ever added.
  run("render", "src/index.ts", id, `${out}${id}.mp4`, "--codec=h264", "--crf=28", "--pixel-format=yuv420p");
  run("still", "src/index.ts", id, `${out}${id}.jpg`, `--frame=${posterFrame[id]}`, "--image-format=jpeg", "--jpeg-quality=85");
}
