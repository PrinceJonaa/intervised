import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, Send, Settings2, CheckCircle2, Circle, Mic, Zap } from 'lucide-react';
import { Page } from '../types';
import { useGeminiAI } from '../hooks/useGeminiAI';

interface AIPanelContentProps {
  setPage: (p: Page) => void;
  onClose: () => void;
}

const AIPanelContent: React.FC<AIPanelContentProps> = ({ setPage, onClose }) => {
  const [aiInput, setAiInput] = useState('');

  // Use shared hook for AI logic
  const {
    messages,
    isProcessing,
    isListening,
    sendMessage,
    startListening,
    modules,
    setModules
  } = useGeminiAI(setPage);

  // Derive display message from latest model/system message in history
  const lastModelMessage = [...messages].reverse().find(m => m.role === 'model' || m.role === 'system');
  const aiDisplayMessage = lastModelMessage ? lastModelMessage.text : 'System Online. How can I assist?';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiInput.trim()) {
      sendMessage(aiInput);
      setAiInput('');
    }
  };

  const handleVoice = () => {
    startListening((text) => {
      setAiInput(text);
      sendMessage(text);
      setAiInput('');
    });
  };

  const toggleModule = (mod: 'navigation' | 'knowledge' | 'actions') => {
    setModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-28 left-2 right-2 md:bottom-28 md:left-1/2 md:-translate-x-1/2 md:w-[600px] glass-panel rounded-3xl p-4 sm:p-6 z-[150] shadow-[0_0_50px_rgba(244,201,93,0.15)] flex flex-col gap-4 max-h-[60vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-accent animate-pulse" />
            <span className="font-display font-bold text-lg text-white tracking-tight">INTERVISED AI</span>
          </div>
          <span className="text-xs font-mono text-muted">Gemini 2.5 Flash /// Online</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white" aria-label="Close AI Panel">
          <X size={20} />
        </button>
      </div>

      {/* Neural Modules Toolbar */}
      <div className="flex flex-wrap gap-2 py-2 border-y border-white/5">
        <div className="flex items-center gap-2 mr-2 w-full sm:w-auto mb-1 sm:mb-0">
          <Settings2 size={14} className="text-muted" />
          <span className="text-[10px] font-mono uppercase text-muted tracking-wider">Neural Modules</span>
        </div>

        <button
          onClick={() => toggleModule('navigation')}
          aria-pressed={modules.navigation}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${modules.navigation
              ? 'bg-accent/20 border-accent/50 text-accent'
              : 'bg-white/5 border-white/10 text-muted hover:border-white/30'
            }`}
        >
          {modules.navigation ? <CheckCircle2 size={12} /> : <Circle size={12} />}
          Navigation
        </button>

        <button
          onClick={() => toggleModule('knowledge')}
          aria-pressed={modules.knowledge}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${modules.knowledge
              ? 'bg-secondary/20 border-secondary/50 text-white'
              : 'bg-white/5 border-white/10 text-muted hover:border-white/30'
            }`}
        >
          {modules.knowledge ? <CheckCircle2 size={12} /> : <Circle size={12} />}
          Knowledge Base
        </button>

        <button
          onClick={() => toggleModule('actions')}
          aria-pressed={modules.actions}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${modules.actions
              ? 'bg-accent/20 border-accent/50 text-accent font-bold'
              : 'bg-white/5 border-white/10 text-muted hover:border-white/30'
            }`}
        >
          {modules.actions ? <Zap size={12} /> : <Circle size={12} />}
          Executive Actions
        </button>
      </div>

      {/* Output Display */}
      <div className="min-h-[80px] flex items-center justify-center text-center p-2">
        {(isProcessing && !aiDisplayMessage) || isListening ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1 items-center h-6">
              {[1, 2, 3, 4, 5].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: [8, 24, 8], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                  className={`w-1 rounded-full ${isListening ? 'bg-red-500' : 'bg-accent'}`}
                />
              ))}
            </div>
            <span className="text-xs font-mono text-accent/80 animate-pulse uppercase tracking-widest">
              {isListening ? 'Receiving Audio Input...' : 'Computing Response...'}
            </span>
          </div>
        ) : (
          <p className="text-base sm:text-lg font-light text-white/90 leading-snug">{aiDisplayMessage}</p>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          placeholder="Ask about services..."
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 sm:py-4 px-5 pr-14 text-sm focus:outline-none focus:border-accent/50 transition-all placeholder:text-gray-600"
          autoFocus
          aria-label="Ask about services"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {!aiInput && (
            <button
              type="button"
              onClick={handleVoice}
              className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/10 text-gray-400 hover:text-accent'
                }`}
              title="Voice Input"
              aria-label="Voice Input"
              aria-pressed={isListening}
            >
              <Mic size={18} />
            </button>
          )}
          {aiInput && (
            <button
              type="submit"
              className="p-2 bg-accent/20 hover:bg-accent rounded-xl text-accent hover:text-void transition-all border border-accent/30 hover:border-accent"
              aria-label="Send Message"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default AIPanelContent;
