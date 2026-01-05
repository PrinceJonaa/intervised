
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Sparkles, User, Cpu, Settings, Activity, Terminal, Plus, History, ChevronDown, Square, Edit2, Zap, ArrowRight, Code, Link as LinkIcon, Quote } from 'lucide-react';
import { useGeminiAI } from '../hooks/useGeminiAI';
import { Page, ChatSession } from '../types';
import { db } from '../lib/mockDb';

// Modular Components
import { ChatSidebar } from './chat/components/Sidebar';
import { SettingsModal } from './chat/components/SettingsModal';

// --- Comprehensive Markdown Renderer ---
const processInlines = (text: string) => {
  // Split by bold, italics, inline code, and links
  const parts = text.split(/(\*\*.*?\*\*|__.*?__|(?<!\*)\*.*?\*(?!\*)|(?<!_)_.*?_(?!_)|`.*?`|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (!part) return null;
    
    // Bold (** or __)
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={i} className="text-accent font-bold">{part.slice(2, -2)}</strong>;
    }
    // Italics (* or _)
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={i} className="text-gray-400 italic">{part.slice(1, -1)}</em>;
    }
    // Inline Code
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-white/10 px-1.5 py-0.5 rounded text-accent font-mono text-xs border border-white/5">{part.slice(1, -1)}</code>;
    }
    // Links
    if (part.startsWith('[') && part.includes('](')) {
        const match = /\[(.*?)\]\((.*?)\)/.exec(part);
        if (match) {
            return (
              <a 
                key={i} 
                href={match[2]} 
                target="_blank" 
                rel="noreferrer" 
                className="text-accent underline underline-offset-2 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                {match[1]}
              </a>
            );
        }
    }
    return <span key={i}>{part}</span>;
  });
};

const formatText = (text: string) => {
  // Split by triple-backtick code blocks
  const blocks = text.split(/(```[\s\S]*?```)/g);

  return blocks.map((block, blockIdx) => {
    if (!block) return null;

    // Handle Code Blocks
    if (block.startsWith('```') && block.endsWith('```')) {
      const fullCode = block.slice(3, -3).trim();
      const firstLineEnd = fullCode.indexOf('\n');
      const language = firstLineEnd !== -1 ? fullCode.substring(0, firstLineEnd).trim() : '';
      const codeContent = firstLineEnd !== -1 ? fullCode.substring(firstLineEnd + 1) : fullCode;

      return (
        <div key={`block-${blockIdx}`} className="my-6 group/code">
          <div className="flex items-center justify-between bg-black/40 px-4 py-2 rounded-t-xl border-x border-t border-white/10">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{language || 'code'}</span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
          </div>
          <pre className="bg-black/60 p-4 rounded-b-xl border border-white/10 overflow-x-auto text-xs font-mono text-green-400 leading-relaxed shadow-inner">
            <code>{codeContent}</code>
          </pre>
        </div>
      );
    }

    // Process normal text line by line
    const lines = block.split('\n');
    return lines.map((line, lineIdx) => {
      const key = `block-${blockIdx}-line-${lineIdx}`;
      const trimmed = line.trim();
      
      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        return <hr key={key} className="my-8 border-white/10" />;
      }

      // Headers (h1-h6)
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        const baseClass = "font-display font-bold text-white mb-4 mt-8";
        
        switch(level) {
          case 1: return <h1 key={key} className={`${baseClass} text-3xl md:text-4xl border-b border-white/10 pb-4`}>{processInlines(content)}</h1>;
          case 2: return <h2 key={key} className={`${baseClass} text-2xl md:text-3xl flex items-center gap-4`}>{processInlines(content)} <div className="h-px flex-1 bg-accent/20" /></h2>;
          case 3: return <h3 key={key} className={`${baseClass} text-xl md:text-2xl text-accent`}>{processInlines(content)}</h3>;
          case 4: return <h4 key={key} className={`${baseClass} text-lg md:text-xl text-gray-200`}>{processInlines(content)}</h4>;
          case 5: return <h5 key={key} className={`${baseClass} text-base md:text-lg text-gray-300`}>{processInlines(content)}</h5>;
          case 6: return <h6 key={key} className={`${baseClass} text-sm md:text-base text-gray-400 uppercase tracking-widest`}>{processInlines(content)}</h6>;
        }
      }
      
      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <div key={key} className="border-l-4 border-accent bg-white/5 px-6 py-4 my-6 rounded-r-xl italic font-serif text-lg text-gray-300">
            {processInlines(line.slice(2))}
          </div>
        );
      }

      // Unordered Lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('+ ')) {
        return (
          <div key={key} className="flex gap-3 ml-2 my-2 items-start group/list">
            <span className="text-accent mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(244,201,93,0.4)] group-hover/list:scale-125 transition-transform" />
            <div className="flex-1 text-gray-300 leading-relaxed">{processInlines(trimmed.slice(2))}</div>
          </div>
        );
      }

      // Ordered Lists
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (orderedMatch) {
        return (
          <div key={key} className="flex gap-3 ml-2 my-2 items-start group/list">
            <span className="text-accent font-mono text-xs font-bold mt-1 min-w-[1.2rem]">{orderedMatch[1]}.</span>
            <div className="flex-1 text-gray-300 leading-relaxed">{processInlines(orderedMatch[2])}</div>
          </div>
        );
      }

      // Empty line / spacing
      if (trimmed === '') return <div key={key} className="h-4" />;
      
      // Regular paragraph
      return <p key={key} className="mb-4 text-gray-300 leading-relaxed text-sm md:text-base">{processInlines(line)}</p>;
    });
  });
};

const ThinkingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex gap-4 items-end"
  >
    <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(244,201,93,0.2)]">
      <Cpu size={14} className="text-accent animate-spin-slow" />
    </div>
    <div className="glass-panel px-5 py-3 rounded-2xl rounded-bl-none border-white/10 flex items-center gap-2">
      <span className="text-xs font-mono text-accent uppercase tracking-wider mr-2">Computing</span>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      </div>
    </div>
  </motion.div>
);

const QuickActionCard = ({ icon: Icon, title, prompt, onClick }: any) => (
  <button onClick={() => onClick(prompt)} className="text-left group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/30 p-4 rounded-xl transition-all hover:-translate-y-1 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <Icon className="text-gray-400 group-hover:text-accent mb-3 transition-colors" size={20} />
    <h4 className="font-bold text-sm text-gray-200 group-hover:text-white mb-1">{title}</h4>
    <p className="text-xs text-gray-500 line-clamp-2">{prompt}</p>
  </button>
);

export const ChatPage = ({ setPage }: { setPage: (p: Page) => void }) => {
  const { 
    messages, isProcessing, isListening, sendMessage, startListening, setMessages,
    systemInstruction, setSystemInstruction, tools, setTools, settings, setSettings
  } = useGeminiAI(setPage);

  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Layout State
  const [mobileView, setMobileView] = useState<'CHAT' | 'HISTORY'>('CHAT');
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  
  // Session State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionAnalysis, setActiveSessionAnalysis] = useState<any>(null);

  useEffect(() => {
    refreshSessions();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const refreshSessions = () => {
    const loaded = db.getSessions();
    setSessions(loaded);
    if (!activeSessionId) {
      if (loaded.length > 0) loadSession(loaded[0].id);
      else createNewSession();
    }
  };

  useEffect(() => {
    if (activeSessionId && messages.length > 0) {
       const timer = setTimeout(() => {
          const currentTitle = sessions.find(s => s.id === activeSessionId)?.title || 'New Transmission';
          let title = currentTitle;
          if (title === 'New Transmission') {
             const firstUserMsg = messages.find(m => m.role === 'user');
             if (firstUserMsg) title = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
          }
          const sessionToSave: ChatSession = {
             id: activeSessionId,
             title: title,
             messages: messages,
             lastModified: Date.now(),
             analysis: sessions.find(s => s.id === activeSessionId)?.analysis
          };
          const saved = db.saveSession(sessionToSave);
          setSessions(prev => prev.map(s => s.id === activeSessionId ? saved : s));
          setActiveSessionAnalysis(saved.analysis);
       }, 1000);
       return () => clearTimeout(timer);
    }
  }, [messages, activeSessionId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      if (isNearBottom || isProcessing) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isProcessing]);

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Transmission',
      lastModified: Date.now(),
      messages: [{ id: 'init', role: 'model', text: 'Intervised Neural Interface established. Ready for input.', timestamp: Date.now() }]
    };
    db.saveSession(newSession);
    refreshSessions();
    loadSession(newId);
    setMobileView('CHAT');
  };

  const loadSession = (id: string) => {
    const session = db.getSessionById(id);
    if (session) {
       setActiveSessionId(session.id);
       setMessages(session.messages);
       setActiveSessionAnalysis(session.analysis);
       setMobileView('CHAT');
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    db.deleteSession(id);
    refreshSessions();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <section className="fixed inset-0 z-30 pt-[70px] md:pt-24 pb-0 md:pb-6 px-0 md:px-6 w-full flex gap-6 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d2840] via-[#001428] to-[#000a14]">
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay"></div>

      <div className="hidden md:block h-full flex-shrink-0 pb-6 relative z-10">
        <ChatSidebar 
          isMobile={false}
          isOpen={true}
          onClose={() => {}}
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
            className="absolute inset-0 z-50 bg-[#001428] md:hidden"
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
        
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#001428]/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              onClick={() => setMobileView('HISTORY')} 
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
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
              <button onClick={createNewSession} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"><Plus size={20} /></button>
              <button onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-accent transition-colors"><Settings size={20} /></button>
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 custom-scrollbar scroll-smooth relative">
          <div className="pt-6 pb-48 md:pb-40 space-y-6">
            
            {messages.length <= 1 && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto my-12 animate-fadeIn">
                  <div className="col-span-full mb-2"><h3 className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2"><Zap size={12}/> Executive Protocols</h3></div>
                  <QuickActionCard icon={Activity} title="Diagnose Brand" prompt="Run a diagnostic on my brand's digital presence. Look for gaps in visual identity vs. sonic identity." onClick={(p: string) => sendMessage(p)} />
                  <QuickActionCard icon={Code} title="Tech Stack Audit" prompt="I need a hardware and software recommendation for a church livestream setup. Budget is medium." onClick={(p: string) => sendMessage(p)} />
                  <QuickActionCard icon={Terminal} title="VCDF Script" prompt="Generate a VCDF script for a short-form video about 'The theology of automation'. Target audience: Creatives." onClick={(p: string) => sendMessage(p)} />
                  <QuickActionCard icon={Send} title="Client Email" prompt="Draft a polite but firm email to a client about scope creep on the video project." onClick={(p: string) => sendMessage(p)} />
               </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={msg.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border shadow-lg ${msg.role === 'user' ? 'bg-white/5 border-white/20' : 'bg-accent/10 border-accent/30'}`}>
                    {msg.role === 'user' ? <User size={14} className="text-gray-300" /> : <Sparkles size={14} className="text-accent" />}
                  </div>
                  <div className={`max-w-[85%] md:max-w-[85%] space-y-2 group ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                     {msg.role !== 'system' && (
                       <div className="relative group/bubble w-full">
                         <div className={`p-4 md:p-8 rounded-2xl text-sm md:text-base shadow-lg backdrop-blur-md ${msg.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'glass-panel border-white/10 rounded-tl-none'}`}>
                            {msg.role === 'model' ? (
                              <div className="markdown-body font-sans text-gray-200">
                                {formatText(msg.text)}
                              </div>
                            ) : (
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            )}
                         </div>
                       </div>
                     )}
                     {msg.toolCalls && msg.toolCalls.map((tc, idx) => (
                        <div key={idx} className="bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-mono text-gray-400 flex flex-col gap-2 shadow-inner w-full">
                           <div className="flex items-center gap-2 text-accent"><Terminal size={12} /><span className="font-bold">Executing: {tc.name}</span></div>
                        </div>
                     ))}
                     {msg.role === 'system' && <span className="text-xs font-mono text-red-400 block ml-2 border-l-2 border-red-500/50 pl-2">{msg.text}</span>}
                  </div>
                </motion.div>
              ))}
              {isProcessing && <div className="pb-4"><ThinkingIndicator /></div>}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        <div className="absolute bottom-[90px] md:bottom-[100px] left-0 right-0 px-4 md:px-8 z-30 flex justify-center pointer-events-none">
            <form onSubmit={handleSubmit} className="relative group w-full max-w-3xl pointer-events-auto">
              <div className="relative w-full bg-[#001428]/90 md:bg-black/80 border border-white/20 md:border-white/10 rounded-3xl p-2 pl-4 md:pl-6 focus-within:border-accent/50 focus-within:bg-black transition-all shadow-2xl backdrop-blur-xl">
                 <textarea 
                    ref={textareaRef}
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder="Transmitting..." 
                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-500 text-sm md:text-base font-mono resize-none max-h-[150px] py-3 pr-24 custom-scrollbar"
                    rows={1}
                 />
                 <div className="absolute right-2 bottom-2 flex gap-1 bg-black/20 p-1 rounded-xl backdrop-blur-sm">
                    <button type="button" onClick={() => startListening(setInput)} className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/50' : 'hover:bg-white/10 text-gray-400 hover:text-accent'}`}><Mic size={18} /></button>
                    {isProcessing ? (
                       <button type="button" onClick={() => {}} className="p-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/50"><Square size={18} fill="currentColor" /></button>
                    ) : (
                       <button type="submit" disabled={!input.trim()} className="p-2 bg-white/10 text-white hover:bg-accent hover:text-void rounded-lg transition-all"><Send size={18} /></button>
                    )}
                 </div>
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
      />
    </section>
  );
};
