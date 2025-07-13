import { exec as execCb } from 'child_process'
import { promisify } from 'util'
const exec = promisify(execCb)

export interface FileOwnership {
    file: string
    primaryContributor: string
    contributionCount: number
    allContributors: { author: string; commits: number }[]
}

export async function analyzeOwnership(repoRoot: string, files: string[]): Promise<FileOwnership[]> {
    const results: FileOwnership[] = []
    
    for (const file of files) {
        try {
            const ownership = await getFileOwnership(repoRoot, file)
            if (ownership) {
                results.push(ownership)
            }
        } catch (error) {
            console.error(`Error analyzing ownership for ${file}:`, error)
        }
    }
    
    return results
}

async function getFileOwnership(repoRoot: string, file: string): Promise<FileOwnership | null> {
    try {
        // Get all authors who have committed to this file
        const command = `git -C ${repoRoot} log --follow --format="%an" -- "${file}"`
        const { stdout } = await exec(command, { maxBuffer: 1024 * 1024 })
        
        if (!stdout.trim()) {
            return null
        }
        
        // Count commits per author
        const authorCounts = new Map<string, number>()
        
        stdout.trim()
            .split('\n')
            .filter(author => author.trim() !== '')
            .forEach(author => {
                const trimmedAuthor = author.trim()
                authorCounts.set(trimmedAuthor, (authorCounts.get(trimmedAuthor) || 0) + 1)
            })
        
        // Convert to sorted array
        const allContributors = Array.from(authorCounts.entries())
            .map(([author, commits]) => ({ author, commits }))
            .sort((a, b) => b.commits - a.commits)
        
        if (allContributors.length === 0) {
            return null
        }
        
        const primaryContributor = allContributors[0]
        
        return {
            file,
            primaryContributor: primaryContributor.author,
            contributionCount: primaryContributor.commits,
            allContributors
        }
        
    } catch (error) {
        console.error(`Error getting ownership for ${file}:`, error)
        return null
    }
}

export async function getTopFileOwnership(repoRoot: string, topFiles: { file: string; churn: number }[]): Promise<FileOwnership[]> {
    const files = topFiles.map(f => f.file)
    return analyzeOwnership(repoRoot, files)
} 