import { Project, SourceFile } from 'ts-morph';
import * as path from 'path';

export interface ImportScore {
    file: string;
    depth: number;
}

export async function analyzeImports(repoRoot: string): Promise<ImportScore[]> {
    try {
        // Load the TypeScript project
        const project = new Project({
            tsConfigFilePath: path.join(repoRoot, 'tsconfig.json'),
            skipAddingFilesFromTsConfig: false,
        });

        // Get all source files and filter them
        const sourceFiles = project.getSourceFiles().filter(file => {
            const filePath = file.getFilePath();
            return shouldIncludeFile(filePath);
        });

        // Build import graph
        const importGraph = buildImportGraph(sourceFiles);

        // Calculate depths using DFS with memoization
        const depthCache = new Map<string, number>();
        const calculating = new Set<string>(); // To detect cycles
        
        function calculateDepth(filePath: string): number {
            if (depthCache.has(filePath)) {
                return depthCache.get(filePath)!;
            }
            
            if (calculating.has(filePath)) {

                return 1;
            }
            
            calculating.add(filePath);
            
            const importedBy = importGraph.get(filePath) || [];
            let maxDepth = 0;
            
            for (const importer of importedBy) {
                const importerDepth = calculateDepth(importer);
                maxDepth = Math.max(maxDepth, importerDepth);
            }
            
            const depth = maxDepth + 1;
            calculating.delete(filePath);
            depthCache.set(filePath, depth);
            
            return depth;
        }

        const results: ImportScore[] = sourceFiles.map(file => {
            const filePath = file.getFilePath();
            const depth = calculateDepth(filePath);
            return {
                file: path.relative(repoRoot, filePath),
                depth
            };
        });

        return results.sort((a, b) => b.depth - a.depth);

    } catch (error) {
        console.error('Error analyzing imports:', error);
        return [];
    }
}

function shouldIncludeFile(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath);
    
    // Skip node_modules
    if (normalizedPath.includes('node_modules')) {
        return false;
    }
    
    // Skip specific file types
    const skipExtensions = ['.d.ts', '.json', '.md'];
    if (skipExtensions.some(ext => normalizedPath.endsWith(ext))) {
        return false;
    }
    
    // Skip test files
    if (normalizedPath.match(/\.test\.tsx?$/)) {
        return false;
    }
    
    // Only include .ts and .tsx files
    return normalizedPath.match(/\.tsx?$/) !== null;
}

function buildImportGraph(sourceFiles: SourceFile[]): Map<string, string[]> {
    // Map: imported file -> array of files that import it
    const importGraph = new Map<string, string[]>();
    
    // Create a map of file paths for quick lookup
    const filePathMap = new Map<string, SourceFile>();
    sourceFiles.forEach(file => {
        filePathMap.set(file.getFilePath(), file);
    });

    sourceFiles.forEach(sourceFile => {
        const sourceFilePath = sourceFile.getFilePath();
        
        // Get all import declarations
        const importDeclarations = sourceFile.getImportDeclarations();
        
        importDeclarations.forEach(importDecl => {
            const moduleSpecifier = importDecl.getModuleSpecifierValue();
            
            // Skip external modules (not relative/absolute paths to our files)
            if (!moduleSpecifier.startsWith('.') && !path.isAbsolute(moduleSpecifier)) {
                return;
            }
            
            // Resolve the imported file path
            const importedFilePath = resolveImportPath(sourceFile, moduleSpecifier, filePathMap);
            
            if (importedFilePath && filePathMap.has(importedFilePath)) {
                // Add this file as an importer of the imported file
                if (!importGraph.has(importedFilePath)) {
                    importGraph.set(importedFilePath, []);
                }
                importGraph.get(importedFilePath)!.push(sourceFilePath);
            }
        });
    });

    return importGraph;
}

function resolveImportPath(
    sourceFile: SourceFile, 
    moduleSpecifier: string, 
    filePathMap: Map<string, SourceFile>
): string | null {
    try {
        const sourceDir = path.dirname(sourceFile.getFilePath());
        
        // Handle relative imports
        if (moduleSpecifier.startsWith('.')) {
            const resolved = path.resolve(sourceDir, moduleSpecifier);
            
            // Try different extensions
            const extensions = ['.ts', '.tsx', '.js', '.jsx'];
            for (const ext of extensions) {
                const withExt = resolved + ext;
                if (filePathMap.has(withExt)) {
                    return withExt;
                }
            }
            
            // Try index files
            for (const ext of extensions) {
                const indexPath = path.join(resolved, 'index' + ext);
                if (filePathMap.has(indexPath)) {
                    return indexPath;
                }
            }
        }
        
        return null;
    } catch {
        return null;
    }
} 