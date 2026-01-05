
import { AIProvider, ChatMessage } from '../types';

interface UniversalChatRequest {
  provider: AIProvider;
  model: string;
  apiKey: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  temperature?: number;
  azureEndpoint?: string;
  azureDeployment?: string;
}

export async function universalChat(request: UniversalChatRequest): Promise<string> {
  const { provider, model, apiKey, messages, temperature = 0.7 } = request;

  if (provider === 'openai' || provider === 'grok') {
    const baseUrl = provider === 'grok' ? 'https://api.x.ai/v1' : 'https://api.openai.com/v1';
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
    return data.choices[0].message.content || '';
  }

  if (provider === 'claude') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true' // In a production environment this should be handled via a proxy
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })),
        system: messages.find(m => m.role === 'system')?.content,
        temperature
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
    return data.content[0].text || '';
  }

  if (provider === 'azure') {
    if (!request.azureEndpoint) throw new Error("Azure Endpoint is required");
    const deployment = request.azureDeployment || model;
    const url = `${request.azureEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-01`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
    return data.choices[0].message.content || '';
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
