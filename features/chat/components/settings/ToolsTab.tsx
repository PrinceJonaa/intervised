import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Plus } from 'lucide-react';
import { ToolDefinition } from '../../../../types';
import { SectionHeader } from './Shared';

interface ToolsTabProps {
  tools: ToolDefinition[];
  onToggle: (index: number) => void;
  onEdit: (tool: ToolDefinition, index: number) => void;
  onCreate: () => void;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({ tools, onToggle, onEdit, onCreate }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <SectionHeader title="Neural Skills" subtitle="Enable or disable capabilities." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {tools.map((tool, idx) => (
          <div key={idx} className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/30 p-5 rounded-2xl transition-all group flex flex-col justify-between h-auto sm:h-40 gap-4 sm:gap-0">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-black/40 rounded-lg text-accent group-hover:text-white transition-colors border border-white/5 group-hover:border-accent/30">
                  <Terminal size={18} />
                </div>
                <div 
                  onClick={() => onToggle(idx)} 
                  className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative ${tool.enabled ? 'bg-accent' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${tool.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
              <h4 className="font-bold text-white text-sm truncate">{tool.name}</h4>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[2rem]">{tool.description}</p>
            </div>
            <button 
              onClick={() => onEdit(tool, idx)} 
              className="mt-auto w-full py-2 bg-black/20 hover:bg-accent/20 rounded-lg text-xs font-mono text-gray-400 hover:text-accent transition-colors border border-white/5 hover:border-accent/30"
            >
              CONFIGURE
            </button>
          </div>
        ))}
        <button 
          onClick={onCreate} 
          className="border border-dashed border-white/10 hover:border-accent/50 bg-transparent hover:bg-accent/5 p-5 rounded-2xl transition-all flex flex-col items-center justify-center gap-3 h-40 group text-gray-500 hover:text-accent"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
            <Plus size={24} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">Create New Skill</span>
        </button>
      </div>
    </motion.div>
  );
};