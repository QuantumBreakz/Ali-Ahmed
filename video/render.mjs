// Render every composition to ../public/videos/<id>.mp4 plus a poster image, ready for the site.
//   npm run render            all videos
//   npm run render -- <id>    one video
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const out = new URL("../public/videos/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const all = ["kyc-pipeline", "mrz-check-digit", "slo-burn-rate", "approval-flow", "ssrf-guard"];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
const posterFrame = { "kyc-pipeline": 330, "mrz-check-digit": 420, "slo-burn-rate": 560, "approval-flow": 470, "ssrf-guard": 400 };

for (const id of ids) {
  const run = (...args) => execFileSync("npx", ["remotion", ...args], { stdio: "inherit" });
  // ponytail: CRF 28 keeps flat-colour explainers small (under 1 MB at 1080p); lower it if detailed footage is ever added.
  run("render", "src/index.ts", id, `${out}${id}.mp4`, "--codec=h264", "--crf=26", "--pixel-format=yuv420p");
  run("still", "src/index.ts", id, `${out}${id}.jpg`, `--frame=${posterFrame[id]}`, "--image-format=jpeg", "--jpeg-quality=85");
}
