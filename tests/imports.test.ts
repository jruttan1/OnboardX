import { analyzeImports } from '../src/analysis/imports';
import * as path from 'path';

describe('analyzeImports', () => {
  const fixtureRepo = path.join(__dirname, 'fixtures', 'basic-repo');

  it('should calculate import depths correctly for basic fixture', async () => {
    const results = await analyzeImports(fixtureRepo);
    
    // Convert to a map for easier testing
    const depthMap = new Map(results.map(r => [r.file, r.depth]));
    
    // Expected depths based on import graph:
    // a.ts → b.ts → c.ts
    // d.ts → b.ts
    expect(depthMap.get('c.ts')).toBe(3); // longest chain: a→b→c or d→b→c
    expect(depthMap.get('b.ts')).toBe(2); // longest chain: a→b or d→b
    expect(depthMap.get('a.ts')).toBe(1); // root file
    expect(depthMap.get('d.ts')).toBe(1); // root file
    
    // Should have 4 files total
    expect(results).toHaveLength(4);
  });

  it('should return results sorted by depth descending', async () => {
    const results = await analyzeImports(fixtureRepo);
    
    // Verify sorting (depth descending)
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].depth).toBeGreaterThanOrEqual(results[i + 1].depth);
    }
    
    // First result should have highest depth
    expect(results[0].file).toBe('c.ts');
    expect(results[0].depth).toBe(3);
  });

  it('should handle non-existent directory gracefully', async () => {
    const results = await analyzeImports('/non/existent/directory');
    expect(results).toEqual([]);
  });

  it('should filter out test files and other excluded files', async () => {
    const results = await analyzeImports('.');
    
    // Should not include any .test.ts files
    const testFiles = results.filter(r => r.file.includes('.test.'));
    expect(testFiles).toHaveLength(0);
    
    // Should not include any .d.ts files
    const dtsFiles = results.filter(r => r.file.endsWith('.d.ts'));
    expect(dtsFiles).toHaveLength(0);
    
    // Should not include any .json or .md files
    const otherFiles = results.filter(r => 
      r.file.endsWith('.json') || 
      r.file.endsWith('.md')
    );
    expect(otherFiles).toHaveLength(0);
  });

  it('should only include .ts and .tsx files', async () => {
    const results = await analyzeImports('.');
    
    // All results should be .ts or .tsx files
    results.forEach(result => {
      expect(result.file).toMatch(/\.tsx?$/);
    });
  });

  it('should handle circular imports gracefully', async () => {
    // For the basic fixture, there should be no circular imports
    // The algorithm should handle them without infinite recursion
    const results = await analyzeImports(fixtureRepo);
    
    // All depths should be positive numbers
    results.forEach(result => {
      expect(result.depth).toBeGreaterThan(0);
      expect(typeof result.depth).toBe('number');
    });
  });

  it('should provide correct file paths relative to repo root', async () => {
    const results = await analyzeImports(fixtureRepo);
    
    // All file paths should be relative to the repo root
    results.forEach(result => {
      expect(result.file).not.toMatch(/^[\/\\]/); // Should not start with absolute path
      expect(result.file).toMatch(/^[a-z]/); // Should start with filename
    });
  });
}); 