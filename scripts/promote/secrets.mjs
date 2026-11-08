// Save a value as a GitHub Actions secret without printing it: the value goes to `gh` on stdin.
import { spawnSync } from "node:child_process";

export const REPO = "QuantumBreakz/Ali-Ahmed";

export function saveSecret(name, value) {
  const result = spawnSync("gh", ["secret", "set", name, "--repo", REPO], { input: value, stdio: ["pipe", "inherit", "inherit"] });
  if (result.status !== 0) throw new Error(`gh secret set ${name} failed. Is the GitHub CLI installed and logged in (gh auth login)?`);
  console.log(`Saved ${name} as a GitHub secret on ${REPO}.`);
}

// Ask for values in the terminal through one shared reader, so piped or pasted input is never lost.
// Hidden answers are not echoed, which keeps keys off the screen and out of shell history.
import { createInterface } from "node:readline";

let reader;
let lines;
let muted = false;

export async function ask(question, { hidden = false } = {}) {
  if (!reader) {
    reader = createInterface({ input: process.stdin, output: process.stdout, terminal: Boolean(process.stdin.isTTY) });
    reader._writeToOutput = (s) => muted || reader.output.write(s);
    lines = reader[Symbol.asyncIterator]();
  }
  process.stdout.write(question);
  muted = hidden;
  const { value = "" } = await lines.next();
  muted = false;
  if (hidden || !process.stdin.isTTY) process.stdout.write("\n");
  return value.trim();
}

export function doneAsking() {
  reader?.close();
}
