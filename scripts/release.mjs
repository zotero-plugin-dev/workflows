/**
 * Release script for zotero-plugin-dev/workflows
 *
 * Creates a new version tag, moves the major version tag,
 * and creates a GitHub Release.
 *
 * Usage:
 *   node scripts/release.mjs 1.0.0
 *   node scripts/release.mjs 1.0.0 --ci
 *   pnpm run release 1.0.0
 */
import { execSync } from "node:child_process";
import { createInterface } from "node:readline";

const version = process.argv[2];
const isCI = process.argv.includes("--ci");

if (!version) {
  console.error("Usage: pnpm run release <version> [--ci]");
  console.error("Example: pnpm run release 1.0.0");
  process.exit(1);
}

const tag = version.startsWith("v") ? version : `v${version}`;
if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(`Invalid version: ${version}. Expected format: X.Y.Z`);
  process.exit(1);
}

const majorTag = tag.match(/^v\d+/)[0];

function run(cmd) {
  return execSync(cmd, { encoding: "utf-8" }).trim();
}

// --- Checks ---

const status = run("git status --porcelain");
if (status) {
  console.error(
    "Working directory is not clean. Please commit or stash changes first.",
  );
  process.exit(1);
}

if (!isCI) {
  const branch = run("git branch --show-current");
  if (branch !== "main") {
    console.error(
      `Not on main branch (current: ${branch}). Please switch to main first.`,
    );
    process.exit(1);
  }
  run("git pull origin main");

  const ahead = run("git rev-list --count origin/main..HEAD");
  if (ahead !== "0") {
    console.log(`Pushing ${ahead} local commit(s) to main ...`);
    run("git push origin main");
  }
}

// --- Preview ---

console.log(`\n  Version tag : ${tag}`);
console.log(`  Major tag   : ${majorTag}`);
console.log(`  HEAD        : ${run("git rev-parse --short HEAD")}`);
console.log(`  Last commit : ${run("git log -1 --oneline")}`);

// --- Confirm ---

if (!isCI) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question("\nProceed with release? [y/N] ", resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== "y") {
    console.log("Canceled.");
    process.exit(0);
  }
}

// --- Tag ---

if (isCI) {
  const name = process.env.GIT_USER_NAME || "github-actions[bot]";
  const email =
    process.env.GIT_USER_EMAIL ||
    "41898282+github-actions[bot]@users.noreply.github.com";
  run(`git config user.name "${name}"`);
  run(`git config user.email "${email}"`);
}

console.log(`\nCreating tag ${tag} ...`);
run(`git tag -a ${tag} -m "${tag}"`);

console.log(`Moving major tag ${majorTag} ...`);
try {
  run(`git tag -f ${majorTag}`);
} catch {
  run(`git tag -a ${majorTag} -m "${majorTag}"`);
}

console.log("Pushing commits ...");
run("git push origin main");

console.log("Pushing tags ...");
run(`git push origin ${tag}`);
run(`git push origin ${majorTag} --force`);

// --- GitHub Release ---

try {
  run("gh --version");
  console.log("\nCreating GitHub Release ...");
  run(`gh release create ${tag} --title "${tag}" --generate-notes --latest`);
  console.log(
    `\nDone: https://github.com/zotero-plugin-dev/workflows/releases/tag/${tag}`,
  );
} catch {
  if (isCI) {
    console.error("gh CLI not found in CI environment.");
    process.exit(1);
  }
  console.log("\ngh CLI not found. To create a GitHub Release:");
  console.log("  Option 1: Install gh CLI");
  console.log("    https://cli.github.com/");
  console.log(
    `  Option 2: Run: gh release create ${tag} --title "${tag}" --generate-notes --latest`,
  );
  console.log(`  Option 3: Trigger the release-root workflow`);
  console.log(
    `    https://github.com/zotero-plugin-dev/workflows/actions/workflows/release-root.yml`,
  );
}

console.log(`\nTags pushed: ${tag}, ${majorTag}`);
