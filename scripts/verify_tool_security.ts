// scripts/verify_tool_security.ts

// Mock DOM environment for mockDb
const mockLocalStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

// @ts-ignore
global.window = {
  localStorage: mockLocalStorage
} as any;

// @ts-ignore
global.localStorage = mockLocalStorage;

import { executeTool } from '../lib/toolExecutor';
import { ToolDefinition } from '../types';

console.log("🔒 Starting Tool Security Verification...");

let safeImplementationCalled = false;

const safeTool: ToolDefinition = {
  name: "safeTool",
  description: "A secure tool",
  parameters: "{}",
  code: "throw new Error('This code should NOT run');",
  enabled: true,
  implementation: (args: any) => {
    safeImplementationCalled = true;
    return { success: true, args };
  }
};

try {
  const result = executeTool(safeTool, { test: "data" });

  if (!safeImplementationCalled) {
    console.error("❌ FAILED: Implementation function was NOT called.");
    process.exit(1);
  }

  // The result might be returned as is, or parsed if it was a string.
  // In our implementation, we return the result of the function directly.
  if (JSON.stringify(result) !== JSON.stringify({ success: true, args: { test: "data" } })) {
    console.error("❌ FAILED: Incorrect result returned.");
    console.error("Expected:", { success: true, args: { test: "data" } });
    console.error("Actual:", result);
    process.exit(1);
  }

  console.log("✅ PASSED: Secure implementation was called instead of 'new Function'.");

  // Test fallback
  const fallbackCode = "return { fallback: true };";
  const fallbackTool: ToolDefinition = {
      name: "fallbackTool",
      description: "A tool without implementation",
      parameters: "{}",
      code: fallbackCode,
      enabled: true
  };

  const fallbackResult = executeTool(fallbackTool, {});
  if (fallbackResult.fallback !== true) {
      console.error("❌ FAILED: Fallback code execution failed.");
      process.exit(1);
  }
  console.log("✅ PASSED: Fallback 'new Function' execution still works for tools without implementation.");

} catch (e) {
  console.error("❌ FAILED: Exception during execution:", e);
  process.exit(1);
}

console.log("🛡️ Security Verification Successful!");
