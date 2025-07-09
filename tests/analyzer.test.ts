import { runAnalysis } from '../src/analysis/analyzer';

test('runs without crashing', async () => {
  await expect(runAnalysis({ repoRoot: '.', output: '/tmp/out.md' })).resolves.not.toThrow();
});