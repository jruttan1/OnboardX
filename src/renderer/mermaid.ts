import { ImportScore } from '../analysis/imports';
import { ChurnScore } from '../analysis/churn';
import { FileOwnership } from '../analysis/ownership';
import * as path from 'path';

export interface MermaidGraphOptions {
    title?: string;
    direction?: 'TD' | 'BT' | 'LR' | 'RL';
    maxNodes?: number;
    includeChurn?: boolean;
    includeOwnership?: boolean;
}

export function generateDependencyGraph(
    importResults: ImportScore[],
    churnResults?: ChurnScore[],
    ownershipResults?: FileOwnership[],
    options: MermaidGraphOptions = {}
): string {
    const {
        title = 'File Dependency Graph',
        direction = 'TD',
        maxNodes = 20,
        includeChurn = false,
        includeOwnership = false
    } = options;

    // Create maps for quick lookup
    const churnMap = new Map(churnResults?.map(c => [c.file, c.churn]) || []);
    const ownershipMap = new Map(ownershipResults?.map(o => [o.file, o.primaryContributor]) || []);

    // Get top files by import depth
    const topFiles = importResults.slice(0, maxNodes);
    
    // Start mermaid diagram
    let mermaid = `graph ${direction}\n`;
    
    // Add title
    if (title) {
        mermaid += `    subgraph " "\n`;
        mermaid += `        direction TB\n`;
        mermaid += `        title["${title}"]\n`;
        mermaid += `    end\n\n`;
    }

    // Create node definitions with styling based on metrics
    const nodeIds = new Map<string, string>();
    let nodeCounter = 1;

    topFiles.forEach(file => {
        const nodeId = `node${nodeCounter++}`;
        const fileName = getDisplayName(file.file);
        nodeIds.set(file.file, nodeId);

        let nodeLabel = fileName;
        let nodeClass = 'default';

        // Add churn info if available
        if (includeChurn && churnMap.has(file.file)) {
            const churn = churnMap.get(file.file)!;
            nodeLabel += `<br/>📈 ${churn} changes`;
            
            // Style by churn level
            if (churn > 100) nodeClass = 'high-churn';
            else if (churn > 50) nodeClass = 'med-churn';
            else nodeClass = 'low-churn';
        }

        // Add ownership info if available
        if (includeOwnership && ownershipMap.has(file.file)) {
            const owner = ownershipMap.get(file.file)!;
            nodeLabel += `<br/>👤 ${owner}`;
        }

        // Add depth info
        nodeLabel += `<br/>🔗 depth: ${file.depth}`;

        mermaid += `    ${nodeId}["${nodeLabel}"]\n`;
        if (nodeClass !== 'default') {
            mermaid += `    class ${nodeId} ${nodeClass}\n`;
        }
    });

    // Add edges (this is simplified - in a real dependency graph we'd need actual import relationships)
    // For now, we'll create a hierarchical structure based on depth
    const depthGroups = new Map<number, string[]>();
    topFiles.forEach(file => {
        const depth = file.depth;
        if (!depthGroups.has(depth)) {
            depthGroups.set(depth, []);
        }
        depthGroups.get(depth)!.push(file.file);
    });

    // Connect files from different depth levels
    const sortedDepths = Array.from(depthGroups.keys()).sort((a, b) => a - b);
    for (let i = 0; i < sortedDepths.length - 1; i++) {
        const currentDepth = sortedDepths[i];
        const nextDepth = sortedDepths[i + 1];
        
        const currentFiles = depthGroups.get(currentDepth) || [];
        const nextFiles = depthGroups.get(nextDepth) || [];

        // Create connections (simplified)
        currentFiles.forEach(currentFile => {
            nextFiles.slice(0, 2).forEach(nextFile => { // Limit connections
                const fromId = nodeIds.get(currentFile);
                const toId = nodeIds.get(nextFile);
                if (fromId && toId) {
                    mermaid += `    ${fromId} --> ${toId}\n`;
                }
            });
        });
    }

    // Add styling classes
    mermaid += `\n    classDef high-churn fill:#ffcccc,stroke:#ff0000,stroke-width:2px\n`;
    mermaid += `    classDef med-churn fill:#ffffcc,stroke:#ffaa00,stroke-width:2px\n`;
    mermaid += `    classDef low-churn fill:#ccffcc,stroke:#00aa00,stroke-width:2px\n`;
    mermaid += `    classDef default fill:#e1f5fe,stroke:#0277bd,stroke-width:2px\n`;

    return mermaid;
}

export function generateChurnVsDepthScatter(
    files: Array<{ file: string; churn: number; depth: number; owner?: string }>
): string {
    let mermaid = `graph TD\n`;
    mermaid += `    subgraph "Churn vs Import Depth Analysis"\n`;
    mermaid += `        direction TB\n`;

    files.forEach((file, index) => {
        const nodeId = `file${index}`;
        const fileName = getDisplayName(file.file);
        const label = `${fileName}<br/>📈 ${file.churn} changes<br/>🔗 depth ${file.depth}`;
        
        mermaid += `        ${nodeId}["${label}"]\n`;
        
        // Style by quadrant
        if (file.churn > 50 && file.depth > 2) {
            mermaid += `        class ${nodeId} high-risk\n`;
        } else if (file.churn > 50) {
            mermaid += `        class ${nodeId} high-churn-low-depth\n`;
        } else if (file.depth > 2) {
            mermaid += `        class ${nodeId} low-churn-high-depth\n`;
        } else {
            mermaid += `        class ${nodeId} stable\n`;
        }
    });

    mermaid += `    end\n\n`;
    
    // Add styling
    mermaid += `    classDef high-risk fill:#ff6b6b,stroke:#d63031,stroke-width:3px\n`;
    mermaid += `    classDef high-churn-low-depth fill:#fdcb6e,stroke:#e17055,stroke-width:2px\n`;
    mermaid += `    classDef low-churn-high-depth fill:#74b9ff,stroke:#0984e3,stroke-width:2px\n`;
    mermaid += `    classDef stable fill:#55a3ff,stroke:#00b894,stroke-width:2px\n`;

    return mermaid;
}

export function generateOwnershipGraph(ownershipResults: FileOwnership[]): string {
    // Group files by owner
    const ownerGroups = new Map<string, FileOwnership[]>();
    
    ownershipResults.forEach(ownership => {
        const owner = ownership.primaryContributor;
        if (!ownerGroups.has(owner)) {
            ownerGroups.set(owner, []);
        }
        ownerGroups.get(owner)!.push(ownership);
    });

    let mermaid = `graph TD\n`;
    mermaid += `    subgraph "Code Ownership Map"\n`;
    mermaid += `        direction TB\n`;

    let nodeCounter = 1;
    ownerGroups.forEach((files, owner) => {
        const ownerNodeId = `owner${nodeCounter++}`;
        mermaid += `        ${ownerNodeId}["👤 ${owner}<br/>${files.length} files"]\n`;
        
        files.forEach(file => {
            const fileNodeId = `file${nodeCounter++}`;
            const fileName = getDisplayName(file.file);
            mermaid += `        ${fileNodeId}["${fileName}<br/>${file.contributionCount} commits"]\n`;
            mermaid += `        ${ownerNodeId} --> ${fileNodeId}\n`;
        });
    });

    mermaid += `    end\n`;
    
    return mermaid;
}

function getDisplayName(filePath: string): string {
    // Get just the filename for cleaner display
    const name = path.basename(filePath);
    
    // Truncate very long names
    if (name.length > 25) {
        return name.substring(0, 22) + '...';
    }
    
    return name;
}

export function saveMermaidGraph(mermaidContent: string, outputPath: string): void {
    // This would save the mermaid content to a file
    // For now, we'll just return the content
    console.log(`Mermaid graph generated (${outputPath}):`);
    console.log('```mermaid');
    console.log(mermaidContent);
    console.log('```');
} 