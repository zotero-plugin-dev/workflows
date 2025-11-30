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

You can also choose to fix the version as a commit hash to prevent supply chain attacks and improve compatibility.

## Lincense

MIT License © 2025-PRESENT Northword

## Thanks

- [sxzz/workflows](https://github.com/sxzz/workflows)
