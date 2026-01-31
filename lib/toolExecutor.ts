
import { db } from './mockDb';
import * as frameworkEngine from './frameworkEngine';
import { levenshteinDistance } from './aiTools';
import { ToolDefinition } from '../types';

export const executeTool = (toolOrCode: ToolDefinition | string, args: any) => {
    // Helper object containing all imports
    const utils = {
        analyzeJournalEntry: frameworkEngine.analyzeJournalEntry,
        detectChainsWithDetails: frameworkEngine.detectChainsWithDetails,
        matchChains: frameworkEngine.matchChains,
        levenshteinDistance: levenshteinDistance
    };

    try {
        let executionResult;

        // SAFE PATH: Use direct implementation if available
        if (typeof toolOrCode === 'object' && toolOrCode.implementation) {
            executionResult = toolOrCode.implementation(args);
        }
        // LEGACY / UNSAFE PATH: Use new Function
        else {
            const code = typeof toolOrCode === 'string' ? toolOrCode : toolOrCode.code;

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
