
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Key, Cpu, Eye, EyeOff, ExternalLink, Globe, Server, Info, ShieldCheck, Sparkles, DollarSign, Search, Zap, Wifi, RefreshCw, ChevronDown, Radio, Volume2, Image } from 'lucide-react';
import { ChatSettings, AIProvider, G4FSubProvider } from '../../../../types';
import { SectionHeader } from './Shared';
import { type SpendingInfo } from '../../../../lib/supabase/aiService';
import { G4F_PROVIDERS, fetchG4FModels, searchModels, testG4FProvider, getG4FProvider, type G4FProviderConfig } from '../../../../lib/g4fService';

interface GeneralTabProps {
  settings: ChatSettings;
  setSettings: React.Dispatch<React.SetStateAction<ChatSettings>>;
  onFactoryReset: () => void;
  spending?: SpendingInfo | null;
}

const PROVIDERS: { id: AIProvider; label: string; icon: string; defaultModel: string; description?: string }[] = [
  { id: 'g4f', label: 'G4F Gateway', icon: '🌐', defaultModel: 'openai', description: 'Free! 30+ providers, 900+ models' },
  { id: 'intervised', label: 'Intervised AI', icon: '⚡', defaultModel: 'deepseek-v3.2', description: 'Free! $5 credit per user' },
  { id: 'google', label: 'Google Gemini', icon: '✨', defaultModel: 'gemini-3-flash-preview', description: 'Requires API key' },
  { id: 'openai', label: 'OpenAI GPT', icon: '🤖', defaultModel: 'gpt-4o', description: 'Requires API key' },
  { id: 'claude', label: 'Anthropic Claude', icon: '🎭', defaultModel: 'claude-3-5-sonnet-latest', description: 'Requires API key' },
  { id: 'grok', label: 'xAI Grok', icon: '✖️', defaultModel: 'grok-beta', description: 'Requires API key' },
  { id: 'azure', label: 'Azure OpenAI', icon: '☁️', defaultModel: 'gpt-4', description: 'Requires API key' }
];

const INTERVISED_MODELS = [
  { id: 'deepseek-v3.2', label: 'DeepSeek V3.2', description: 'Budget • Fast responses', tier: 'budget' },
  { id: 'kimi-k2-thinking', label: 'Kimi K2 Thinking', description: 'Standard • Long context (256K)', tier: 'standard' },
  { id: 'gpt-4.1', label: 'GPT-4.1', description: 'Standard • Vision support', tier: 'standard' },
  { id: 'grok-4-fast-reasoning', label: 'Grok 4 Fast', description: 'Premium • Best reasoning', tier: 'premium' },
];

export const GeneralTab: React.FC<GeneralTabProps> = ({ settings, setSettings, onFactoryReset, spending }) => {
  const [showKey, setShowKey] = useState(false);
  const [g4fModels, setG4fModels] = useState<string[]>([]);
  const [g4fModelSearch, setG4fModelSearch] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [providerStatus, setProviderStatus] = useState<{ success: boolean; latency: number } | null>(null);
  const [showAllModels, setShowAllModels] = useState(false);

  // Get current G4F provider config
  const currentG4FProvider = useMemo(() => {
    return getG4FProvider(settings.g4f?.subProvider || 'pollinations');
  }, [settings.g4f?.subProvider]);

  // Fetch models when G4F provider changes
  useEffect(() => {
    if (settings.provider === 'g4f' && settings.g4f?.subProvider) {
      setIsLoadingModels(true);
      setProviderStatus(null);

      const fetchModels = async () => {
        try {
          const models = await fetchG4FModels(
            settings.g4f!.subProvider,
            settings.g4f?.apiKey,
            settings.g4f?.customBaseUrl
          );
          setG4fModels(models);

          // Test provider connectivity
          const status = await testG4FProvider(
            settings.g4f!.subProvider,
            settings.g4f?.apiKey,
            settings.g4f?.customBaseUrl
          );
          setProviderStatus(status);
        } catch (error) {
          console.error('Failed to fetch models:', error);
          // Use popular models as fallback
          if (currentG4FProvider) {
            setG4fModels(currentG4FProvider.popularModels);
          }
        } finally {
          setIsLoadingModels(false);
        }
      };

      fetchModels();
    }
  }, [settings.provider, settings.g4f?.subProvider, settings.g4f?.apiKey, settings.g4f?.customBaseUrl, currentG4FProvider]);

  // Filter models by search
  const filteredModels = useMemo(() => {
    const searched = searchModels(g4fModels, g4fModelSearch);
    return showAllModels ? searched : searched.slice(0, 20);
  }, [g4fModels, g4fModelSearch, showAllModels]);

  const handleProviderChange = (providerId: AIProvider) => {
    const provider = PROVIDERS.find(p => p.id === providerId);
    setSettings(prev => ({
      ...prev,
      provider: providerId,
      modelOverride: provider?.defaultModel || prev.modelOverride,
      // Initialize G4F settings if switching to G4F
      ...(providerId === 'g4f' && !prev.g4f ? {
        g4f: {
          subProvider: 'pollinations',
          model: 'openai',
          apiKey: import.meta.env.VITE_G4F_API_KEY || '',
          streaming: true,
          webSearch: false
        }
      } : {})
    }));
  };

  const handleG4FSubProviderChange = (subProvider: G4FSubProvider) => {
    const config = getG4FProvider(subProvider);
    setSettings(prev => ({
      ...prev,
      g4f: {
        ...prev.g4f!,
        subProvider,
        model: config?.popularModels[0] || 'gpt-4o'
      }
    }));
    setG4fModelSearch('');
    setShowAllModels(false);
  };

  const handleG4FModelSelect = (model: string) => {
    setSettings(prev => ({
      ...prev,
      g4f: {
        ...prev.g4f!,
        model
      }
    }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

      {/* Intervised AI Usage Banner */}
      {settings.provider === 'intervised' && spending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border border-accent/30 p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <DollarSign size={20} className="text-accent" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">AI Usage Credit</div>
                <div className="text-xs text-gray-400">Free credit per user • Resets monthly</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent">${spending.remaining.toFixed(2)}</div>
              <div className="text-xs text-gray-500">of $5.00 remaining</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(spending.remaining / spending.limit) * 100}%` }}
                className="h-full bg-gradient-to-r from-accent to-green-400 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono">
              <span>Spent: ${spending.current.toFixed(4)}</span>
              <span>Limit: ${spending.limit.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Provider Selector */}
      <div className="space-y-6">
        <SectionHeader title="Intelligence Core" subtitle="Select the neural engine powering this interface." />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all relative overflow-hidden group ${settings.provider === p.id
                ? 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(244,201,93,0.15)]'
                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                } ${p.id === 'intervised' ? 'col-span-2 sm:col-span-1 ring-2 ring-accent/30' : ''}`}
            >
              {p.id === 'intervised' && (
                <div className="absolute top-1 right-1 bg-accent text-black text-[8px] font-bold px-2 py-0.5 rounded-full">
                  FREE
                </div>
              )}
              {p.id === 'g4f' && (
                <div className="absolute top-1 right-1 bg-green-500 text-black text-[8px] font-bold px-2 py-0.5 rounded-full">
                  FREE
                </div>
              )}
              <span className="text-2xl group-hover:scale-110 transition-transform">{p.icon}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${settings.provider === p.id ? 'text-accent' : 'text-gray-400'}`}>
                {p.label}
              </span>
              {p.description && (
                <span className="text-[9px] text-gray-500 text-center">{p.description}</span>
              )}
              {settings.provider === p.id && (
                <motion.div layoutId="provider-check" className="absolute top-2 left-2"><ShieldCheck size={12} className="text-accent" /></motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* G4F Multi-Provider Settings */}
      {settings.provider === 'g4f' && (
        <div className="space-y-6">
          <SectionHeader title="Provider Gateway" subtitle="Select from 30+ AI providers with 900+ models. All free!" />

          {/* Provider Status Badge */}
          {providerStatus && (
            <div className={`flex items-center gap-2 text-xs ${providerStatus.success ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${providerStatus.success ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              {providerStatus.success
                ? `Connected • ${providerStatus.latency}ms latency`
                : `Connection failed: ${providerStatus.latency}ms`
              }
            </div>
          )}

          {/* Sub-Provider Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {G4F_PROVIDERS.filter(p => p.id !== 'custom').map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleG4FSubProviderChange(provider.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all relative group ${settings.g4f?.subProvider === provider.id
                  ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{provider.icon}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight ${settings.g4f?.subProvider === provider.id ? 'text-green-400' : 'text-gray-400'
                  }`}>
                  {provider.label}
                </span>
                {/* Capability icons */}
                <div className="flex gap-1 mt-0.5">
                  {provider.supportsStreaming && <Zap size={8} className="text-yellow-400" />}
                  {provider.supportsVision && <Eye size={8} className="text-blue-400" />}
                  {provider.supportsImageGen && <Image size={8} className="text-purple-400" />}
                  {provider.supportsAudio && <Volume2 size={8} className="text-pink-400" />}
                </div>
                {settings.g4f?.subProvider === provider.id && (
                  <motion.div layoutId="g4f-provider-check" className="absolute top-1 right-1">
                    <Radio size={10} className="text-green-400" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          {/* Provider Info */}
          {currentG4FProvider && (
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{currentG4FProvider.icon}</span>
                <div>
                  <div className="text-sm font-bold text-white">{currentG4FProvider.label}</div>
                  <div className="text-[10px] text-gray-400">{currentG4FProvider.description}</div>
                </div>
                {currentG4FProvider.requiresAuth && (
                  <span className="ml-auto text-[9px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-bold">
                    API KEY
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-[9px]">
                {currentG4FProvider.supportsStreaming && (
                  <span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1">
                    <Zap size={10} /> Streaming
                  </span>
                )}
                {currentG4FProvider.supportsVision && (
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full flex items-center gap-1">
                    <Eye size={10} /> Vision
                  </span>
                )}
                {currentG4FProvider.supportsImageGen && (
                  <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                    <Image size={10} /> Image Gen
                  </span>
                )}
                {currentG4FProvider.supportsAudio && (
                  <span className="bg-pink-500/10 text-pink-400 px-2 py-1 rounded-full flex items-center gap-1">
                    <Volume2 size={10} /> Audio
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Cpu size={14} className="text-green-400" /> Model Selection
              </label>
              <span className="text-[10px] text-gray-500">
                {g4fModels.length} models available
                {isLoadingModels && <RefreshCw size={10} className="inline ml-1 animate-spin" />}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={g4fModelSearch}
                onChange={(e) => setG4fModelSearch(e.target.value)}
                placeholder="Search models..."
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-green-500/50 outline-none text-white"
              />
            </div>

            {/* Model Grid */}
            <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10">
              {isLoadingModels ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <RefreshCw size={20} className="animate-spin mr-2" />
                  Loading models...
                </div>
              ) : filteredModels.length > 0 ? (
                <>
                  {filteredModels.map((model) => (
                    <button
                      key={model}
                      onClick={() => handleG4FModelSelect(model)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm font-mono ${settings.g4f?.model === model
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-transparent'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{model}</span>
                        {settings.g4f?.model === model && <ShieldCheck size={14} className="text-green-400 flex-shrink-0" />}
                      </div>
                    </button>
                  ))}
                  {g4fModels.length > 20 && !showAllModels && (
                    <button
                      onClick={() => setShowAllModels(true)}
                      className="w-full text-center py-2 text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      Show all {g4fModels.length} models <ChevronDown size={12} className="inline" />
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No models found
                </div>
              )}
            </div>

            {/* Current Model Display */}
            <div className="bg-black/40 border border-white/10 px-4 py-3 rounded-xl">
              <div className="text-[10px] text-gray-500 uppercase mb-1">Selected Model</div>
              <div className="text-sm font-mono text-green-400">{settings.g4f?.model || 'None'}</div>
            </div>
          </div>

          {/* G4F Provider-Specific Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* API Key (for g4f-main) */}
            {currentG4FProvider?.requiresAuth && (
              <form onSubmit={(e) => e.preventDefault()} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Key size={14} className="text-green-400" /> G4F API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    autoComplete="off"
                    value={settings.g4f?.apiKey || ''}
                    onChange={(e) => setSettings(p => ({ ...p, g4f: { ...p.g4f!, apiKey: e.target.value } }))}
                    placeholder="g4f_u_..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-green-500/50 outline-none text-white pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </form>
            )}

            {/* Custom Base URL (for custom/ollama) */}
            {(settings.g4f?.subProvider === 'custom' || settings.g4f?.subProvider === 'ollama') && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} className="text-green-400" /> Base URL
                </label>
                <input
                  type="text"
                  value={settings.g4f?.customBaseUrl || ''}
                  onChange={(e) => setSettings(p => ({ ...p, g4f: { ...p.g4f!, customBaseUrl: e.target.value } }))}
                  placeholder={settings.g4f?.subProvider === 'ollama' ? 'http://localhost:11434/v1' : 'http://localhost:1337/v1'}
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm focus:border-green-500/50 outline-none text-white font-mono"
                />
              </div>
            )}

            {/* Streaming Toggle */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" /> Streaming
                </label>
                <button
                  onClick={() => setSettings(p => ({ ...p, g4f: { ...p.g4f!, streaming: !p.g4f?.streaming } }))}
                  className={`w-12 h-6 rounded-full transition-all ${settings.g4f?.streaming ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                >
                  <motion.div
                    layout
                    className={`w-5 h-5 bg-white rounded-full shadow-lg ${settings.g4f?.streaming ? 'ml-[26px]' : 'ml-[2px]'
                      }`}
                  />
                </button>
              </div>
              <div className="text-[9px] text-gray-500 mt-2">Real-time response streaming</div>
            </div>

            {/* Web Search Toggle (for supported providers) */}
            {currentG4FProvider?.supportsWebSearch && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Search size={14} className="text-blue-400" /> Web Search
                  </label>
                  <button
                    onClick={() => setSettings(p => ({ ...p, g4f: { ...p.g4f!, webSearch: !p.g4f?.webSearch } }))}
                    className={`w-12 h-6 rounded-full transition-all ${settings.g4f?.webSearch ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                  >
                    <motion.div
                      layout
                      className={`w-5 h-5 bg-white rounded-full shadow-lg ${settings.g4f?.webSearch ? 'ml-[26px]' : 'ml-[2px]'
                        }`}
                    />
                  </button>
                </div>
                <div className="text-[9px] text-gray-500 mt-2">Enable real-time web search</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Intervised Model Selection */}
      {settings.provider === 'intervised' && (
        <div className="space-y-6">
          <SectionHeader title="Model Selection" subtitle="Choose your AI model. Budget models cost less of your credit." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTERVISED_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSettings(p => ({ ...p, modelOverride: model.id }))}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${settings.modelOverride === model.id
                  ? 'bg-accent/10 border-accent'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
              >
                <div className={`w-3 h-3 rounded-full ${model.tier === 'budget' ? 'bg-green-400' :
                  model.tier === 'standard' ? 'bg-blue-400' : 'bg-purple-400'
                  }`} />
                <div className="text-left flex-1">
                  <div className={`text-sm font-medium ${settings.modelOverride === model.id ? 'text-accent' : 'text-white'}`}>
                    {model.label}
                  </div>
                  <div className="text-[10px] text-gray-500">{model.description}</div>
                </div>
                {settings.modelOverride === model.id && (
                  <ShieldCheck size={16} className="text-accent" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <Info size={12} />
            <span>🟢 Budget = Cheapest • 🔵 Standard = Balanced • 🟣 Premium = Best quality</span>
          </div>
        </div>
      )}

      {/* API Configuration - Only show for non-Intervised providers */}
      {settings.provider !== 'intervised' && (
        <div className="space-y-6">
          <SectionHeader title="Connection Parameters" subtitle="Secure authentication and model addressing." />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* API Key */}
            <form onSubmit={(e) => e.preventDefault()} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Key size={14} className="text-accent" /> Authentication
                </label>
                <span className="text-[10px] text-gray-600 font-mono">ENCRYPTED AT REST</span>
              </div>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  autoComplete="off"
                  value={settings.customApiKey || ''}
                  onChange={(e) => setSettings(p => ({ ...p, customApiKey: e.target.value }))}
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
            </form>

            {/* Model Selection */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Cpu size={14} className="text-accent" /> Model Identifier
              </label>
              <input
                type="text"
                value={settings.modelOverride || ''}
                onChange={(e) => setSettings(p => ({ ...p, modelOverride: e.target.value }))}
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
                    onChange={(e) => setSettings(p => ({ ...p, azureEndpoint: e.target.value }))}
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
                    onChange={(e) => setSettings(p => ({ ...p, azureDeployment: e.target.value }))}
                    placeholder="e.g. MyGpt4Deployment"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-accent/50 outline-none text-white font-mono"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
                onChange={(e) => setSettings(p => ({ ...p, temperature: parseFloat(e.target.value) }))}
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
                  onClick={() => setSettings(p => ({ ...p, systemTone: tone }))}
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
