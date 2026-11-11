// Save a value as a GitHub Actions secret without printing it: the value goes to `gh` on stdin.
import { spawnSync } from "node:child_process";

export const REPO = "QuantumBreakz/Ali-Ahmed";

export function saveSecret(name, value) {
  const result = spawnSync("gh", ["secret", "set", name, "--repo", REPO], { input: value, stdio: ["pipe", "inherit", "inherit"] });
  if (result.status !== 0) throw new Error(`gh secret set ${name} failed. Is the GitHub CLI installed and logged in (gh auth login)?`);
  console.log(`Saved ${name} as a GitHub secret on ${REPO}.`);
}
