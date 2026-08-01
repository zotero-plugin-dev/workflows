/**
 * Release script for zotero-plugin-dev/workflows
 *
 * Computes the next version, creates the version tag, and creates a
 * GitHub Release. The major version tag (e.g. v1) is moved automatically
 * by CI once the release is published (see sync-major-tag.yml).
 *
 * Usage:
 *   pnpm run release          → 默认 bump patch
 *   pnpm run release patch
 *   pnpm run release minor
 *   pnpm run release major
 */
import { execSync } from "node:child_process";
import { createInterface } from "node:readline";

const level = process.argv[2] || "patch";

function run(cmd) {
  return execSync(cmd, { encoding: "utf-8" }).trim();
}

function runQuiet(cmd) {
  try {
    return run(cmd);
  } catch {
    return "";
  }
}

if (!["major", "minor", "patch"].includes(level)) {
  console.error("Usage: pnpm run release [major|minor|patch]");
  process.exit(1);
}

// ---- Resolve version ----

const latestTag = runQuiet('git describe --tags --abbrev=0 --match "v[0-9]*"');

function parseVersion(v) {
  const [, major, minor, patch] = v.match(/^v?(\d+)\.(\d+)\.(\d+)$/) || [];
  return { major: +major, minor: +minor, patch: +patch };
}

let next;

if (!latestTag) {
  next = { major: 1, minor: 0, patch: 0 };
} else {
  const prev = parseVersion(latestTag);
  next = { ...prev };
  if (level === "major") {
    next.major++;
    next.minor = 0;
    next.patch = 0;
  } else if (level === "minor") {
    next.minor++;
    next.patch = 0;
  } else {
    next.patch++;
  }
}

const tag = `v${next.major}.${next.minor}.${next.patch}`;

// ---- Checks ----

const branch = run("git branch --show-current");
if (branch !== "main") {
  console.error(`Not on main branch (current: ${branch}).`);
  process.exit(1);
}
run("git pull origin main");

const ahead = run("git rev-list --count origin/main..HEAD");
if (ahead !== "0") {
  console.log(`Pushing ${ahead} local commit(s) to main ...`);
  run("git push origin main");
}

// ---- Preview ----

console.log(`\n  Prev  : ${latestTag || "(none)"}`);
console.log(`  Next  : ${tag}`);
console.log(`  Major : v${next.major}`);
console.log(`  HEAD  : ${run("git rev-parse --short HEAD")}`);
console.log(`  Last  : ${run("git log -1 --oneline")}`);

// ---- Confirm ----

const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = await new Promise((resolve) => {
  rl.question("\nProceed with release? [y/N] ", resolve);
});
rl.close();

if (answer.toLowerCase() !== "y") {
  console.log("Canceled.");
  process.exit(0);
}

// ---- Tag ----

console.log(`\nCreating tag ${tag} ...`);
run(`git tag -a ${tag} -m "${tag}"`);

console.log("Pushing commits ...");
run("git push origin main");

console.log("Pushing tag ...");
run(`git push origin ${tag}`);

// ---- GitHub Release ----

try {
  run("gh --version");
  console.log("\nCreating GitHub Release ...");
  run(`gh release create ${tag} --title "${tag}" --generate-notes --latest`);
  console.log(
    `\nDone: https://github.com/zotero-plugin-dev/workflows/releases/tag/${tag}`,
  );
} catch {
  console.log("\ngh CLI not found. To create a GitHub Release:");
  console.log("  1. Install gh CLI: https://cli.github.com/");
  console.log(
    `  2. Or: gh release create ${tag} --title "${tag}" --generate-notes --latest`,
  );
}

console.log(`\nTag pushed: ${tag}`);
console.log(
  `The major tag v${next.major} will be moved by CI once the release is published.`,
);
