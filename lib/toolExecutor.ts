
import { db } from './mockDb';
import * as frameworkEngine from './frameworkEngine';
import { levenshteinDistance } from './aiTools';
import { ToolDefinition } from '../types';

export const executeTool = (tool: string | ToolDefinition, args: any) => {
    // Check for secure implementation first
    if (typeof tool !== 'string' && tool.implementation) {
        try {
            const result = tool.implementation(args);
            // Parse result if it's a string json
            if (typeof result === 'string') {
                try {
                    return JSON.parse(result);
                } catch {
                    return { result };
                }
            }
            return result;
        } catch (err: any) {
            console.error("Tool Execution Error (Secure):", err);
            return { error: err.message };
        }
    }

    const code = typeof tool === 'string' ? tool : tool.code;

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
        console.error("Tool Execution Error:", err);
        return { error: err.message };
    }
};
