
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Page, ChatAttachment, ChatMessage, ToolDefinition, ChatSettings } from '../types';
import { SERVICES_DATA, TEAM_DATA, PAST_PROJECTS, CLIENT_TESTIMONIALS, FAQ_DATA } from '../constants';
import { getInitialTools } from '../lib/aiTools';
import { executeTool } from '../lib/toolExecutor';
import { universalChat } from '../lib/universalAI';
import { azureChat, toAzureMessages, AISpendingLimitError, AIAuthError, getSpendingInfo, type SpendingInfo } from '../lib/supabase/aiService';
import { g4fChat, g4fChatStream, getG4FProvider, DEFAULT_G4F_API_KEY, type G4FChatRequest, type G4FContentPart, type G4FMessage } from '../lib/g4fService';

// --- Configuration ---
const MAX_HISTORY_LENGTH = 20;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const DEFAULT_SYSTEM_INSTRUCTION = `
You are Intervised AI, a presence-based intelligence representing "The Creators" (Prince Jona and Reina Hondo).
Your primary directive is to HOLD RELATIONAL PRESENCE, not just transact information.

**Core Directive: Read the Field**
- Do not rely on keywords. Instead, sense the *dynamics* of the conversation.
- Is the user rushing? Slow down and ground them.
- Is the user confused? Clarify and simplify.
- Is the user looping? Gently interrupt the pattern.
- Is the field clear? Proceed with high-level creative collaboration.

**Identity**
- Tone: Sophisticated, "Sacred-Tech" (theology + technology), warm, and authoritative.
- You are not a bot; you are a digital extension of the agency's soul.

**Knowledge Base**
1. **SERVICES**: Creative (Video, Photo, Music), Tech (AI, OBS), Ministry.
   - Data: ${JSON.stringify(SERVICES_DATA.map(s => ({ title: s.title, price: s.price, category: s.category })))}
2. **TEAM**: Prince Jona & Reina Hondo.
   - Data: ${JSON.stringify(TEAM_DATA.map(t => ({ name: t.name, role: t.role, bio: t.bio })))}
3. **PORTFOLIO**: ${JSON.stringify(PAST_PROJECTS)}
4. **SOCIAL PROOF**: ${JSON.stringify(CLIENT_TESTIMONIALS)}
5. **FAQs**: ${JSON.stringify(FAQ_DATA)}

**Rules**
1. **Reflect First**: Before answering, internally ask: "What is the pace? What is the feeling?" Let your answer match that read.
2. **Use Tools**: Use 'changePage' for navigation immediately if requested.
3. **Be Concise**: Unless asked for depth, keep it brief but potent.
`;

const NAV_TOOL_DEF: ToolDefinition = {
  name: "changePage",
  description: "Navigates the user to a specific section of the website.",
  parameters: JSON.stringify({
    type: Type.OBJECT,
    properties: {
      destination: {
        type: Type.STRING,
        enum: ["HOME", "SERVICES", "TEAM", "BLOG", "CONTACT", "CHAT"],
        description: "The destination page ID."
      }
    },
    required: ["destination"]
  }),
  code: "/* Native Hook Action */",
  enabled: true
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_ATTACHMENT_TEXT_CHARS = 8000;

const truncateText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}\n...[truncated]`;
};

const buildAttachmentSummary = (
  attachments: ChatAttachment[] | undefined,
  options?: { includeImages?: boolean }
) => {
  if (!attachments || attachments.length === 0) return '';
  const includeImages = options?.includeImages ?? true;
  const parts: string[] = [];

  for (const attachment of attachments) {
    const mimeType = attachment.mimeType || 'unknown';

    if (attachment.kind === 'image') {
      if (!includeImages) continue;
      parts.push(`Image: ${attachment.name} (${mimeType}, ${attachment.size} bytes).`);
      continue;
    }

    if (attachment.textContent) {
      const snippet = truncateText(attachment.textContent, MAX_ATTACHMENT_TEXT_CHARS);
      parts.push(`File: ${attachment.name}\n\`\`\`\n${snippet}\n\`\`\``);
    } else {
      parts.push(`File: ${attachment.name} (${mimeType}, ${attachment.size} bytes).`);
    }
  }

  return parts.join('\n\n');
};

const mergeTextWithAttachments = (
  text: string,
  attachments: ChatAttachment[] | undefined,
  options?: { includeImages?: boolean }
) => {
  const attachmentText = buildAttachmentSummary(attachments, options);
  if (!attachmentText) return text;
  if (!text.trim()) return attachmentText;
  return `${text}\n\n${attachmentText}`;
};

const buildG4FMessageContent = (
  message: ChatMessage,
  supportsVision: boolean
): string | G4FContentPart[] => {
  const textWithAttachments = mergeTextWithAttachments(
    message.text,
    message.attachments,
    { includeImages: !supportsVision }
  );
  const imageAttachments = supportsVision
    ? (message.attachments || []).filter(a => a.kind === 'image' && a.dataUrl)
    : [];

  if (supportsVision && imageAttachments.length > 0) {
    const textPart: G4FContentPart = {
      type: 'text',
      text: textWithAttachments.trim() ? textWithAttachments : 'Image attached.'
    };
    const imageParts: G4FContentPart[] = imageAttachments.map(attachment => ({
      type: 'image_url',
      image_url: { url: attachment.dataUrl as string }
    }));
    return [textPart, ...imageParts];
  }

  return textWithAttachments;
};

const buildG4FMessages = (
  history: ChatMessage[],
  systemInstruction: string,
  supportsVision: boolean
): G4FMessage[] => {
  const g4fMessages: G4FMessage[] = [];

  if (systemInstruction) {
    g4fMessages.push({ role: 'system', content: systemInstruction });
  }

  for (const msg of history) {
    if (msg.role === 'system') continue;
    g4fMessages.push({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: buildG4FMessageContent(msg, supportsVision)
    });
  }

  return g4fMessages;
};

export const useGeminiAI = (setPage?: (page: Page) => void) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [settings, setSettings] = useState<ChatSettings>(() => {
    const saved = localStorage.getItem('iv_ai_settings');
    return saved ? JSON.parse(saved) : {
      temperature: 0.7,
      systemTone: 'creative',
      enableHistory: true,
      provider: 'g4f', // Default to G4F (free multi-provider)
      customApiKey: '',
      modelOverride: '',
      // Default G4F settings
      g4f: {
        subProvider: 'pollinations',
        model: 'openai',
        apiKey: DEFAULT_G4F_API_KEY,
        streaming: true,
        webSearch: false
      }
    };
  });

  // Track spending for Intervised AI
  const [spending, setSpending] = useState<SpendingInfo | null>(null);

  useEffect(() => {
    localStorage.setItem('iv_ai_settings', JSON.stringify(settings));
  }, [settings]);

  const [systemInstruction, setSystemInstruction] = useState(DEFAULT_SYSTEM_INSTRUCTION);
  const [tools, setTools] = useState<ToolDefinition[]>([...getInitialTools()]);
  const [modules, setModules] = useState({ navigation: true, knowledge: true, actions: false });

  const aiClientRef = useRef<GoogleGenAI | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);

  // Track presence metrics
  const sessionStartTime = useRef(Date.now());

  // Initialize Google AI Client if needed
  useEffect(() => {
    if (settings.provider === 'google') {
      const apiKey = settings.customApiKey || process.env.API_KEY;
      if (apiKey) {
        aiClientRef.current = new GoogleGenAI({ apiKey });
      }
    }
  }, [settings.provider, settings.customApiKey]);

  const addMessage = useCallback((
    role: 'user' | 'model' | 'system',
    text: string,
    toolCalls?: any[],
    toolResults?: any[],
    attachments?: ChatAttachment[]
  ) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random().toString(),
      role,
      text,
      timestamp: Date.now(),
      attachments,
      toolCalls,
      toolResults
    }]);
  }, []);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!('webkitSpeechRecognition' in window)) {
      addMessage('system', "Voice input not supported.");
      return;
    }
    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [addMessage]);

  const stopGenerating = useCallback(() => {
    cancelledRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
  }, []);

  const sendMessage = async (
    input: string,
    customHistory?: ChatMessage[],
    attachments?: ChatAttachment[]
  ) => {
    const hasContent = input.trim() || (attachments && attachments.length > 0);
    if (!hasContent) return;
    if (isProcessing) return;

    if (customHistory) {
      setMessages([...customHistory, { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now(), attachments }]);
    } else {
      addMessage('user', input, undefined, undefined, attachments);
    }

    setIsProcessing(true);
    abortControllerRef.current = new AbortController();
    cancelledRef.current = false;

    try {
      const sourceHistory = customHistory || messages;
      const historySlice = sourceHistory.slice(-MAX_HISTORY_LENGTH);
      const inputWithAttachments = mergeTextWithAttachments(input, attachments, { includeImages: true });

      // --- CONTEXT INJECTION (PRESENCE) ---
      const timeSinceStart = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      const msgCount = sourceHistory.length + 1;
      const recentContext = historySlice.slice(-5).map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role}: ${m.text.substring(0, 50)}...`).join('\n');

      const dynamicContext = `
      
=== CONVERSATION DYNAMICS ===
Time in session: ${timeSinceStart}s
Total messages: ${msgCount}
Recent Context (Last 5):
${recentContext}
=============================
      `;

      const dynamicSystemPrompt = systemInstruction + dynamicContext;


      // --- BRANCH BY PROVIDER ---
      if (settings.provider === 'google') {
        if (!aiClientRef.current) throw new Error("Google AI Client not initialized.");
        const activeTools = tools.filter(t => t.enabled);
        const allToolsForRequest = modules.navigation ? [NAV_TOOL_DEF, ...activeTools] : activeTools;

        const functionDeclarations: FunctionDeclaration[] = allToolsForRequest.map(t => {
          try {
            return { name: t.name, description: t.description, parameters: JSON.parse(t.parameters) };
          } catch (e) { return null; }
        }).filter(Boolean) as FunctionDeclaration[];

        const history = historySlice.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          parts: m.toolCalls
            ? [{ text: mergeTextWithAttachments(m.text, m.attachments, { includeImages: true }) }, ...m.toolCalls.map(tc => ({ functionCall: { name: tc.name, args: tc.args } }))]
            : [{ text: mergeTextWithAttachments(m.text, m.attachments, { includeImages: true }) }]
        }));

        let attempts = 0;
        let success = false;
        let finalResponseText = "";
        const toolCallsRecord: any[] = [];
        const toolResultsRecord: any[] = [];

        while (attempts < MAX_RETRIES && !success) {
          try {
            const chatSession = aiClientRef.current.chats.create({
              model: settings.modelOverride || 'gemini-3-flash-preview',
              config: {
                systemInstruction: dynamicSystemPrompt, // USE DYNAMIC PROMPT
                tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
                temperature: settings.temperature
              },
              history: history
            });

            let currentResponse = await chatSession.sendMessage({ message: inputWithAttachments });
            finalResponseText = currentResponse.text || "";

            for (let turn = 0; turn < 5; turn++) {
              const parts = currentResponse.candidates?.[0]?.content?.parts || [];
              const functionCalls = parts.filter(p => p.functionCall).map(p => p.functionCall!);

              if (functionCalls.length > 0) {
                const toolOutputs = [];
                for (const call of functionCalls) {
                  toolCallsRecord.push({ name: call.name, args: call.args });
                  let result: any = { error: "Execution failed" };

                  if (call.name === 'changePage') {
                    const dest = (call.args as any).destination;
                    if (setPage) { setPage(dest as Page); result = { success: true }; }
                  } else {
                    const toolDef = activeTools.find(t => t.name === call.name);
                    if (toolDef) result = executeTool(toolDef.code, call.args);
                  }
                  toolResultsRecord.push({ name: call.name, result });
                  toolOutputs.push({ functionResponse: { name: call.name, response: result } });
                }
                currentResponse = await chatSession.sendMessage({ message: toolOutputs });
                if (currentResponse.text) finalResponseText = currentResponse.text;
              } else break;
            }
            success = true;
          } catch (error: any) {
            if ((error.status === 429 || error.status === 503) && attempts < MAX_RETRIES - 1) {
              await sleep(RETRY_DELAY * Math.pow(2, attempts));
              attempts++;
            } else throw error;
          }
        }
        if (success && !cancelledRef.current) {
          addMessage('model', finalResponseText, toolCallsRecord.length > 0 ? toolCallsRecord : undefined, toolResultsRecord.length > 0 ? toolResultsRecord : undefined);
        }
      } else if (settings.provider === 'intervised') {
        // --- INTERVISED AZURE AI (FREE FOR USERS) ---
        const historyForAzure = historySlice.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          text: mergeTextWithAttachments(m.text, m.attachments, { includeImages: true })
        }));

        // Add the new user input
        historyForAzure.push({ role: 'user', text: inputWithAttachments });

        const azureMessages = toAzureMessages(dynamicSystemPrompt, historyForAzure); // USE DYNAMIC PROMPT

        const response = await azureChat({
          messages: azureMessages,
          model: settings.modelOverride as any || 'deepseek-v3.2',
          temperature: settings.temperature,
          maxTokens: 2048,
          signal: abortControllerRef.current?.signal
        });

        // Update spending info
        if (response.spending) {
          setSpending({
            current: response.spending.current,
            limit: response.spending.limit,
            remaining: response.spending.remaining,
            isUnderLimit: response.spending.remaining > 0
          });
        }

        if (!cancelledRef.current) {
          addMessage('model', response.content);
        }
      } else if (settings.provider === 'g4f') {
        // --- G4F MULTI-PROVIDER CHAT (FREE) ---
        const g4fSettings = settings.g4f || {
          subProvider: 'pollinations',
          model: 'openai',
          streaming: true
        };

        const providerConfig = getG4FProvider(g4fSettings.subProvider);
        const supportsVision = providerConfig?.supportsVision ?? false;

        // Build messages for G4F
        const g4fMessages = buildG4FMessages(historySlice, dynamicSystemPrompt, supportsVision); // USE DYNAMIC PROMPT

        // Add the new user input
        g4fMessages.push({
          role: 'user', content: buildG4FMessageContent({
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: Date.now(),
            attachments
          }, supportsVision)
        });

        const g4fRequest: G4FChatRequest = {
          provider: g4fSettings.subProvider,
          model: g4fSettings.model || (providerConfig?.popularModels[0] || 'openai'),
          messages: g4fMessages,
          temperature: settings.temperature,
          maxTokens: 4096,
          apiKey: g4fSettings.apiKey || (g4fSettings.subProvider === 'g4f-main' ? DEFAULT_G4F_API_KEY : undefined),
          customBaseUrl: g4fSettings.customBaseUrl,
          signal: abortControllerRef.current?.signal,
          providerOptions: {
            webSearch: g4fSettings.webSearch
          }
        };

        // Use streaming if enabled and supported
        if (g4fSettings.streaming && providerConfig?.supportsStreaming) {
          // Create a placeholder message that we'll update
          const messageId = Date.now().toString() + Math.random().toString();
          setMessages(prev => [...prev, {
            id: messageId,
            role: 'model',
            text: '',
            timestamp: Date.now()
          }]);

          let fullContent = '';
          /**
           * Flag to track if we received ANY valid chunks.
           * If we received chunks (even just whitespace), we assume the connection worked
           * and avoid triggering the fallback, which would restart the request.
           */
          let hasReceivedChunks = false;

          try {
            for await (const chunk of g4fChatStream(g4fRequest)) {
              if (cancelledRef.current) break;
              fullContent += chunk;
              hasReceivedChunks = true;

              // Update the message in place
              setMessages(prev => prev.map(msg =>
                msg.id === messageId
                  ? { ...msg, text: fullContent }
                  : msg
              ));
            }
          } catch (streamError) {
            console.warn("G4F Stream failed, retrying with non-streaming:", streamError);
          }

          // If streaming failed or yielded no content, try fallback
          // Only fallback if we received absolutely nothing (or empty string total)
          if (!hasReceivedChunks && fullContent.trim().length === 0 && !cancelledRef.current) {
            try {
              const response = await g4fChat(g4fRequest);
              if (response.content) {
                setMessages(prev => prev.map(msg =>
                  msg.id === messageId ? { ...msg, text: response.content } : msg
                ));
              } else {
                throw new Error("Empty response from provider");
              }
            } catch (fallbackError) {
              // If fallback also fails, update message to show error
              setMessages(prev => prev.map(msg =>
                msg.id === messageId
                  ? { ...msg, text: "⚠️ Connection to AI provider failed. Please try a different provider in settings or try again." }
                  : msg
              ));
            }
          }
        } else {
          // Non-streaming request
          try {
            const response = await g4fChat(g4fRequest);
            if (!cancelledRef.current) {
              if (response.content) {
                addMessage('model', response.content);
              } else {
                throw new Error("Empty response");
              }
            }
          } catch (error) {
            addMessage('system', "⚠️ AI Provider Error: Failed to get a response. Please check your settings.");
          }
        }
      } else {
        // --- MULTI-PROVIDER CHAT (requires user API key) ---
        if (!settings.customApiKey) throw new Error(`API Key required for ${settings.provider}`);

        const universalMessages = [
          { role: 'system' as const, content: dynamicSystemPrompt }, // USE DYNAMIC PROMPT
          ...historySlice.map(m => ({
            role: m.role === 'model' ? 'assistant' as const : 'user' as const,
            content: mergeTextWithAttachments(m.text, m.attachments, { includeImages: true })
          }))
        ];

        // Add latest message if not in history slice
        universalMessages.push({ role: 'user', content: inputWithAttachments });

        const result = await universalChat({
          provider: settings.provider,
          model: settings.modelOverride || (settings.provider === 'openai' ? 'gpt-4o' : 'claude-3-sonnet'),
          apiKey: settings.customApiKey,
          messages: universalMessages,
          temperature: settings.temperature,
          azureEndpoint: settings.azureEndpoint,
          azureDeployment: settings.azureDeployment,
          signal: abortControllerRef.current?.signal
        });

        if (!cancelledRef.current) {
          addMessage('model', result);
        }
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return;
      }
      // Handle specific Intervised AI errors
      if (error instanceof AISpendingLimitError) {
        addMessage('system', `💰 Usage Limit Reached: You've used your $5 AI credit. Current spending: $${error.spending.current.toFixed(4)}. Please try again later or contact support.`);
        setSpending(error.spending);
      } else if (error instanceof AIAuthError) {
        addMessage('system', `🔐 Authentication Required: Please sign in to use the AI assistant.`);
      } else {
        addMessage('system', `Transmission Interrupted: ${error.message || "Unknown cognitive error."}`);
      }
    } finally {
      abortControllerRef.current = null;
      setIsProcessing(false);
    }
  };

  // Fetch initial spending info for Intervised provider
  useEffect(() => {
    if (settings.provider === 'intervised') {
      getSpendingInfo().then(setSpending).catch(() => {
        // User not authenticated or error - will be caught on first message
      });
    }
  }, [settings.provider]);

  return {
    messages, isProcessing, isListening, modules, setModules, sendMessage, setMessages,
    startListening, systemInstruction, setSystemInstruction, tools, setTools,
    settings, setSettings, spending, stopGenerating
  };
};
