/**
 * G4F Multi-Provider AI Gateway Service
 * Connects to g4f.dev API endpoints for access to 30+ AI providers and 900+ models
 * Supports streaming, vision, and provider-specific configurations
 */

// G4F Sub-providers available through g4f.dev
export type G4FSubProvider =
  | 'g4f-main'       // g4f.dev/v1 - requires API key
  | 'pollinations'   // Free, vision & image support
  | 'api.airforce'   // 60+ models, image generation
  | 'groq'           // Fast inference
  | 'huggingface'    // 180+ models
  | 'nvidia'         // 175+ models
  | 'ollama'         // Local models
  | 'openrouter'     // 30+ free models
  | 'deepinfra'      // 120+ models
  | 'gemini'         // Google models
  | 'puter'          // 400+ models
  | 'nectar'         // Pollinations variant
  | 'azure'          // Azure via g4f
  | 'custom'         // Custom server
  | 'auto';          // Auto-select best provider

export interface G4FProviderConfig {
  id: G4FSubProvider;
  label: string;
  description: string;
  baseUrl: string;
  requiresAuth: boolean;
  supportsVision: boolean;
  supportsStreaming: boolean;
  supportsImageGen: boolean;
  supportsAudio: boolean;
  supportsWebSearch?: boolean;
  useGateway?: boolean;
  icon: string;
  popularModels: string[];
  providerParam?: string; // For g4f.dev/v1 provider parameter
}

// G4F gateway uses /api/{provider}/ pattern
const G4F_GATEWAY_BASE = 'https://g4f.dev/api';

// Provider configurations with base URLs and capabilities
export const G4F_PROVIDERS: G4FProviderConfig[] = [
  {
    id: 'pollinations',
    label: 'Pollinations AI',
    description: 'Free AI with vision, image gen & audio',
    baseUrl: 'https://text.pollinations.ai/openai', // Updated base URL pattern
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: true,
    supportsAudio: true,
    supportsWebSearch: true,
    icon: '🌸',
    popularModels: ['openai', 'gpt-4o', 'claude-3.5-sonnet', 'gemini'], // Updated priority
    providerParam: 'pollinations'
  },
  {
    id: 'groq',
    label: 'Groq',
    description: 'Ultra-fast LPU inference',
    baseUrl: 'https://api.groq.com/openai/v1',
    requiresAuth: false,
    supportsVision: false,
    supportsStreaming: true,
    supportsImageGen: false,
    supportsAudio: true,
    useGateway: true,
    icon: '⚡',
    popularModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'qwen/qwen3-32b', 'moonshotai/kimi-k2-instruct', 'openai/gpt-oss-120b'],
    providerParam: 'groq'
  },
  {
    id: 'huggingface',
    label: 'HuggingFace',
    description: '180+ open-source models',
    baseUrl: 'https://api-inference.huggingface.co/v1',
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: true,
    supportsAudio: false,
    useGateway: true,
    icon: '🤗',
    popularModels: ['MiniMaxAI/MiniMax-M2.1', 'zai-org/GLM-4.7', 'deepseek-ai/DeepSeek-V3.2', 'Qwen/Qwen3-235B-A22B', 'meta-llama/Llama-3.3-70B-Instruct'],
    providerParam: 'huggingface'
  },
  {
    id: 'nvidia',
    label: 'Nvidia',
    description: '175+ models on Nvidia hardware',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: false,
    supportsAudio: false,
    useGateway: true,
    icon: '📟',
    popularModels: ['meta/llama-3.3-70b-instruct', 'deepseek-ai/deepseek-r1', 'google/gemma-3-27b-it', 'qwen/qwen3-235b-a22b', 'mistralai/mistral-large-2-instruct'],
    providerParam: 'nvidia'
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    description: '30+ free models, unified API',
    baseUrl: 'https://openrouter.ai/api/v1',
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: false,
    supportsAudio: false,
    useGateway: true,
    icon: '🔀',
    popularModels: ['openai/gpt-oss-120b:free', 'deepseek/deepseek-r1-0528:free', 'moonshotai/kimi-k2:free', 'google/gemini-2.0-flash-exp:free', 'meta-llama/llama-3.3-70b-instruct:free'],
    providerParam: 'openrouter'
  },
  {
    id: 'deepinfra',
    label: 'DeepInfra',
    description: '120+ models with fast inference',
    baseUrl: 'https://api.deepinfra.com/v1/openai',
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: true,
    supportsAudio: false,
    useGateway: true,
    icon: '🧠',
    popularModels: ['deepseek-ai/DeepSeek-V3.2', 'nvidia/Nemotron-3-Nano-30B-A3B', 'moonshotai/Kimi-K2-Thinking', 'Qwen/Qwen3-235B-A22B-Instruct-2507', 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8'],
    providerParam: 'deepinfra'
  },
  {
    id: 'api.airforce',
    label: 'API Airforce',
    description: '60+ models with image & video gen',
    baseUrl: 'https://api.airforce/v1',
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: true,
    supportsAudio: true,
    supportsWebSearch: true,
    useGateway: true,
    icon: '✈️',
    popularModels: ['llama-4-maverick', 'gpt-4o-mini', 'claude-sonnet-4.5', 'deepseek-v3.2', 'gemini-2.5-flash', 'kimi-k2-thinking'],
    providerParam: 'api.airforce'
  },
  {
    id: 'ollama',
    label: 'Ollama',
    description: 'Local model inference',
    baseUrl: 'http://localhost:11434/v1',
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: false,
    supportsAudio: false,
    icon: '🦙',
    popularModels: ['llama3.2', 'mistral', 'codellama', 'deepseek-v3.2', 'qwen3-coder:480b', 'gemma3:27b'],
    providerParam: 'ollama'
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    description: 'Google AI models via g4f',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: false,
    supportsAudio: false,
    useGateway: true,
    icon: '💎',
    popularModels: ['models/gemini-2.5-flash', 'models/gemini-2.5-pro', 'models/gemma-3-27b-it', 'models/gemma-3n-e4b-it'],
    providerParam: 'gemini'
  },
  {
    id: 'puter',
    label: 'Puter.js',
    description: '400+ models via Puter',
    baseUrl: 'https://api.puter.com/v1',
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: false,
    supportsAudio: false,
    useGateway: true,
    icon: '💻',
    popularModels: ['claude-3-7-sonnet-20250219', 'gpt-4o', 'gemini-2.5-flash', 'llama-3.3-70b'],
    providerParam: 'puter'
  },
  {
    id: 'g4f-main',
    label: 'G4F Main',
    description: 'Full G4F API with all providers',
    baseUrl: 'https://g4f.dev/api/default',
    requiresAuth: true,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: true,
    supportsAudio: true,
    supportsWebSearch: true,
    icon: '🔮',
    popularModels: ['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet', 'gemini-2.5-flash', 'deepseek-v3', 'llama-3.3-70b'],
    providerParam: undefined
  },
  {
    id: 'auto',
    label: 'Auto Select',
    description: 'Automatically pick best provider',
    baseUrl: 'https://text.pollinations.ai/openai',
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: false,
    supportsAudio: false,
    useGateway: true,
    icon: '🎯',
    popularModels: ['openai', 'gpt-4o', 'claude-3.5-sonnet', 'gemini-2.5-flash'],
    providerParam: 'auto'
  },
  {
    id: 'custom',
    label: 'Custom Server',
    description: 'Your own g4f server',
    baseUrl: 'http://localhost:1337/v1',
    requiresAuth: false,
    supportsVision: true,
    supportsStreaming: true,
    supportsImageGen: true,
    supportsAudio: true,
    icon: '🛠️',
    popularModels: [],
    providerParam: undefined
  }
];

// Get provider config by ID
export function getG4FProvider(id: G4FSubProvider): G4FProviderConfig | undefined {
  return G4F_PROVIDERS.find(p => p.id === id);
}

// Chat message format
export interface G4FMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | G4FContentPart[];
}

export interface G4FContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

// Chat request configuration
export interface G4FChatRequest {
  provider: G4FSubProvider;
  model: string;
  messages: G4FMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  apiKey?: string;
  customBaseUrl?: string;
  signal?: AbortSignal;
  systemPrompt?: string;
  // Provider-specific options
  providerOptions?: {
    webSearch?: boolean;
    imageSize?: string;
    responseFormat?: 'text' | 'json';
  };
}

// Chat response
export interface G4FChatResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

// Streaming callback type
export type G4FStreamCallback = (chunk: string, done: boolean) => void;

// Model info from API
export interface G4FModelInfo {
  id: string;
  object: string;
  owned_by?: string;
  created?: number;
}

// Cache for fetched models (with TTL)
const modelCache: Map<string, { models: string[]; timestamp: number }> = new Map();
const MODEL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

function resolveProviderEndpoint(
  provider: G4FSubProvider,
  apiKey?: string,
  customBaseUrl?: string
): {
  config: G4FProviderConfig;
  baseUrl: string;
  headers: Record<string, string>;
  providerParam?: string;
} {
  const config = getG4FProvider(provider);
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const useGateway = !customBaseUrl && config.useGateway;

  // G4F gateway uses pattern: https://g4f.dev/api/{provider}/
  // Direct providers use their own base URL
  let baseUrl: string;
  if (customBaseUrl) {
    baseUrl = customBaseUrl;
  } else if (useGateway) {
    // Use g4f.dev gateway with provider-specific path
    const providerPath = config.providerParam || provider;
    baseUrl = `${G4F_GATEWAY_BASE}/${providerPath}`;
  } else {
    baseUrl = config.baseUrl;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // G4F gateway doesn't require auth for most providers
  const authKey = apiKey || (provider === 'g4f-main' ? DEFAULT_G4F_API_KEY : undefined);
  if ((config.requiresAuth || provider === 'g4f-main') && authKey) {
    headers['Authorization'] = `Bearer ${authKey}`;
  }

  return {
    config,
    baseUrl,
    headers,
    // No longer needed since provider is in URL path
    providerParam: undefined,
  };
}

/**
 * Fetch available models from a G4F provider
 * Always fetches current list from API with caching
 */
export async function fetchG4FModels(
  provider: G4FSubProvider,
  apiKey?: string,
  customBaseUrl?: string
): Promise<string[]> {
  let config: G4FProviderConfig;
  let baseUrl: string;
  let headers: Record<string, string>;

  try {
    ({ config, baseUrl, headers } = resolveProviderEndpoint(provider, apiKey, customBaseUrl));
  } catch (error) {
    console.warn(error instanceof Error ? error.message : 'Unknown provider');
    return [];
  }

  const cacheKey = `${provider}-${baseUrl}`;
  const cached = modelCache.get(cacheKey);

  // Return cached if still valid
  if (cached && Date.now() - cached.timestamp < MODEL_CACHE_TTL) {
    return cached.models;
  }

  try {
    // Try /models endpoint
    const response = await fetchWithRetry(`${baseUrl}/models`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Silent fail for external provider issues - expected when services are down
      return config.popularModels;
    }

    let data;
    try {
      data = await response.json();
    } catch {
      console.warn(`Invalid JSON from ${provider} models endpoint`);
      return config.popularModels;
    }
    let models: string[] = [];

    // Handle different response formats
    if (Array.isArray(data)) {
      models = data.map((m: G4FModelInfo | string) =>
        typeof m === 'string' ? m : m.id
      );
    } else if (data.data && Array.isArray(data.data)) {
      models = data.data.map((m: G4FModelInfo) => m.id);
    } else if (data.models && Array.isArray(data.models)) {
      models = data.models;
    }

    // Filter and sort models
    models = models.filter(m => m && typeof m === 'string');

    // Cache the result
    modelCache.set(cacheKey, { models, timestamp: Date.now() });

    return models.length > 0 ? models : config.popularModels;
  } catch (error) {
    // Silent fail - external providers may be unavailable
    // Use debug level to avoid console spam
    if (import.meta.env.DEV) {
      console.debug(`Model fetch failed for ${provider}:`, error instanceof Error ? error.message : 'Unknown');
    }
    return config.popularModels;
  }
}

/**
 * Search/filter models by query
 */
export function searchModels(models: string[], query: string): string[] {
  if (!query.trim()) return models;

  const lowerQuery = query.toLowerCase();
  return models.filter(model =>
    model.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Main G4F chat function - non-streaming
 */
export async function g4fChat(request: G4FChatRequest): Promise<G4FChatResponse> {
  const { config, baseUrl, headers, providerParam } = resolveProviderEndpoint(
    request.provider,
    request.apiKey,
    request.customBaseUrl
  );

  // Build messages with system prompt
  const messages = [...request.messages];
  if (request.systemPrompt && !messages.some(m => m.role === 'system')) {
    messages.unshift({ role: 'system', content: request.systemPrompt });
  }

  const body: Record<string, unknown> = {
    model: request.model,
    messages,
    temperature: request.temperature ?? 0.7,
    stream: false,
  };

  if (request.maxTokens) {
    body.max_tokens = request.maxTokens;
  }

  if (providerParam) {
    body.provider = providerParam;
  }

  // Provider-specific options
  if (request.providerOptions?.webSearch && config.supportsWebSearch) {
    body.web_search = true;
  }

  const response = await fetchWithRetry(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: request.signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`G4F API error (${response.status}): ${errorText}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    const text = await response.text().catch(() => '');
    throw new Error(`Invalid JSON response: ${text.slice(0, 100)}`);
  }

  if (!data.choices || !data.choices[0]) {
    throw new Error('Invalid response from G4F API');
  }

  return {
    content: data.choices[0].message?.content || data.choices[0].text || '',
    model: data.model || request.model,
    provider: request.provider,
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens || 0,
      completionTokens: data.usage.completion_tokens || 0,
      totalTokens: data.usage.total_tokens || 0,
    } : undefined,
    finishReason: data.choices[0].finish_reason,
  };
}

/**
 * G4F streaming chat function
 * Returns an async generator that yields chunks
 */
export async function* g4fChatStream(
  request: G4FChatRequest
): AsyncGenerator<string, void, unknown> {
  const { config, baseUrl, headers, providerParam } = resolveProviderEndpoint(
    request.provider,
    request.apiKey,
    request.customBaseUrl
  );

  if (!config.supportsStreaming) {
    // Fallback to non-streaming
    const response = await g4fChat(request);
    yield response.content;
    return;
  }

  // Build messages with system prompt
  const messages = [...request.messages];
  if (request.systemPrompt && !messages.some(m => m.role === 'system')) {
    messages.unshift({ role: 'system', content: request.systemPrompt });
  }

  const body: Record<string, unknown> = {
    model: request.model,
    messages,
    temperature: request.temperature ?? 0.7,
    stream: true,
  };

  if (request.maxTokens) {
    body.max_tokens = request.maxTokens;
  }

  if (providerParam) {
    body.provider = providerParam;
  }

  if (request.providerOptions?.webSearch && config.supportsWebSearch) {
    body.web_search = true;
  }

  const response = await fetchWithRetry(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: request.signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`G4F API error (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let yielded = false;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed || trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              yielded = true;
              yield content;
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim() && buffer.trim() !== 'data: [DONE]') {
      if (buffer.startsWith('data: ')) {
        try {
          const json = JSON.parse(buffer.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yielded = true;
            yield content;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }

    if (!yielded && !request.signal?.aborted) {
      const fallback = await g4fChat({ ...request, stream: false });
      if (fallback.content) {
        yield fallback.content;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * G4F streaming chat with callback
 * Easier to use in React components
 */
export async function g4fChatStreamCallback(
  request: G4FChatRequest,
  onChunk: G4FStreamCallback
): Promise<string> {
  let fullContent = '';

  try {
    for await (const chunk of g4fChatStream(request)) {
      fullContent += chunk;
      onChunk(chunk, false);
    }
    onChunk('', true);
  } catch (error) {
    onChunk('', true);
    throw error;
  }

  return fullContent;
}

/**
 * Fetch available providers from g4f.dev (for g4f-main)
 */
export async function fetchG4FProviders(apiKey?: string): Promise<string[]> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetchWithRetry('https://g4f.dev/v1/providers', {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return [];
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return [];
    }
    return Array.isArray(data) ? data.map((p: { id: string }) => p.id) : [];
  } catch {
    return [];
  }
}

/**
 * Test provider connectivity
 */
export async function testG4FProvider(
  provider: G4FSubProvider,
  apiKey?: string,
  customBaseUrl?: string
): Promise<{ success: boolean; latency: number; error?: string }> {
  const start = Date.now();

  try {
    const { baseUrl, headers } = resolveProviderEndpoint(provider, apiKey, customBaseUrl);

    // Simple ping with minimal request
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers,
    });

    const latency = Date.now() - start;

    if (response.ok) {
      return { success: true, latency };
    } else {
      return { success: false, latency, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    const latency = Date.now() - start;
    return {
      success: false,
      latency,
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

/**
 * Convert universal messages to G4F format
 */
export function toG4FMessages(
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string
): G4FMessage[] {
  const g4fMessages: G4FMessage[] = [];

  if (systemPrompt) {
    g4fMessages.push({ role: 'system', content: systemPrompt });
  }

  for (const msg of messages) {
    const role = msg.role === 'model' ? 'assistant' : msg.role as 'user' | 'assistant' | 'system';
    g4fMessages.push({ role, content: msg.content });
  }

  return g4fMessages;
}

/**
 * Clear model cache (useful when switching providers)
 */
export function clearModelCache(provider?: G4FSubProvider): void {
  if (provider) {
    const keysToDelete: string[] = [];
    modelCache.forEach((_, key) => {
      if (key.startsWith(provider)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => modelCache.delete(key));
  } else {
    modelCache.clear();
  }
}

// Default G4F API key (can be overridden by user)
export const DEFAULT_G4F_API_KEY = 'g4f_u_mk4lyf_6acb6461af049be7b75e638d8f7f7d6a262504574eaccf57_c3e14805';
