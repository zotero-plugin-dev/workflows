# Shared Workflows for Zotero Plugin Development

A collection of reusable GitHub Actions workflows and composite actions for Zotero Plugin projects.

## Features

### Composite actions

- [x] Setup JavaScript (`setup-js`): checkout, then automatically pick the toolchain
  - [x] Vite+ ([voidzero-dev/setup-vp](https://github.com/voidzero-dev/setup-vp)) path (internal): auto-detected when `vite-plus` is in the devDependencies of `package.json`; the Vite+ runtime resolves the Node.js version from the project
  - [x] pnpm/setup path (internal): for pnpm > 11 or an undeclared pnpm version — [pnpm/setup](https://github.com/pnpm/setup) installs pnpm and the Node.js runtime in one step
  - [x] `setup-node` (internal): classic Node.js + package manager setup and dependency install (npm/yarn, or pnpm <= 11 via `pnpm/action-setup`), fed with the package manager detected by `setup-js`

### Reusable GitHub Actions workflows

- [x] Autofix.ci
- [x] Release (production)
- [ ] Continuous Releases: run on pr, run build and upload xpi to Artifacts, add comment to pr/issue, relate: https://github.com/zotero-plugin-dev/zotero-plugin-scaffold/issues/148
- [x] Issue bot
  - [x] Add/remove label to issue on user/owner comment
  - [x] Close issue with `invalid` label
  - [x] Close issue with `/d` comment
  - [x] Close stale issue
  - [x] Lock stable closed issue

## Usage

```yml
name: Issue Bot

on:
  issues:
    types:
      - labeled
  issue_comment:
    types:
      - created
  schedule:
    - cron: "30 1 * * *"
  workflow_dispatch:

permissions:
  issues: write
  pull-requests: write

jobs:
  issue-bot:
    uses: zotero-plugin-dev/workflows/.github/workflows/issue-bot.yml@main
```

See the [examples directory](./examples/) for more examples.

### Versioning

This repository uses **semantic versioning tags** for stable references:

```yaml
# Recommended: track the latest v1.x releases (auto-receives bugfixes)
uses: zotero-plugin-dev/workflows/.github/workflows/issue-bot.yml@v1

# Pin to a specific stable version (Renovate will suggest upgrades)
uses: zotero-plugin-dev/workflows/.github/workflows/issue-bot.yml@v1.0.0

# Track the latest development changes
uses: zotero-plugin-dev/workflows/.github/workflows/issue-bot.yml@main
```

| Reference | Updates               | Use case                                |
| --------- | --------------------- | --------------------------------------- |
| `@v1`     | Automatic (tag moved) | Follow latest stable with auto bugfixes |
| `@v1.0.0` | Via Renovate          | Pin to a specific release               |
| `@main`   | Every push            | Bleeding edge (may break)               |

You can also choose to fix the version as a commit hash to prevent supply chain attacks and improve compatibility.

## Contributing

### Releasing

Releases are created as GitHub Releases with a semantic version tag (e.g. `v1.2.3`).
Once a release is published, [Sync Major Tag](../.github/workflows/sync-major-tag.yml)
moves the major version tag (e.g. `v1`) to point at the released commit, so
consumers tracking `@v1` receive the update automatically.

#### Option 1: Local script

```bash
pnpm release           # bump patch (default)
pnpm release:patch     # bump patch
pnpm release:minor     # bump minor
pnpm release:major     # bump major
```

This computes the next version, creates and pushes the tag, and creates the
GitHub Release. The major tag is then moved by CI.

> Requires [gh CLI](https://cli.github.com/).

#### Option 2: GitHub UI

1. Go to [Releases → New release](https://github.com/zotero-plugin-dev/workflows/releases/new)
2. Choose a new tag `vX.Y.Z` and set the target branch
3. Click **Publish release**

The major version tag is moved by CI once the release is published.

## Lincense

MIT License © 2025-PRESENT Northword

## Thanks

- [sxzz/workflows](https://github.com/sxzz/workflows)
