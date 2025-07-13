import { exec as execCb } from 'child_process'
import { promisify } from 'util'
const exec = promisify(execCb)

export interface ChurnScore { file: string; churn: number }

export async function analyzeChurn(repoRoot: string): Promise<ChurnScore[]> {
    try {
        // Use --pretty=format:"" to suppress commit messages, only show numstat
        // Exclude common directories we don't want to analyze
        const command = `git -C ${repoRoot} log --since=1.year --numstat --pretty=format:"" -- . ':!node_modules' ':!dist' ':!build' ':!coverage' ':!.git' ':!*.lock' ':!pnpm-lock.yaml' ':!package-lock.json' ':!yarn.lock'`
        
        const { stdout } = await exec(command, { 
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer 
        })
        const counts = new Map<string, number>()

        stdout.trim()
            .split('\n')
            .filter(line => line.trim() !== '') // Remove empty lines
            .forEach(line => {
                const parts = line.split('\t')
                
                // numstat format: additions\tdeletions\tfilename
                if (parts.length !== 3) return
                
                const [adds, dels, file] = parts
                
                // Skip if file is empty or adds/dels are not numbers
                if (!file || file.trim() === '' || isNaN(+adds) || isNaN(+dels)) {
                    return
                }
                
                // Skip binary files (git shows '-' for binary file changes)
                if (adds === '-' || dels === '-') {
                    return
                }
                
                // Additional filtering for files we want to analyze
                if (shouldIncludeFile(file)) {
                    const churnDelta = (+adds) + (+dels)
                    counts.set(file, (counts.get(file) || 0) + churnDelta)
                }
            })

        return Array.from(counts.entries())
            .map(([file, churn]) => ({ file, churn }))
            .filter(({ churn }) => churn > 0) // Remove files with 0 churn
            .sort((a, b) => b.churn - a.churn)
    } catch (error) {
        console.error('Error analyzing churn:', error)
        return []
    }
}

function shouldIncludeFile(file: string): boolean {
    // Skip hidden files and directories
    if (file.startsWith('.') && !file.startsWith('./')) return false
    
    // Skip common build/dependency directories
    const excludeDirs = [
        'node_modules/', 'dist/', 'build/', 'coverage/', '.git/', 
        'target/', 'bin/', 'obj/', 'out/', 'logs/', 'tmp/', 'temp/',
        '.pnpm/', '.yarn/', '.next/', '.nuxt/', '.vscode/', '.idea/'
    ]
    
    if (excludeDirs.some(dir => file.includes(dir))) return false
    
    // Include common source code file extensions
    const includeExtensions = [
        '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.c', '.cpp', '.h', '.hpp',
        '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt', '.scala', '.clj',
        '.vue', '.svelte', '.html', '.css', '.scss', '.sass', '.less',
        '.md', '.json', '.yaml', '.yml', '.xml', '.toml', '.ini', '.cfg'
    ]
    
    return includeExtensions.some(ext => file.endsWith(ext))
}