
import { db } from './mockDb';
import * as frameworkEngine from './frameworkEngine';
import { levenshteinDistance } from './aiTools';
import { ToolDefinition } from '../types';

export const executeTool = (toolSource: string | ToolDefinition, args: any) => {
    // 1. Secure Path: Use pre-compiled implementation if available
    // This avoids 'new Function' (eval) for built-in tools, improving security
    if (typeof toolSource === 'object' && toolSource.implementation) {
        try {
             const executionResult = toolSource.implementation(args);

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
             console.error("Tool Execution Error (Secure):", err);
             return { error: err.message };
        }
    }

    // 2. Dynamic Path: Fallback for custom/edited tools
    // This uses 'new Function', which is necessary for user-defined logic
    const code = typeof toolSource === 'string' ? toolSource : toolSource.code;

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
