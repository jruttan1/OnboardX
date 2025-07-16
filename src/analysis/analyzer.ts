import { analyzeChurn } from './churn'
import { getTopFileOwnership } from './ownership'
import { analyzeImports } from './imports'

export interface AnalysisResult {
  topFiles: Array<{
    file: string
    churn: number
    primaryContributor: string
    contributionCount: number
    importDepth: number
  }>
}

export async function runAnalysis(opts: { repoRoot: string; output: string }): Promise<AnalysisResult> {
  console.log(`Analyzing ${opts.repoRoot}`)
  
  // Run all analyses in parallel for efficiency
  const [churnResults, importResults] = await Promise.all([
    analyzeChurn(opts.repoRoot),
    analyzeImports(opts.repoRoot)
  ])
  
  // Get top 5 files by churn
  const topChurnFiles = churnResults.slice(0, 5)
  
  // Get ownership analysis for top files
  const ownershipResults = await getTopFileOwnership(opts.repoRoot, topChurnFiles)
  
  // Create import depth lookup
  const importDepthMap = new Map(importResults.map(r => [r.file, r.depth]))
  
  // Combine all results
  const topFiles = topChurnFiles.map(churnFile => {
    const ownership = ownershipResults.find(o => o.file === churnFile.file)
    const importDepth = importDepthMap.get(churnFile.file) || 0
    
    return {
      file: churnFile.file,
      churn: churnFile.churn,
      primaryContributor: ownership?.primaryContributor || 'Unknown',
      contributionCount: ownership?.contributionCount || 0,
      importDepth
    }
  })
  
  console.log('\n=== REPOSITORY ANALYSIS ===')
  console.log(`📊 Analyzed ${churnResults.length} files with ${importResults.length} TypeScript files`)
  
  console.log('\n=== TOP FILES BY CHURN ===')
  topFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file}`)
    console.log(`   📈 Churn: ${file.churn} changes`)
    console.log(`   👤 Primary contributor: ${file.primaryContributor} (${file.contributionCount} commits)`)
    console.log(`   🔗 Import depth: ${file.importDepth}`)
    console.log('')
  })
  
  console.log('\n=== TOP FILES BY IMPORT DEPTH ===')
  const topImportFiles = importResults.slice(0, 5)
  topImportFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file} (depth: ${file.depth})`)
  })
  
  return { topFiles }
}