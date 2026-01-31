
import { db } from './mockDb';
import * as frameworkEngine from './frameworkEngine';
import { levenshteinDistance } from './aiTools';
import { ToolDefinition } from '../types';

export const executeTool = (tool: ToolDefinition, args: any) => {
    // 1. Prefer Secure Direct Execution
    // This avoids `new Function` (eval) entirely for built-in tools.
    if (tool.implementation) {
        try {
            const executionResult = tool.implementation(args);

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
            console.error(`Tool Execution Error (${tool.name}):`, err);
            return { error: err.message };
        }
    }

    // 2. Legacy/Dynamic Execution Fallback
    // Used for tools created/edited by the user at runtime.
    // WARNING: This uses `new Function` which is akin to eval.
    const code = tool.code;

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
