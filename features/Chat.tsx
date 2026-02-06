
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Sparkles, User, Cpu, Settings, Activity, Terminal, Plus, History, ChevronDown, Square, Edit2, Zap, ArrowRight, Code, Link as LinkIcon, Quote, Paperclip, X, FileText } from 'lucide-react';
import { useGeminiAI } from '../hooks/useGeminiAI';
import { Page, ChatAttachment, ChatSession } from '../types';
import {
  getChatSessions,
  getChatSessionById,
  saveChatSession,
  deleteChatSession,
  getChatMessages,
  saveChatMessage,
  deleteChatMessages
} from '../lib/supabase/chatService';
import { useAuthContext } from '../components/AuthProvider';

// Modular Components
import { ChatSidebar } from './chat/components/Sidebar';
import { SettingsModal } from './chat/components/SettingsModal';
import { ThinkingIndicator } from './chat/components/ThinkingIndicator';
import { QuickActionCard } from './chat/components/QuickActionCard';
import { ChatMessageItem } from './chat/components/ChatMessageItem';

const MAX_ATTACHMENTS = 6;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_TEXT_BYTES = 200 * 1024;
const TEXT_FILE_EXTENSIONS = ['.txt', '.md', '.markdown', '.json', '.csv', '.log', '.xml', '.yml', '.yaml'];
const TEXT_MIME_TYPES = new Set([
  'application/json',
  'application/xml',
  'application/x-ndjson',
  'application/x-yaml',
  'application/yaml',
  'text/markdown',
  'text/plain',
  'text/csv'
]);

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const isLikelyTextFile = (file: File) => {
  if (file.type?.startsWith('text/')) return true;
  if (file.type && TEXT_MIME_TYPES.has(file.type.toLowerCase())) return true;
  const lowerName = file.name.toLowerCase();
  return TEXT_FILE_EXTENSIONS.some(ext => lowerName.endsWith(ext));
};

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = () => reject(new Error('Failed to read file'));
  reader.readAsDataURL(file);
});

const readFileAsText = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = () => reject(new Error('Failed to read file'));
  reader.readAsText(file);
});

export const ChatPage = ({ setPage }: { setPage: (p: Page) => void }) => {
  const { user } = useAuthContext();
  const {
    messages, isProcessing, isListening, sendMessage, startListening, stopGenerating, setMessages,
    systemInstruction, setSystemInstruction, tools, setTools, settings, setSettings, spending
  } = useGeminiAI(setPage);

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layout State
  const [mobileView, setMobileView] = useState<'CHAT' | 'HISTORY'>('CHAT');
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // Session State - persisted to localStorage
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    // Restore from localStorage on mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem('iv_chat_session_id') || null;
    }
    return null;
  });
  const [activeSessionAnalysis, setActiveSessionAnalysis] = useState<any>(null);

  // Persist activeSessionId to localStorage
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('iv_chat_session_id', activeSessionId);
    }
  }, [activeSessionId]);

  // Load sessions from Supabase and watch for auth changes
  useEffect(() => {
    if (user?.id) {
      (async () => {
        const loaded = await getChatSessions(user.id);
        setSessions(loaded);

        // Check if saved session still exists
        const savedSessionId = localStorage.getItem('iv_chat_session_id');
        const savedSessionExists = savedSessionId && loaded.some(s => s.id === savedSessionId);

        if (savedSessionExists) {
          loadSession(savedSessionId);
        } else if (loaded.length > 0) {
          loadSession(loaded[0].id);
        } else {
          createNewSession();
        }
      })();
    } else {
      // User logged out - clear sessions
      setSessions([]);
      setActiveSessionId(null);
      setMessages([]);
      localStorage.removeItem('iv_chat_session_id');
    }
    // eslint-disable-next-line
  }, [user?.id]); // This will trigger when user logs in or out

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  // Save session to Supabase when messages change
  useEffect(() => {
    if (activeSessionId && messages.length > 0 && user?.id) {
      const timer = setTimeout(async () => {
        const currentTitle = sessions.find(s => s.id === activeSessionId)?.title || 'New Transmission';
        let title = currentTitle;
        if (title === 'New Transmission') {
          const firstUserMsg = messages.find(m => m.role === 'user');
          if (firstUserMsg) title = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
        }
        await saveChatSession({
          id: activeSessionId,
          user_id: user.id,
          title,
          updated_at: new Date().toISOString(),
        });
        // Save messages
        // (Optional: implement message upsert logic here)
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [messages, activeSessionId, user?.id]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      if (isNearBottom || isProcessing) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isProcessing]);

  const createNewSession = async () => {
    if (!user?.id) return;
    const newId = crypto.randomUUID();
    const newSession = {
      id: newId,
      user_id: user.id,
      title: 'New Transmission',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveChatSession(newSession);
    setActiveSessionId(newId);
    setMessages([{ id: 'init', role: 'model', text: 'Intervised Neural Interface established. Ready for input.', timestamp: Date.now() }]);
    const loaded = await getChatSessions(user.id);
    setSessions(loaded);
    setMobileView('CHAT');
  };

  const loadSession = async (id: string) => {
    const session = await getChatSessionById(id);
    if (session) {
      setActiveSessionId(session.id);
      const msgs = await getChatMessages(session.id);
      setMessages(msgs.map(m => ({
        id: m.id,
        role: m.role,
        text: m.content,
        timestamp: new Date(m.created_at || Date.now()).getTime(),
      })));
      setActiveSessionAnalysis(session.analysis);
      setMobileView('CHAT');
    }
  };

  const refreshSessions = async () => {
    if (!user?.id) return;
    try {
      const loaded = await getChatSessions(user.id);
      setSessions(loaded);
      if (!activeSessionId) {
        if (loaded.length > 0) {
          await loadSession(loaded[0].id);
        } else {
          await createNewSession();
        }
      }
    } catch (err) {
      console.error('Failed to refresh sessions', err);
    }
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteChatSession(id);
    await deleteChatMessages(id);
    if (user?.id) {
      const loaded = await getChatSessions(user.id);
      setSessions(loaded);
      if (loaded.length > 0) loadSession(loaded[0].id);
      else createNewSession();
    }
  };

  const processFile = async (file: File): Promise<ChatAttachment | null> => {
    const baseAttachment: ChatAttachment = {
      id: crypto.randomUUID(),
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      kind: file.type.startsWith('image/') ? 'image' : 'file'
    };

    if (baseAttachment.kind === 'image') {
      if (file.size > MAX_IMAGE_BYTES) {
        setAttachmentError(`Image too large: ${file.name}. Max ${formatBytes(MAX_IMAGE_BYTES)}.`);
        return null;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        return { ...baseAttachment, dataUrl };
      } catch {
        setAttachmentError(`Failed to read image: ${file.name}.`);
        return null;
      }
    }

    if (isLikelyTextFile(file)) {
      if (file.size > MAX_TEXT_BYTES) {
        setAttachmentError(`File too large to read: ${file.name}. Attached as metadata only.`);
        return baseAttachment;
      }
      try {
        const textContent = await readFileAsText(file);
        return { ...baseAttachment, textContent };
      } catch {
        setAttachmentError(`Failed to read file: ${file.name}.`);
        return baseAttachment;
      }
    }

    return baseAttachment;
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;
    setAttachmentError(null);

    const incoming = Array.from(fileList);
    const availableSlots = MAX_ATTACHMENTS - attachments.length;
    if (availableSlots <= 0) {
      setAttachmentError(`Attachment limit reached (${MAX_ATTACHMENTS}).`);
      return;
    }

    const batch = incoming.slice(0, availableSlots);
    setIsProcessingFiles(true);
    try {
      const processed = await Promise.all(batch.map(processFile));
      const validAttachments = processed.filter(Boolean) as ChatAttachment[];
      if (validAttachments.length > 0) {
        setAttachments(prev => [...prev, ...validAttachments]);
      }
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      await handleFiles(event.target.files);
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      await handleFiles(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasContent = input.trim() || attachments.length > 0;
    if (hasContent && !isProcessingFiles) {
      sendMessage(input, undefined, attachments);
      setInput('');
      setAttachments([]);
      setAttachmentError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = (input.trim() || attachments.length > 0) && !isProcessingFiles;

  return (
    <section className="fixed inset-0 z-30 pt-[70px] md:pt-24 pb-0 md:pb-6 px-0 md:px-6 w-full flex gap-6 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d2840] via-[#001428] to-[#000a14] h-screen-safe">

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay"></div>

      <div className="hidden md:block h-full flex-shrink-0 pb-6 relative z-10">
        <ChatSidebar
          isMobile={false}
          isOpen={true}
          onClose={() => { }}
          onOpenSettings={() => setSettingsOpen(true)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onLoadSession={loadSession}
          onNewSession={createNewSession}
          onDeleteSession={deleteSession}
        />
      </div>

      <AnimatePresence>
        {mobileView === 'HISTORY' && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 z-50 bg-[#001428] md:hidden safe-top"
          >
            <ChatSidebar
              isMobile={true}
              isOpen={true}
              onClose={() => setMobileView('CHAT')}
              onOpenSettings={() => setSettingsOpen(true)}
              sessions={sessions}
              activeSessionId={activeSessionId}
              onLoadSession={loadSession}
              onNewSession={createNewSession}
              onDeleteSession={deleteSession}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative h-full w-full overflow-hidden rounded-t-3xl md:rounded-3xl bg-surface/30 md:bg-black/20 border-t md:border border-white/5 backdrop-blur-sm shadow-2xl">

        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#001428]/80 backdrop-blur-md z-20 shrink-0 touch-target">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => setMobileView('HISTORY')}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors touch-target"
              aria-label="View history"
            >
              <History size={20} />
            </button>

            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden md:block p-1.5 bg-gradient-to-tr from-accent/20 to-secondary/20 rounded-lg border border-accent/30 shadow-[0_0_15px_rgba(244,201,93,0.1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm md:text-lg font-display font-bold leading-none tracking-tight text-white/90 truncate">
                  {sessions.find(s => s.id === activeSessionId)?.title || 'NEURAL LINK'}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[10px] font-mono text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                    {settings.provider === 'google' ? (settings.modelOverride || 'Gemini 3 Flash') : `${settings.provider.toUpperCase()} : ${settings.modelOverride}`}
                  </p>
                  {activeSessionAnalysis?.distortionRisk && (
                    <span className={`hidden md:flex text-[9px] font-mono px-1.5 py-0.5 rounded border items-center gap-1 uppercase tracking-wider ${activeSessionAnalysis.distortionRisk === 'High' ? 'border-red-500/30 text-red-400 bg-red-500/10' : activeSessionAnalysis.distortionRisk === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' : 'border-green-500/30 text-green-400 bg-green-500/10'}`}><Activity size={10} /> RISK: {activeSessionAnalysis.distortionRisk}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={createNewSession} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors touch-target" aria-label="New session"><Plus size={20} /></button>
            <button onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-accent transition-colors touch-target" aria-label="Open settings"><Settings size={20} /></button>
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 custom-scrollbar momentum-scroll scroll-smooth relative">
          <div className="pt-6 pb-48 md:pb-40 space-y-6">

            {messages.length <= 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto my-12 animate-fadeIn">
                <div className="col-span-full mb-2"><h3 className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2"><Zap size={12} /> Executive Protocols</h3></div>
                <QuickActionCard icon={Activity} title="Diagnose Brand" prompt="Run a diagnostic on my brand's digital presence. Look for gaps in visual identity vs. sonic identity." onClick={(p: string) => sendMessage(p)} />
                <QuickActionCard icon={Code} title="Tech Stack Audit" prompt="I need a hardware and software recommendation for a church livestream setup. Budget is medium." onClick={(p: string) => sendMessage(p)} />
                <QuickActionCard icon={Terminal} title="VCDF Script" prompt="Generate a VCDF script for a short-form video about 'The theology of automation'. Target audience: Creatives." onClick={(p: string) => sendMessage(p)} />
                <QuickActionCard icon={Send} title="Client Email" prompt="Draft a polite but firm email to a client about scope creep on the video project." onClick={(p: string) => sendMessage(p)} />
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <ChatMessageItem key={msg.id} msg={msg} />
              ))}
              {isProcessing && <div className="pb-4"><ThinkingIndicator /></div>}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input form - positioned above keyboard on mobile with safe area */}
        <div className="absolute left-0 right-0 px-4 md:px-8 z-30 flex justify-center pointer-events-none safe-bottom" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}>
          <form onSubmit={handleSubmit} className="relative group w-full max-w-3xl pointer-events-auto">
            <div
              className={`relative w-full bg-[#001428]/90 md:bg-black/80 border border-white/20 md:border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl transition-all focus-within:border-accent/50 focus-within:bg-black ${isDragging ? 'border-accent/60 bg-black/90' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-3 pt-3">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-2 py-1 text-xs">
                      {attachment.kind === 'image' && attachment.dataUrl ? (
                        <img src={attachment.dataUrl} alt={attachment.name} className="w-9 h-9 object-cover rounded-lg border border-white/10" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <FileText size={14} className="text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate max-w-[140px] text-gray-200">{attachment.name}</div>
                        <div className="text-[10px] text-gray-500">{formatBytes(attachment.size)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="p-1 text-gray-500 hover:text-white transition-colors"
                        aria-label={`Remove ${attachment.name}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(attachmentError || isProcessingFiles) && (
                <div className="px-4 pt-2 text-[10px] flex flex-wrap gap-2">
                  {isProcessingFiles && <span className="text-gray-500">Processing attachments...</span>}
                  {attachmentError && <span className="text-red-400">{attachmentError}</span>}
                </div>
              )}

              <div className="flex items-end gap-2 p-2 pl-3 md:pl-5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg text-gray-400 hover:text-accent hover:bg-white/10 transition-colors"
                  aria-label="Attach file"
                >
                  <Paperclip size={18} />
                </button>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Transmitting..."
                  aria-label="Message input"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-500 text-sm md:text-base font-mono resize-none max-h-[150px] py-3 custom-scrollbar"
                  rows={1}
                />
                <div className="flex gap-1 bg-black/20 p-1 rounded-xl backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => startListening(setInput)}
                    className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/50' : 'hover:bg-white/10 text-gray-400 hover:text-accent'}`}
                    aria-label="Voice input"
                    aria-pressed={isListening}
                  >
                    <Mic size={18} />
                  </button>
                  {isProcessing ? (
                    <button type="button" onClick={stopGenerating} className="p-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/50" aria-label="Stop generating">
                      <Square size={18} fill="currentColor" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!canSend}
                      className={`p-2 rounded-lg transition-all ${canSend ? 'bg-white/10 text-white hover:bg-accent hover:text-void' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                      aria-label="Send message"
                    >
                      <Send size={18} />
                    </button>
                  )}
                </div>
              </div>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInputChange} />
            </div>
          </form>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        tools={tools}
        setTools={setTools}
        systemInstruction={systemInstruction}
        setSystemInstruction={setSystemInstruction}
        sessions={sessions}
        refreshSessions={refreshSessions}
        generateRaw={async () => null}
        spending={spending}
      />
    </section>
  );
};
