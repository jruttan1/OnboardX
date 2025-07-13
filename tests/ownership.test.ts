import { analyzeOwnership } from '../src/analysis/ownership';

describe('analyzeOwnership - Integration Test', () => {
  it('should analyze ownership for repository files', async () => {
    const testFiles = ['README.md', 'src/cli/index.ts', 'package.json'];
    const result = await analyzeOwnership('.', testFiles);
    
    // Should return results for the files
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Each result should have the expected structure
    result.forEach(ownership => {
      expect(ownership).toHaveProperty('file');
      expect(ownership).toHaveProperty('primaryContributor');
      expect(ownership).toHaveProperty('contributionCount');
      expect(ownership).toHaveProperty('allContributors');
      
      expect(typeof ownership.file).toBe('string');
      expect(typeof ownership.primaryContributor).toBe('string');
      expect(typeof ownership.contributionCount).toBe('number');
      expect(Array.isArray(ownership.allContributors)).toBe(true);
      
      // Primary contributor should have the most commits
      expect(ownership.contributionCount).toBeGreaterThan(0);
      
      // All contributors should be sorted by commit count (descending)
      for (let i = 0; i < ownership.allContributors.length - 1; i++) {
        expect(ownership.allContributors[i].commits).toBeGreaterThanOrEqual(
          ownership.allContributors[i + 1].commits
        );
      }
    });
    
    // Print results for manual inspection
    console.log('File ownership analysis:');
    result.forEach(ownership => {
      console.log(`\n${ownership.file}:`);
      console.log(`  Primary contributor: ${ownership.primaryContributor} (${ownership.contributionCount} commits)`);
      console.log(`  All contributors: ${ownership.allContributors.map(c => `${c.author} (${c.commits})`).join(', ')}`);
    });
  });
}); 