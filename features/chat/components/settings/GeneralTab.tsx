
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Key, Cpu, Eye, EyeOff, ExternalLink, Globe, Server, Info, ShieldCheck } from 'lucide-react';
import { ChatSettings, AIProvider } from '../../../../types';
import { SectionHeader } from './Shared';

interface GeneralTabProps {
  settings: ChatSettings;
  setSettings: React.Dispatch<React.SetStateAction<ChatSettings>>;
  onFactoryReset: () => void;
}

const PROVIDERS: { id: AIProvider; label: string; icon: string; defaultModel: string }[] = [
  { id: 'google', label: 'Google Gemini', icon: '✨', defaultModel: 'gemini-3-flash-preview' },
  { id: 'openai', label: 'OpenAI GPT', icon: '🤖', defaultModel: 'gpt-4o' },
  { id: 'claude', label: 'Anthropic Claude', icon: '🎭', defaultModel: 'claude-3-5-sonnet-latest' },
  { id: 'grok', label: 'xAI Grok', icon: '✖️', defaultModel: 'grok-beta' },
  { id: 'azure', label: 'Azure OpenAI', icon: '☁️', defaultModel: 'gpt-4' }
];

export const GeneralTab: React.FC<GeneralTabProps> = ({ settings, setSettings, onFactoryReset }) => {
  const [showKey, setShowKey] = useState(false);

  const handleProviderChange = (providerId: AIProvider) => {
    const provider = PROVIDERS.find(p => p.id === providerId);
    setSettings(prev => ({
      ...prev,
      provider: providerId,
      modelOverride: provider?.defaultModel || prev.modelOverride
    }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      
      {/* Provider Selector */}
      <div className="space-y-6">
        <SectionHeader title="Intelligence Core" subtitle="Select the neural engine powering this interface." />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                settings.provider === p.id 
                  ? 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(244,201,93,0.15)]' 
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{p.icon}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${settings.provider === p.id ? 'text-accent' : 'text-gray-400'}`}>
                {p.label}
              </span>
              {settings.provider === p.id && (
                <motion.div layoutId="provider-check" className="absolute top-2 right-2"><ShieldCheck size={12} className="text-accent" /></motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* API Configuration */}
      <div className="space-y-6">
        <SectionHeader title="Connection Parameters" subtitle="Secure authentication and model addressing." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* API Key */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Key size={14} className="text-accent" /> Authentication
              </label>
              <span className="text-[10px] text-gray-600 font-mono">ENCRYPTED AT REST</span>
            </div>
            <div className="relative">
              <input 
                type={showKey ? "text" : "password"} 
                value={settings.customApiKey || ''}
                onChange={(e) => setSettings(p => ({...p, customApiKey: e.target.value}))}
                placeholder={`Enter ${settings.provider.toUpperCase()} API Key`}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-accent/50 outline-none text-white pr-12 font-mono"
              />
              <button 
                type="button" 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 italic">
              <Info size={12} />
              {settings.provider === 'google' ? 'Optional (uses system key if empty)' : 'Mandatory for external protocols'}
            </div>
          </div>

          {/* Model Selection */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
            <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Cpu size={14} className="text-accent" /> Model Identifier
            </label>
            <input 
              type="text" 
              value={settings.modelOverride || ''}
              onChange={(e) => setSettings(p => ({...p, modelOverride: e.target.value}))}
              placeholder="e.g. gpt-4o, claude-3-opus"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-accent/50 outline-none text-white font-mono"
            />
            <div className="flex justify-between items-center text-[10px] text-gray-500">
              <span className="font-mono uppercase tracking-tighter">Current Vector: {settings.modelOverride}</span>
              <a href="#" className="hover:text-accent underline">Docs</a>
            </div>
          </div>
        </div>

        {/* Azure Specific Config */}
        <AnimatePresence>
          {settings.provider === 'azure' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden"
            >
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} className="text-accent" /> Endpoint URL
                </label>
                <input 
                  type="text" 
                  value={settings.azureEndpoint || ''}
                  onChange={(e) => setSettings(p => ({...p, azureEndpoint: e.target.value}))}
                  placeholder="https://YOUR_RESOURCE.openai.azure.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-accent/50 outline-none text-white font-mono"
                />
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Server size={14} className="text-accent" /> Deployment Name
                </label>
                <input 
                  type="text" 
                  value={settings.azureDeployment || ''}
                  onChange={(e) => setSettings(p => ({...p, azureDeployment: e.target.value}))}
                  placeholder="e.g. MyGpt4Deployment"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-accent/50 outline-none text-white font-mono"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Parameters */}
      <div className="space-y-6">
        <SectionHeader title="Heuristics" subtitle="Fine-tune the cognitive output characteristics." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-widest block">Neural Temperature</label>
              <span className="font-mono text-accent font-bold text-lg">{settings.temperature}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-gray-600 font-bold">STABLE</span>
              <input 
                type="range" min="0" max="2" step="0.1" 
                value={settings.temperature} 
                onChange={(e) => setSettings(p => ({...p, temperature: parseFloat(e.target.value)}))} 
                className="flex-1 accent-accent h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
              />
              <span className="text-[10px] text-gray-600 font-bold">CREATIVE</span>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <label className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-6 block">System Tone calibration</label>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              {(['formal', 'creative', 'technical'] as const).map(tone => (
                <button 
                  key={tone} 
                  onClick={() => setSettings(p => ({...p, systemTone: tone}))} 
                  className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${settings.systemTone === tone ? 'bg-secondary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/10">
        <button 
          onClick={onFactoryReset} 
          className="w-full md:w-auto px-6 py-3 border border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all text-sm font-bold flex items-center justify-center gap-2 group"
        >
          <Trash2 size={16} className="group-hover:rotate-12 transition-transform" /> Reset System Memory & Config
        </button>
      </div>
    </motion.div>
  );
};
