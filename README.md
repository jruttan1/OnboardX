# Wayfinder

A CLI tool that generates a onboarding roadmap for any Git repository.

> Navigate complex codebases in 60 seconds or less.

## Features

- **Top-5 hotspot files** ranked by churn, dependency depth, and ownership.
- **Auto-generated dependency graph** (`docs/deps.svg`).
- **Ownership heatmap** and brittle zones summary.
- **GitHub Action snippet** for automated `ONBOARD.md` refresh on each commits, keeping docs fresh.
- **Zero-config**, one-command (`npx wayfinder`).

## Quick Start

Run the CLI in any repo root to generate a living roadmap:

```bash
npx wayfinder .
```

This produces an `ONBOARD.md` file with:

1. Ranked list of critical files.  
2. Embedded dependency graph (`docs/deps.svg`).  
3. Ownership heatmap and hotspot summary based on commit history.

## GitHub Actions Integration

Add a workflow file at `.github/workflows/wayfinder.yml`:

```yaml
name: Wayfinder Roadmap

on:
  push:
    branches: [ main ]

jobs:
  refresh-roadmap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Wayfinder
        run: npx wayfinder --ci
      - name: Commit ONBOARD.md
        run: |
          git config user.name "wayfinder-bot"
          git config user.email "bot@example.com"
          git commit -am "chore: refresh ONBOARD.md"
          git push
```

Your `ONBOARD.md` will auto-update on every merge to `main`.

## Roadmap

- **v0.2**: Optional LLM-powered summaries (`--summarize`).  
- **v1.0**: Plugin architecture for additional languages.  
- **v1.x**: VS Code extension & SaaS dashboard.

## Contributing

Contributions welcome! Please open issues or pull requests on the [GitHub repo](https://github.com/your-org/wayfinder).