import { analyzeChurn } from '../src/analysis/churn';

describe('analyzeChurn - Integration Test', () => {
  it('should analyze churn on the current repository', async () => {
    const result = await analyzeChurn('.');
    
    // Basic validation - should return an array
    expect(Array.isArray(result)).toBe(true);
    
    // Each item should have file and churn properties
    result.forEach(item => {
      expect(item).toHaveProperty('file');
      expect(item).toHaveProperty('churn');
      expect(typeof item.file).toBe('string');
      expect(typeof item.churn).toBe('number');
      expect(item.churn).toBeGreaterThan(0);
    });
    
    // Should be sorted by churn (descending)
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].churn).toBeGreaterThanOrEqual(result[i + 1].churn);
    }
    
    // Print results for manual inspection
    console.log('Churn analysis results:');
    result.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.file}: ${item.churn} changes`);
    });
  });
  
  it('should handle non-existent directory gracefully', async () => {
    const result = await analyzeChurn('/non/existent/directory');
    
    // Should return empty array on error
    expect(result).toEqual([]);
  });
}); 