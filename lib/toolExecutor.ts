
import { db } from './mockDb';
import * as frameworkEngine from './frameworkEngine';
import { levenshteinDistance } from './aiTools';
import { ToolDefinition } from '../types';

export const executeTool = (tool: ToolDefinition, args: any) => {
    // Secure Path: Use implementation if available
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
            console.error("Tool Execution Error (Secure Path):", err);
            return { error: err.message };
        }
    }

    // Helper object containing all imports
    const utils = {
        analyzeJournalEntry: frameworkEngine.analyzeJournalEntry,
        detectChainsWithDetails: frameworkEngine.detectChainsWithDetails,
        matchChains: frameworkEngine.matchChains,
        levenshteinDistance: levenshteinDistance
    };

    try {
        // Dynamic Execution with extended scope (Legacy/Custom)
        // Note: This uses new Function which is eval-like. Only safe for trusted code.
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
        console.error("Tool Execution Error (Dynamic Path):", err);
        return { error: err.message };
    }
};
