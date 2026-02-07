
import { db } from './mockDb';
import * as frameworkEngine from './frameworkEngine';
import { levenshteinDistance } from './aiTools';
import { ToolDefinition } from '../types';

export const executeTool = (tool: string | ToolDefinition, args: any) => {
    // Helper object containing all imports
    const utils = {
        analyzeJournalEntry: frameworkEngine.analyzeJournalEntry,
        detectChainsWithDetails: frameworkEngine.detectChainsWithDetails,
        matchChains: frameworkEngine.matchChains,
        levenshteinDistance: levenshteinDistance
    };

    try {
        let executionResult: any;

        // Secure Execution Path: Use implementation function if available
        if (typeof tool !== 'string' && tool.implementation) {
            executionResult = tool.implementation(args);
        } else {
            // Legacy/Unsafe Execution Path: Use new Function
            const code = typeof tool === 'string' ? tool : tool.code;

            // Dynamic Execution with extended scope
            const fn = new Function(
                'args', 'db', 'utils',
                'analyzeJournalEntry', 'detectChainsWithDetails', 'matchChains', 'levenshteinDistance',
                code
            );

            executionResult = fn(
                args, db, utils,
                frameworkEngine.analyzeJournalEntry,
                frameworkEngine.detectChainsWithDetails,
                frameworkEngine.matchChains,
                levenshteinDistance
            );
        }

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
