import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { SectionHeader } from './Shared';

interface PersonaTabProps {
  systemInstruction: string;
  setSystemInstruction: (s: string) => void;
  onOptimize: () => void;
  isOptimizing: boolean;
}

export const PersonaTab: React.FC<PersonaTabProps> = ({ systemInstruction, setSystemInstruction, onOptimize, isOptimizing }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col">
      <SectionHeader title="System Instruction" subtitle="Define the identity, constraints, and behavior of the AI." />
      <div className="relative flex-1 min-h-[500px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden flex flex-col group">
        <div className="h-12 border-b border-white/10 flex justify-between items-center px-4 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <button 
            onClick={onOptimize} 
            disabled={isOptimizing} 
            className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {isOptimizing ? <span className="animate-spin">⟳</span> : <Sparkles size={14} />} AI Optimize
          </button>
        </div>
        <textarea 
          value={systemInstruction} 
          onChange={(e) => setSystemInstruction(e.target.value)} 
          className="flex-1 w-full p-6 bg-transparent text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none selection:bg-accent/30 selection:text-white" 
          spellCheck={false} 
        />
      </div>
    </motion.div>
  );
};