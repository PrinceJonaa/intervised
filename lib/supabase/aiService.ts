/**
 * Azure AI Service - Frontend Client
 * 
 * This module provides a secure interface to the Azure AI models through
 * a Supabase Edge Function. All API keys are kept server-side.
 * 
 * Available Models (in order of cost efficiency):
 * 1. DeepSeek-V3.2 - Primary ($0.28/$0.42 per 1M tokens) - No vision
 * 2. Kimi-K2-Thinking - Fallback ($0.60/$2.50 per 1M tokens) - Long context
 * 3. GPT-4.1 - Premium ($2.00/$8.00 per 1M tokens) - Vision support
 * 4. Grok-4-Fast - Reasoning ($5.50/$27.50 per 1M tokens) - Vision + 2M context
 * 
 * User limit: $5.00 per authenticated user
 */

import { supabase } from './client';

// ============================================================
// TYPES
// ============================================================

export type AzureModel =
  | 'deepseek-v3.2'     // Primary - most cost efficient
  | 'kimi-k2-thinking'  // Good for long contexts
  | 'gpt-4.1'           // Vision capable
  | 'grok-4-fast-reasoning'; // Premium - reasoning + vision

export interface AzureChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
}

export interface AzureChatRequest {
  messages: AzureChatMessage[];
  model?: AzureModel;
  temperature?: number;
  maxTokens?: number;
  tools?: AzureToolDefinition[];
  sessionId?: string;
  requiresVision?: boolean;
  signal?: AbortSignal;
}

export interface AzureToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface AzureChatResponse {
  content: string;
  model: AzureModel;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
  spending: {
    current: number;
    limit: number;
    remaining: number;
  };
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  finishReason: string;
}

export interface SpendingInfo {
  current: number;
  limit: number;
  remaining: number;
  isUnderLimit: boolean;
}

export class AISpendingLimitError extends Error {
  spending: SpendingInfo;

  constructor(message: string, spending: SpendingInfo) {
    super(message);
    this.name = 'AISpendingLimitError';
    this.spending = spending;
  }
}

export class AIAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIAuthError';
  }
}

// ============================================================
// MODEL INFO (for UI display)
// ============================================================

export const MODEL_INFO: Record<AzureModel, {
  name: string;
  description: string;
  maxInput: number;
  maxOutput: number;
  supportsVision: boolean;
  costTier: 'budget' | 'standard' | 'premium';
}> = {
  'deepseek-v3.2': {
    name: 'DeepSeek V3.2',
    description: 'Most cost-efficient. Great for general chat.',
    maxInput: 131072,
    maxOutput: 131072,
    supportsVision: false,
    costTier: 'budget',
  },
  'kimi-k2-thinking': {
    name: 'Kimi K2 Thinking',
    description: 'Extended context (256K). Good for long documents.',
    maxInput: 262144,
    maxOutput: 262144,
    supportsVision: false,
    costTier: 'standard',
  },
  'gpt-4.1': {
    name: 'GPT-4.1',
    description: 'Vision capable. 1M token context.',
    maxInput: 1000000,
    maxOutput: 32768,
    supportsVision: true,
    costTier: 'standard',
  },
  'grok-4-fast-reasoning': {
    name: 'Grok 4 Fast Reasoning',
    description: 'Premium reasoning with 2M context + vision.',
    maxInput: 2000000,
    maxOutput: 30000,
    supportsVision: true,
    costTier: 'premium',
  },
};

// ============================================================
// MAIN SERVICE
// ============================================================

// Helper for retrying fetches
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  backoff = 1000
): Promise<Response> {
  let lastError: any;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      // 5xx errors should be retried
      if (response.status >= 500 && response.status < 600) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response;
    } catch (error: any) {
      if (error?.name === 'AbortError') throw error; // Don't retry aborts
      lastError = error;
      if (attempt < retries - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

/**
 * Send a chat message through the secure Azure AI Edge Function
 */
export async function azureChat(request: AzureChatRequest): Promise<AzureChatResponse> {
  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new AIAuthError('You must be signed in to use the AI assistant.');
  }

  // Get the Edge Function URL
  // @ts-ignore - Vite injects env vars at build time
  const supabaseUrl = (import.meta as any).env?.VITE_PUBLIC_SUPABASE_URL || 'https://jnfnqtohljybohlcslnm.supabase.co';
  const functionUrl = `${supabaseUrl}/functions/v1/azure-ai-chat`;

  const response = await fetchWithRetry(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    signal: request.signal,
    body: JSON.stringify({
      messages: request.messages,
      model: request.model,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 2048,
      tools: request.tools,
      sessionId: request.sessionId,
      requiresVision: request.requiresVision,
    }),
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    // If not JSON, it might be a raw text error (e.g. 502 Bad Gateway from a proxy)
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed (${response.status}): ${text.slice(0, 100)}`);
  }

  if (response.status === 401) {
    throw new AIAuthError(data.message || 'Authentication required');
  }

  if (response.status === 429) {
    throw new AISpendingLimitError(data.message || 'Spending limit reached', {
      current: data.spending?.current || 5,
      limit: data.spending?.limit || 5,
      remaining: data.spending?.remaining || 0,
      isUnderLimit: false,
    });
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed: ${response.status}`);
  }

  return data as AzureChatResponse;
}

/**
 * Get current spending information for the authenticated user
 */
export async function getSpendingInfo(): Promise<SpendingInfo> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AIAuthError('You must be signed in to check spending.');
  }

  const { data, error } = await supabase
    .rpc('check_ai_spending_limit', {
      p_user_id: user.id,
      p_limit_usd: 5.0
    });

  if (error) {
    console.error('Failed to get spending info:', error);
    // Return default values on error
    return {
      current: 0,
      limit: 5,
      remaining: 5,
      isUnderLimit: true,
    };
  }

  const result = data?.[0] || { is_under_limit: true, current_spending: 0, remaining_budget: 5 };

  return {
    current: Number(result.current_spending) || 0,
    limit: 5,
    remaining: Number(result.remaining_budget) || 5,
    isUnderLimit: result.is_under_limit,
  };
}

/**
 * Get usage history for the authenticated user
 */
export async function getUsageHistory(limit = 50): Promise<Array<{
  id: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  createdAt: string;
}>> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AIAuthError('You must be signed in to view usage history.');
  }

  const { data, error } = await supabase
    .from('ai_usage')
    .select('id, model_name, input_tokens, output_tokens, cost_usd, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to get usage history:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    modelName: row.model_name,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
    costUsd: Number(row.cost_usd),
    createdAt: row.created_at,
  }));
}

/**
 * Helper to convert chat messages to Azure format
 */
export function toAzureMessages(
  systemPrompt: string,
  history: Array<{ role: 'user' | 'model' | 'system'; text: string }>
): AzureChatMessage[] {
  const messages: AzureChatMessage[] = [];

  // Add system prompt
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  // Convert history
  for (const msg of history) {
    if (msg.role === 'system') continue; // Skip system messages in history
    messages.push({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text,
    });
  }

  return messages;
}

/**
 * Helper to select the best model for a given use case
 */
export function selectBestModel(options: {
  requiresVision?: boolean;
  contextLength?: number;
  preferCheapest?: boolean;
}): AzureModel {
  const { requiresVision, contextLength = 0, preferCheapest = true } = options;

  // If vision is required, we need GPT-4.1 or Grok
  if (requiresVision) {
    return preferCheapest ? 'gpt-4.1' : 'grok-4-fast-reasoning';
  }

  // For very long contexts
  if (contextLength > 131072) {
    if (contextLength > 262144) {
      return 'gpt-4.1'; // 1M context
    }
    return 'kimi-k2-thinking'; // 256K context
  }

  // Default to cheapest option
  return 'deepseek-v3.2';
}
