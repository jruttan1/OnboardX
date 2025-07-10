#!/usr/bin/env node

import { Command } from 'commander';
import { runAnalysis } from '../analysis/analyzer';
import * as fs from 'fs';
import { exec as execCb } from 'child_process'
import { promisify } from 'util'

const program = new Command();

program
  .name('wayfinder')
  .description('Generate ONBOARD.md for any Git repo')
  .argument('[path]', 'target repo', '.')
  .option('-o, --out <file>', 'output file', 'ONBOARD.md')
  .action(async (path, opts) => {
    await runAnalysis({ repoRoot: path, output: opts.out });
  });

program.parse();

// GitHub Actions command for doc update on commit"
const exec = promisify(execCb)
program
  .command('init')
  .description('Scaffold a GitHub Actions workflow that auto-refreshes ONBOARD.md')
  .action(async () => {
    const workflow = `name: Wayfinder Roadmap

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
`;
    await fs.promises.mkdir('.github/workflows', { recursive: true });
    await fs.promises.writeFile('.github/workflows/wayfinder.yml', workflow, 'utf8');
    // stage, commit, push
    await exec('git add .github/workflows/wayfinder.yml');
    await exec('git commit -m "chore(ci): add Wayfinder auto-refresh workflow"');
    await exec('git push');
    console.log('✅ CI workflow scaffolded and pushed!');
  });