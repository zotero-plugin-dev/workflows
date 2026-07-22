/**
 * Release script for zotero-plugin-dev/workflows
 *
 * Creates a new version tag, moves the major version tag,
 * and creates a GitHub Release.
 *
 * Usage:
 *   pnpm run release              → auto bump patch
 *   pnpm run release patch        → bump patch
 *   pnpm run release minor        → bump minor
 *   pnpm run release major        → bump major
 *   pnpm run release 1.2.3        → explicit version
 *   node scripts/release.mjs patch --ci
 */
import { execSync } from "node:child_process";
import { createInterface } from "node:readline";

const arg = process.argv[2];
const isCI = process.argv.includes("--ci");

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

// --- Resolve version ---

const latestTag = runQuiet(
  'git describe --tags --abbrev=0 --match "v[0-9]*" 2>/dev/null',
);

function parseVersion(v) {
  const match = v.replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
  };
}

const bumpLevels = ["major", "minor", "patch"];
const prev = latestTag
  ? parseVersion(latestTag)
  : { major: 0, minor: 0, patch: 0 };
let next;

if (bumpLevels.includes(arg)) {
  next = { ...prev };
  if (arg === "major") {
    next.major++;
    next.minor = 0;
    next.patch = 0;
  } else if (arg === "minor") {
    next.minor++;
    next.patch = 0;
  } else {
    next.patch++;
  }
} else if (!arg) {
  next = { ...prev };
  next.patch++;
} else if (/^\d+\.\d+\.\d+$/.test(arg)) {
  next = parseVersion(arg);
} else if (/^v\d+\.\d+\.\d+$/.test(arg)) {
  next = parseVersion(arg);
} else {
  console.error(`Usage: pnpm run release [patch|minor|major|<version>] [--ci]`);
  process.exit(1);
}

if (!next) {
  console.error(`Invalid version: ${arg}`);
  process.exit(1);
}

const tag = `v${next.major}.${next.minor}.${next.patch}`;
const majorTag = `v${next.major}`;

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

console.log(`\n  Prev  : ${latestTag || "(none)"}`);
console.log(`  Next  : ${tag}`);
console.log(`  Major : ${majorTag}`);
console.log(`  HEAD  : ${run("git rev-parse --short HEAD")}`);
console.log(`  Last  : ${run("git log -1 --oneline")}`);

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
