
import { db } from './mockDb';
import * as frameworkEngine from './frameworkEngine';
import { levenshteinDistance } from './aiTools';
import { ToolDefinition } from '../types';

export const executeTool = (tool: ToolDefinition, args: any) => {
    try {
        // 1. SECURE PATH: Use direct implementation reference
        if (tool.implementation) {
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
        }

        // 2. LEGACY/CUSTOM PATH: Dynamic Execution (fallback)
        // Helper object containing all imports
        const utils = {
            analyzeJournalEntry: frameworkEngine.analyzeJournalEntry,
            detectChainsWithDetails: frameworkEngine.detectChainsWithDetails,
            matchChains: frameworkEngine.matchChains,
            levenshteinDistance: levenshteinDistance
        };

        // Dynamic Execution with extended scope
        const fn = new Function(
            'args', 'db', 'utils', 
            'analyzeJournalEntry', 'detectChainsWithDetails', 'matchChains', 'levenshteinDistance',
            tool.code
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
