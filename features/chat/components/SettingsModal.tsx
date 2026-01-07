import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Cpu, User, Zap, Database, Volume2, Shield, X, Menu } from 'lucide-react';
import { ChatSettings, ToolDefinition, ChatSession } from '../../../types';
import { db } from '../../../lib/mockDb';
import { useAuthContext } from '../../../components/AuthProvider';
import { getChatSessions, deleteChatSession, deleteChatMessages } from '../../../lib/supabase/chatService';
import { ToolEditor } from './ToolEditor';
import { type SpendingInfo } from '../../../lib/supabase/aiService';

// Modular Components
import { GeneralTab } from './settings/GeneralTab';
import { PersonaTab } from './settings/PersonaTab';
import { ToolsTab } from './settings/ToolsTab';
import { MemoryTab } from './settings/MemoryTab';
import { VoiceTab } from './settings/VoiceTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  setSettings: React.Dispatch<React.SetStateAction<ChatSettings>>;
  tools: ToolDefinition[];
  setTools: (tools: ToolDefinition[]) => void;
  systemInstruction: string;
  setSystemInstruction: (s: string) => void;
  sessions: ChatSession[];
  refreshSessions: () => void;
  generateRaw: (prompt: string) => Promise<string | null>;
  spending?: SpendingInfo | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, settings, setSettings, tools, setTools, 
  systemInstruction, setSystemInstruction, sessions, refreshSessions, generateRaw, spending
}) => {
   const { user } = useAuthContext();
  const [tab, setTab] = useState<'general' | 'persona' | 'tools' | 'memory' | 'voice'>('general');
  const [editingToolIndex, setEditingToolIndex] = useState<number | null>(null);
  const [toolEditForm, setToolEditForm] = useState<ToolDefinition | null>(null);
  const [isOptimizingSys, setIsOptimizingSys] = useState(false);

  const handleToolToggle = (idx: number) => {
    const newTools = [...tools];
    newTools[idx].enabled = !newTools[idx].enabled;
    setTools(newTools);
  };

  const handleToolSave = (updatedTool: ToolDefinition) => {
    if (editingToolIndex !== null) {
      const newTools = [...tools];
      newTools[editingToolIndex] = updatedTool;
      setTools(newTools);
    } else {
      setTools([...tools, updatedTool]);
    }
    setEditingToolIndex(null);
    setToolEditForm(null);
  };

  const handleOptimizeSystem = async () => {
    setIsOptimizingSys(true);
    const prompt = `
      You are an expert AI persona designer.
      Current System Instruction: "${systemInstruction}"
      Task: Rewrite this system instruction to be more robust, clear, and effective.
      Output ONLY the raw text.
    `;
    const result = await generateRaw(prompt);
    if (result) setSystemInstruction(result.trim());
    setIsOptimizingSys(false);
  };

  const handleFactoryReset = () => {
      if(confirm('Reset all memory?')) {
         db.clearJournal();
         (async () => {
            try {
               if (user?.id) {
                  const loaded = await getChatSessions(user.id);
                  for (const s of loaded) {
                     await deleteChatMessages(s.id);
                     await deleteChatSession(s.id);
                  }
               }
            } catch (err) {
               console.error('Failed to purge Supabase sessions during factory reset', err);
            }
            try { refreshSessions(); } catch {};
            onClose();
         })();
      }
  };

  const handleMemoryPurge = () => {
      if(confirm('Purge all sessions?')) { 
         db.clearJournal(); 
         (async () => {
            try {
               if (user?.id) {
                  const loaded = await getChatSessions(user.id);
                  for (const s of loaded) {
                     await deleteChatMessages(s.id);
                     await deleteChatSession(s.id);
                  }
               }
            } catch (err) {
               console.error('Failed to purge Supabase sessions', err);
            }
            try { refreshSessions(); } catch {};
         })();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4">
       <motion.div 
         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
         onClick={onClose} 
         className="absolute inset-0 bg-black/90 backdrop-blur-md" 
       />
       
       <motion.div
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.95, y: 20 }}
         className="glass-panel w-full h-[100dvh] sm:h-[85vh] md:w-[90vw] max-w-7xl flex flex-col md:flex-row sm:rounded-3xl relative z-10 border-0 sm:border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-void"
       >
          {/* Mobile Header (Only visible on small screens) */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                  <Settings size={18} className="text-white" />
               </div>
               <div>
                  <h3 className="font-display font-bold text-white text-sm tracking-wide">SYSTEM CORE</h3>
               </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white"><X size={18}/></button>
          </div>

          {/* Navigation Sidebar (Desktop: Left Col, Mobile: Top Scroll) */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/40 flex flex-row md:flex-col justify-between py-2 md:py-6 overflow-x-auto md:overflow-visible flex-shrink-0 scrollbar-hide">
             <div className="flex md:flex-col gap-1 px-2 md:px-4 min-w-max md:min-w-0">
                {/* Desktop Logo Header */}
                <div className="hidden md:flex px-2 md:px-2 mb-8 items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                      <Settings size={18} className="text-white" />
                   </div>
                   <div>
                      <h3 className="font-display font-bold text-white text-sm tracking-wide">SYSTEM CORE</h3>
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">v2.5 Config</p>
                   </div>
                </div>

                <NavItem active={tab === 'general'} onClick={() => setTab('general')} icon={Cpu} label="General" />
                <NavItem active={tab === 'persona'} onClick={() => setTab('persona')} icon={User} label="Persona" />
                <NavItem active={tab === 'tools'} onClick={() => setTab('tools')} icon={Zap} label="Tools" />
                <NavItem active={tab === 'memory'} onClick={() => setTab('memory')} icon={Database} label="Memory" />
                <NavItem active={tab === 'voice'} onClick={() => setTab('voice')} icon={Volume2} label="Voice" />
             </div>
             
             <div className="hidden md:block px-6 mt-auto">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-2 mb-2 text-gray-400">
                      <Shield size={14} /> <span className="text-xs font-bold uppercase">System Status</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-mono text-white">ONLINE</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-transparent to-white/5 relative overflow-hidden">
             {/* Desktop Content Header */}
             <div className="hidden md:flex h-16 border-b border-white/10 items-center justify-between px-8 bg-black/20">
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                   {tab.charAt(0).toUpperCase() + tab.slice(1)} Configuration
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative">
                <div className="max-w-4xl mx-auto space-y-8 pb-12">
                
                {tab === 'general' && (
                   <GeneralTab 
                      settings={settings} 
                      setSettings={setSettings} 
                      onFactoryReset={handleFactoryReset}
                      spending={spending}
                   />
                )}

                {tab === 'persona' && (
                   <PersonaTab 
                      systemInstruction={systemInstruction} 
                      setSystemInstruction={setSystemInstruction} 
                      onOptimize={handleOptimizeSystem} 
                      isOptimizing={isOptimizingSys} 
                   />
                )}

                {tab === 'tools' && (
                   <>
                      {!toolEditForm ? (
                         <ToolsTab 
                            tools={tools} 
                            onToggle={handleToolToggle} 
                            onEdit={(tool, idx) => { setToolEditForm(tool); setEditingToolIndex(idx); }}
                            onCreate={() => { setToolEditForm({ name: '', description: '', parameters: '{}', code: '', enabled: true }); setEditingToolIndex(null); }}
                         />
                      ) : (
                         <ToolEditor 
                            tool={toolEditForm} 
                            onSave={handleToolSave} 
                            onCancel={() => { setToolEditForm(null); setEditingToolIndex(null); }} 
                            generateRaw={generateRaw} 
                         />
                      )}
                   </>
                )}
                
                {tab === 'memory' && (
                  <MemoryTab 
                     sessions={sessions} 
                     onPurge={handleMemoryPurge} 
                     getChainById={db.getChainById} 
                  />
                )}

                {tab === 'voice' && (
                   <VoiceTab />
                )}

                </div>
             </div>
          </div>
       </motion.div>
    </div>
  );
};

const NavItem = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all group ${active ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
    <Icon size={16} className={active ? 'text-accent' : 'text-gray-500 group-hover:text-white'} />
    <span className="text-xs md:text-sm font-bold tracking-wide">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(244,201,93,0.8)] hidden md:block" />}
  </button>
);