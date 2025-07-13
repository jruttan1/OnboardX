import { analyzeChurn } from './churn'
import { getTopFileOwnership } from './ownership'

export interface AnalysisResult {
  topFiles: Array<{
    file: string
    churn: number
    primaryContributor: string
    contributionCount: number
  }>
}

export async function runAnalysis(opts: { repoRoot: string; output: string }): Promise<AnalysisResult> {
  console.log(`Analyzing ${opts.repoRoot}`)
  
  // Get churn analysis
  const churnResults = await analyzeChurn(opts.repoRoot)
  
  // Get top 5 files by churn
  const topChurnFiles = churnResults.slice(0, 5)
  
  // Get ownership analysis for top files
  const ownershipResults = await getTopFileOwnership(opts.repoRoot, topChurnFiles)
  
  // Combine results
  const topFiles = topChurnFiles.map(churnFile => {
    const ownership = ownershipResults.find(o => o.file === churnFile.file)
    return {
      file: churnFile.file,
      churn: churnFile.churn,
      primaryContributor: ownership?.primaryContributor || 'Unknown',
      contributionCount: ownership?.contributionCount || 0
    }
  })
  
  console.log('\n=== TOP FILES BY CHURN ===')
  topFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file}`)
    console.log(`   Churn: ${file.churn} changes`)
    console.log(`   Primary contributor: ${file.primaryContributor} (${file.contributionCount} commits)`)
    console.log('')
  })
  
  return { topFiles }
}