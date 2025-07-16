import { generateDependencyGraph, generateChurnVsDepthScatter, generateOwnershipGraph } from '../src/renderer/mermaid';
import { ImportScore } from '../src/analysis/imports';
import { ChurnScore } from '../src/analysis/churn';
import { FileOwnership } from '../src/analysis/ownership';

describe('Mermaid Graph Generator', () => {
  const mockImportResults: ImportScore[] = [
    { file: 'src/analysis/churn.ts', depth: 3 },
    { file: 'src/analysis/ownership.ts', depth: 3 },
    { file: 'src/analysis/analyzer.ts', depth: 2 },
    { file: 'src/cli/index.ts', depth: 1 },
  ];

  const mockChurnResults: ChurnScore[] = [
    { file: 'src/analysis/churn.ts', churn: 111 },
    { file: 'src/analysis/ownership.ts', churn: 77 },
    { file: 'src/cli/index.ts', churn: 65 },
    { file: 'src/analysis/analyzer.ts', churn: 51 },
  ];

  const mockOwnershipResults: FileOwnership[] = [
    {
      file: 'src/analysis/churn.ts',
      primaryContributor: 'jruttan1',
      contributionCount: 3,
      allContributors: [{ author: 'jruttan1', commits: 3 }]
    },
    {
      file: 'src/analysis/ownership.ts',
      primaryContributor: 'jruttan1',
      contributionCount: 1,
      allContributors: [{ author: 'jruttan1', commits: 1 }]
    }
  ];

  it('should generate a basic dependency graph', () => {
    const mermaid = generateDependencyGraph(mockImportResults);
    
    expect(mermaid).toContain('graph TD');
    expect(mermaid).toContain('File Dependency Graph');
    expect(mermaid).toContain('churn.ts');
    expect(mermaid).toContain('ownership.ts');
    expect(mermaid).toContain('depth: 3');
    expect(mermaid).toContain('classDef');
    
    console.log('\n=== Basic Dependency Graph ===');
    console.log(mermaid);
  });

  it('should generate dependency graph with churn information', () => {
    const mermaid = generateDependencyGraph(
      mockImportResults,
      mockChurnResults,
      undefined,
      { includeChurn: true }
    );
    
    expect(mermaid).toContain('📈 111 changes');
    expect(mermaid).toContain('📈 77 changes');
    expect(mermaid).toContain('high-churn');
    
    console.log('\n=== Dependency Graph with Churn ===');
    console.log(mermaid);
  });

  it('should generate dependency graph with ownership information', () => {
    const mermaid = generateDependencyGraph(
      mockImportResults,
      undefined,
      mockOwnershipResults,
      { includeOwnership: true }
    );
    
    expect(mermaid).toContain('👤 jruttan1');
    
    console.log('\n=== Dependency Graph with Ownership ===');
    console.log(mermaid);
  });

  it('should generate comprehensive dependency graph', () => {
    const mermaid = generateDependencyGraph(
      mockImportResults,
      mockChurnResults,
      mockOwnershipResults,
      { 
        includeChurn: true, 
        includeOwnership: true,
        title: 'Comprehensive Analysis',
        direction: 'LR'
      }
    );
    
    expect(mermaid).toContain('graph LR');
    expect(mermaid).toContain('Comprehensive Analysis');
    expect(mermaid).toContain('📈 111 changes');
    expect(mermaid).toContain('👤 jruttan1');
    
    console.log('\n=== Comprehensive Dependency Graph ===');
    console.log(mermaid);
  });

  it('should generate churn vs depth scatter plot', () => {
    const files = mockImportResults.map(imp => {
      const churn = mockChurnResults.find(c => c.file === imp.file)?.churn || 0;
      const owner = mockOwnershipResults.find(o => o.file === imp.file)?.primaryContributor;
      return {
        file: imp.file,
        churn,
        depth: imp.depth,
        owner
      };
    });

    const mermaid = generateChurnVsDepthScatter(files);
    
    expect(mermaid).toContain('Churn vs Import Depth Analysis');
    expect(mermaid).toContain('📈 111 changes');
    expect(mermaid).toContain('🔗 depth 3');
    expect(mermaid).toContain('high-risk');
    
    console.log('\n=== Churn vs Depth Scatter ===');
    console.log(mermaid);
  });

  it('should generate ownership graph', () => {
    const mermaid = generateOwnershipGraph(mockOwnershipResults);
    
    expect(mermaid).toContain('Code Ownership Map');
    expect(mermaid).toContain('👤 jruttan1');
    expect(mermaid).toContain('2 files');
    expect(mermaid).toContain('churn.ts');
    
    console.log('\n=== Ownership Graph ===');
    console.log(mermaid);
  });

  it('should handle empty data gracefully', () => {
    const mermaid = generateDependencyGraph([]);
    
    expect(mermaid).toContain('graph TD');
    expect(mermaid).toContain('File Dependency Graph');
    // Should not crash with empty data
  });

  it('should truncate long file names', () => {
    const longFileResults: ImportScore[] = [
      { file: 'src/very/long/path/to/some/very_long_filename_that_exceeds_the_limit.ts', depth: 1 }
    ];

    const mermaid = generateDependencyGraph(longFileResults);
    
    expect(mermaid).toContain('...');
    // Should truncate very long file names for better display
  });
}); 