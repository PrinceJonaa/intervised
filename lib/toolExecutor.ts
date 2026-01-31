
import { db } from './mockDb';
import * as frameworkEngine from './frameworkEngine';
import { levenshteinDistance } from './aiTools';
import { toolImplementations } from './toolImplementations';

export const executeTool = (code: string, args: any, toolName?: string, isCustom?: boolean) => {
    // Helper object containing all imports
    const utils = {
        analyzeJournalEntry: frameworkEngine.analyzeJournalEntry,
        detectChainsWithDetails: frameworkEngine.detectChainsWithDetails,
        matchChains: frameworkEngine.matchChains,
        levenshteinDistance: levenshteinDistance
    };

    // SECURE PATH: Use registry for built-in tools
    if (toolName && !isCustom && (toolImplementations as any)[toolName]) {
        try {
            const result = (toolImplementations as any)[toolName](args);
            // Parse result if it's a string json (same behavior as dynamic execution)
            if (typeof result === 'string') {
                try {
                    return JSON.parse(result);
                } catch {
                    return { result };
                }
            }
            return result;
        } catch (err: any) {
             console.error("Tool Execution Error (Registry):", err);
             return { error: err.message };
        }
    }

    // LEGACY / CUSTOM PATH: Use new Function (Sandbox)
    // Warning: This is a security risk if code is untrusted.
    try {
        // Dynamic Execution with extended scope
        const fn = new Function(
            'args', 'db', 'utils', 
            'analyzeJournalEntry', 'detectChainsWithDetails', 'matchChains', 'levenshteinDistance',
            code
        );
        
        const executionResult = fn(
            args, db, utils,
            frameworkEngine.analyzeJournalEntry, 
            frameworkEngine.detectChainsWithDetails, 
            frameworkEngine.matchChains,
            levenshteinDistance
        );

        // Parse result if it's a string json
        if (typeof executionResult === 'string') {
            try {
                return JSON.parse(executionResult);
            } catch {
                return { result: executionResult };
            }
        }
        return executionResult;
    } catch (err: any) {
        console.error("Tool Execution Error:", err);
        return { error: err.message };
    }
};
