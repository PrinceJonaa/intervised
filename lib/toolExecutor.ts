
import { db } from './mockDb';
import * as frameworkEngine from './frameworkEngine';
import { levenshteinDistance } from './aiTools';

export const executeTool = (code: string, args: any, implementation?: (...args: any[]) => any) => {
    // 1. Safe Direct Execution (Preferred)
    if (implementation) {
        try {
            const result = implementation(args);
            // Parse result if it's a string json (matches legacy behavior)
            if (typeof result === 'string') {
                try {
                    return JSON.parse(result);
                } catch {
                    return { result };
                }
            }
            return result;
        } catch (err: any) {
            console.error("Tool Execution Error (Direct):", err);
            return { error: err.message };
        }
    }

    // 2. Dynamic Execution (Legacy/Fallback)
    // Helper object containing all imports
    const utils = {
        analyzeJournalEntry: frameworkEngine.analyzeJournalEntry,
        detectChainsWithDetails: frameworkEngine.detectChainsWithDetails,
        matchChains: frameworkEngine.matchChains,
        levenshteinDistance: levenshteinDistance
    };

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
        console.error("Tool Execution Error (Dynamic):", err);
        return { error: err.message };
    }
};
