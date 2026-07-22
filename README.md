# Shared Workflows for Zotero Plugin Development

A collection of reusable GitHub Actions workflows and composite actions for Zotero Plugin projects.

## Features

### Composite actions

- [x] Setup JavaScript (check, setup nodejs, setup pnpm, install dependenies)

### Reusable GitHub Actions workflows

- [ ] Autofix.ci
- [ ] Release (production)
- [ ] Continuous Releases: run on pr, run build and upload xpi to Artifacts, add comment to pr/issue, relate: https://github.com/zotero-plugin-dev/zotero-plugin-scaffold/issues/148
- [x] Issue bot
  - [ ] Add/remove label to issue on user/owner comment
  - [ ] Close issue with `invalid` label
  - [ ] Close issue with `/d` comment
  - [ ] Close stale issue
  - [ ] Lock stable closed issue

## Usage

```bash
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

#### Method 1: Local

```bash
# Auto bump patch (1.0.0 → 1.0.1)
pnpm run release

# Bump minor (1.0.1 → 1.1.0)
pnpm run release minor

# Bump major (1.1.0 → 2.0.0)
pnpm run release major

# Exact version
pnpm run release 1.0.0
```

> Requires [gh CLI](https://cli.github.com/).

#### Method 2: Remote

1. Go to [Actions → Release Root](https://github.com/zotero-plugin-dev/workflows/actions/workflows/release-root.yml)
2. Click **Run workflow**
3. Enter version (e.g. `1.0.0`) and submit

## Lincense

MIT License © 2025-PRESENT Northword

## Thanks

- [sxzz/workflows](https://github.com/sxzz/workflows)
