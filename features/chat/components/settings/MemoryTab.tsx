import React from 'react';
import { motion } from 'framer-motion';
import { Database, Activity, FileText, AlertTriangle, BrainCircuit } from 'lucide-react';
import { ChatSession } from '../../../../types';
import { SectionHeader } from './Shared';

interface MemoryTabProps {
  sessions: ChatSession[];
  onPurge: () => void;
  getChainById: (id: string) => any;
}

export const MemoryTab: React.FC<MemoryTabProps> = ({ sessions, onPurge, getChainById }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <SectionHeader title="Semantic Memory Core" subtitle="View and manage the persistent context of your sessions." />
      <div className="flex justify-between items-center bg-gradient-to-r from-secondary/20 to-accent/20 p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
            <Database className="text-accent" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-lg">{sessions.length} Active Vectors</h4>
            <p className="text-sm text-accent/60">Total stored conversation contexts.</p>
          </div>
        </div>
        <button 
          onClick={onPurge} 
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold border border-red-500/30 transition-colors"
        >
          PURGE ALL
        </button>
      </div>
      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <Activity className="mx-auto mb-4 opacity-20" size={48} />
            <p className="text-gray-500">Memory core is empty.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-400" />
                  <div>
                    <div className="font-bold text-white">{session.title}</div>
                    <span className="text-xs font-mono text-gray-500">{new Date(session.lastModified).toLocaleString()}</span>
                  </div>
                </div>
                {session.analysis?.distortionRisk && (
                  <span className={`text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 font-bold tracking-wide ${session.analysis.distortionRisk === 'High' ? 'border-red-500/50 text-red-400 bg-red-500/10' : session.analysis.distortionRisk === 'Medium' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' : 'border-green-500/50 text-green-400 bg-green-500/10'}`}>
                    <AlertTriangle size={10} />{session.analysis.distortionRisk.toUpperCase()}
                  </span>
                )}
              </div>
              {session.analysis?.summary && (
                <div className="text-sm text-gray-400 leading-relaxed mb-4 pl-4 border-l-2 border-white/10 italic">
                  "{session.analysis.summary}"
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {session.analysis?.detectedChains?.map(chainId => { 
                  const chain = getChainById(chainId); 
                  return chain ? (
                    <div key={chainId} className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/10 border border-secondary/30 text-[10px] text-white font-mono uppercase">
                      <BrainCircuit size={10} />{chain.name}
                    </div>
                  ) : null; 
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};