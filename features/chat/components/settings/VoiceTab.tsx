import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Play, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from './Shared';

export const VoiceTab: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <SectionHeader title="Audio Interface" subtitle="Configure text-to-speech generation parameters." />
      <div className="p-6 bg-secondary/10 border border-secondary/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 bg-secondary/20 rounded-full text-white"><Volume2 size={24}/></div>
        <div>
          <h4 className="text-lg font-bold text-white mb-2">Gemini Live Ready</h4>
          <p className="text-sm text-gray-400 leading-relaxed">System is compatible with Gemini Live streaming.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'].map((voice, i) => (
          <button key={voice} className={`p-4 rounded-xl border transition-all text-center relative overflow-hidden group ${i === 2 ? 'bg-accent/20 border-accent text-white' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30'}`}>
            {i === 2 && <div className="absolute top-2 right-2 text-accent"><CheckCircle2 size={14}/></div>}
            <div className="w-10 h-10 rounded-full bg-white/10 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play size={16} className={i === 2 ? "text-accent fill-accent" : "text-gray-400"} />
            </div>
            <span className="font-bold text-sm">{voice}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};