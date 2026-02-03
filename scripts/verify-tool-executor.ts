
import { executeTool } from '../lib/toolExecutor';
import { ToolDefinition } from '../types';

async function main() {
    console.log("Starting Tool Executor Verification...");

    // Test 1: Secure Implementation
    console.log("\nTest 1: Secure Implementation");
    const secureTool: ToolDefinition = {
        name: "secure_tool",
        description: "A secure tool",
        parameters: "{}",
        code: "/* unused code */",
        enabled: true,
        implementation: (args: any) => {
            return JSON.stringify({ success: true, method: "implementation", args });
        }
    };

    try {
        const result1 = await executeTool(secureTool, { test: 123 });
        console.log("Result 1:", result1);
        if (result1.method === "implementation" && result1.args.test === 123) {
            console.log("✅ Test 1 Passed");
        } else {
            console.error("❌ Test 1 Failed: Unexpected result");
            process.exit(1);
        }
    } catch (e) {
        console.error("❌ Test 1 Failed with error:", e);
        process.exit(1);
    }

    // Test 2: Legacy String Code (Simulating RCE fallback)
    console.log("\nTest 2: Legacy String Code");
    // We use a simple return statement. new Function wraps it.
    const legacyCode = "return JSON.stringify({ success: true, method: 'eval', args: args });";

    // Note: executeTool accepts ToolDefinition | string.
    // If we pass a string, it uses legacy path.
    // If we pass a ToolDefinition WITHOUT implementation, it uses legacy path (using .code).

    try {
        const result2 = await executeTool(legacyCode, { test: 456 });
        console.log("Result 2:", result2);
        if (result2.method === "eval" && result2.args.test === 456) {
            console.log("✅ Test 2 Passed (String Input)");
        } else {
             console.error("❌ Test 2 Failed: Unexpected result");
             process.exit(1);
        }

        const legacyToolDef: ToolDefinition = {
            name: "legacy_tool",
            description: "A legacy tool",
            parameters: "{}",
            code: legacyCode,
            enabled: true
            // No implementation
        };

        const result3 = await executeTool(legacyToolDef, { test: 789 });
        console.log("Result 3:", result3);
        if (result3.method === "eval" && result3.args.test === 789) {
            console.log("✅ Test 3 Passed (ToolDef without implementation)");
        } else {
             console.error("❌ Test 3 Failed: Unexpected result");
             process.exit(1);
        }

    } catch (e) {
        console.error("❌ Test 2/3 Failed with error:", e);
        process.exit(1);
    }

    console.log("\nAll tests passed!");
}

main();
