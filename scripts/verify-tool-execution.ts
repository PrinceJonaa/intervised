
// Mock localStorage before imports
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null
};
(global as any).localStorage = localStorageMock;
(global as any).window = { localStorage: localStorageMock };

// Import after mocking
import { executeTool } from '../lib/toolExecutor';
import { ToolDefinition } from '../types';

console.log("Starting verification...");

let implementationCalled = false;

const testTool: ToolDefinition = {
    name: "test_tool",
    description: "A test tool",
    parameters: "{}",
    code: "return 'code_exec';",
    enabled: true,
    implementation: (args: any) => {
        console.log("Inside implementation");
        implementationCalled = true;
        return JSON.stringify({ success: true, message: "secure" });
    }
};

try {
    const result = executeTool(testTool, {});
    console.log("Result:", JSON.stringify(result));

    if (implementationCalled) {
        console.log("✅ SUCCESS: Implementation was called.");
    } else {
        console.error("❌ FAILURE: Implementation was NOT called.");
        process.exit(1);
    }

    if (result.success === true && result.message === 'secure') {
        console.log("✅ SUCCESS: Result matched implementation return value.");
    } else {
        console.error(`❌ FAILURE: Result mismatch.`);
        process.exit(1);
    }

    // Optional: Test fallback
    console.log("Testing fallback path...");
    const fallbackTool: ToolDefinition = {
        ...testTool,
        implementation: undefined,
        code: "return JSON.stringify({ success: true, message: 'fallback' });"
    };

    // Fallback uses new Function, which returns the string directly.
    // executeTool then tries to parse it.
    const fallbackResult = executeTool(fallbackTool, {});
    console.log("Fallback Result:", JSON.stringify(fallbackResult));

    if (fallbackResult.success === true && fallbackResult.message === 'fallback') {
        console.log("✅ SUCCESS: Fallback execution worked.");
    } else {
        console.log(`ℹ️ INFO: Fallback execution returned unexpected result.`);
    }

} catch (error) {
    console.error("Verification failed with error:", error);
    process.exit(1);
}
