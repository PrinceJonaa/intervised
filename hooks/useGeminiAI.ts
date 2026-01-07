
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Page, ChatMessage, ToolDefinition, ChatSettings } from '../types';
import { SERVICES_DATA, TEAM_DATA, PAST_PROJECTS, CLIENT_TESTIMONIALS, FAQ_DATA } from '../constants';
import { getInitialTools } from '../lib/aiTools';
import { executeTool } from '../lib/toolExecutor';
import { universalChat } from '../lib/universalAI';
import { azureChat, toAzureMessages, AISpendingLimitError, AIAuthError, getSpendingInfo, type SpendingInfo } from '../lib/supabase/aiService';

// --- Configuration ---
const MAX_HISTORY_LENGTH = 20; 
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const DEFAULT_SYSTEM_INSTRUCTION = `
You are the Intervised AI, a collaborative intelligence for a creative agency and ministry tech firm. 
Your tone is sophisticated, slightly futuristic, helpful, and "sacred-tech" (blending theology and technology).
You represent "The Creators" (Prince Jona and Reina Hondo).

**Current System Date: December 10, 2025.**

### Knowledge Base

1. **SERVICES**: We offer Creative Services (Video, Photo, Music), Tech (AI, OBS, Automation), and Ministry solutions.
   - Data: ${JSON.stringify(SERVICES_DATA.map(s => ({ title: s.title, price: s.price, category: s.category })))}

2. **TEAM ("The Creators")**:
   - Data: ${JSON.stringify(TEAM_DATA.map(t => ({ name: t.name, role: t.role, bio: t.bio })))}

3. **PORTFOLIO / CASE STUDIES**:
   - Data: ${JSON.stringify(PAST_PROJECTS)}

4. **SOCIAL PROOF**:
   - Data: ${JSON.stringify(CLIENT_TESTIMONIALS)}

5. **FAQs**:
   - Data: ${JSON.stringify(FAQ_DATA)}

6. **BOOKING**: 
   - Users must go to the Services page to book.
   - Use the 'changePage' tool to take them there.

### Rules
1. If the user wants to go somewhere, USE the 'changePage' tool.
2. Keep responses concise unless asked for details.
3. If asked about prices, quote them directly.
4. If a tool is available, USE IT.
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
      provider: 'intervised', // Default to Intervised Azure AI (free for users)
      customApiKey: '',
      modelOverride: 'deepseek-v3.2' // Default to most cost-efficient model
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

  // Initialize Google AI Client if needed
  useEffect(() => {
    if (settings.provider === 'google') {
      const apiKey = settings.customApiKey || process.env.API_KEY;
      if (apiKey) {
        aiClientRef.current = new GoogleGenAI({ apiKey });
      }
    }
  }, [settings.provider, settings.customApiKey]);

  const addMessage = useCallback((role: 'user' | 'model' | 'system', text: string, toolCalls?: any[], toolResults?: any[]) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random().toString(),
      role,
      text,
      timestamp: Date.now(),
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

  const sendMessage = async (input: string, customHistory?: ChatMessage[]) => {
    if (!input.trim()) return;
    if (isProcessing) return;

    if (customHistory) {
      setMessages([...customHistory, { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() }]);
    } else {
      addMessage('user', input);
    }
    
    setIsProcessing(true);
    abortControllerRef.current = new AbortController();

    try {
      const sourceHistory = customHistory || messages;
      const historySlice = sourceHistory.slice(-MAX_HISTORY_LENGTH);

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
              ? [{ text: m.text }, ...m.toolCalls.map(tc => ({ functionCall: { name: tc.name, args: tc.args } }))] 
              : [{ text: m.text }]
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
                systemInstruction: systemInstruction,
                tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
                temperature: settings.temperature
              },
              history: history
            });

            let currentResponse = await chatSession.sendMessage({ message: input });
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
        if (success) addMessage('model', finalResponseText, toolCallsRecord.length > 0 ? toolCallsRecord : undefined, toolResultsRecord.length > 0 ? toolResultsRecord : undefined);
      } else if (settings.provider === 'intervised') {
        // --- INTERVISED AZURE AI (FREE FOR USERS) ---
        const historyForAzure = historySlice.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          text: m.text
        }));
        
        // Add the new user input
        historyForAzure.push({ role: 'user', text: input });
        
        const azureMessages = toAzureMessages(systemInstruction, historyForAzure);
        
        const response = await azureChat({
          messages: azureMessages,
          model: settings.modelOverride as any || 'deepseek-v3.2',
          temperature: settings.temperature,
          maxTokens: 2048
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
        
        addMessage('model', response.content);
      } else {
        // --- MULTI-PROVIDER CHAT (requires user API key) ---
        if (!settings.customApiKey) throw new Error(`API Key required for ${settings.provider}`);
        
        const universalMessages = [
          { role: 'system' as const, content: systemInstruction },
          ...historySlice.map(m => ({ 
            role: m.role === 'model' ? 'assistant' as const : 'user' as const, 
            content: m.text 
          }))
        ];

        // Add latest message if not in history slice
        universalMessages.push({ role: 'user', content: input });

        const result = await universalChat({
          provider: settings.provider,
          model: settings.modelOverride || (settings.provider === 'openai' ? 'gpt-4o' : 'claude-3-sonnet'),
          apiKey: settings.customApiKey,
          messages: universalMessages,
          temperature: settings.temperature,
          azureEndpoint: settings.azureEndpoint,
          azureDeployment: settings.azureDeployment
        });

        addMessage('model', result);
      }
    } catch (error: any) {
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
    settings, setSettings, spending
  };
};
