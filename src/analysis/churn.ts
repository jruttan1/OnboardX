import { exec as execCb } from 'child_process'
import { promisify } from 'util'
const exec = promisify(execCb)

export interface ChurnScore { file: string; churn: number }

export async function analyzeChurn(repoRoot: string): Promise<ChurnScore[]> {
    const command = `git -C ${repoRoot} log --since=1.year --numstat --pretty=format:` // git log command to get churn data
    const { stdout } = await exec(command) // Execute the command and get the output
    const counts = new Map<string, number>() // Map to hold file churn counts

    stdout.trim()
    .split('\n')
    .forEach(line => {
    const [adds, dels, file] = line.split('\t') // Split each line into additions, deletions, file path
    counts.set(file, (counts.get(file) || 0) + (+adds + +dels)) // Update the add/delete count for each file
    if (!file || isNaN(+adds) || isNaN(+dels)) // Skip if file is empty or adds/dels are not numbers
      counts.set(file, (counts.get(file) || 0) + (+adds + +dels)) 
    })

  return Array.from(counts.entries()) // Convert the map to an array of [file, churn] pairs
    .map(([file, churn]) => ({ file, churn }))
    .sort((a, b) => b.churn - a.churn)
}