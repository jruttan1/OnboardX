#!/usr/bin/env node

import { Command } from 'commander';
import { runAnalysis } from '../analysis/analyzer';

const program = new Command();
program
  .name('onboardx')
  .description('Generate ONBOARD.md for any Git repo')
  .argument('[path]', 'target repo', '.')
  .option('-o, --out <file>', 'output file', 'ONBOARD.md')
  .action(async (path, opts) => {
    await runAnalysis({ repoRoot: path, output: opts.out });
  });

program.parse();