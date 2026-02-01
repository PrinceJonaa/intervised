import React, { useState } from 'react';
import { Save, PanelLeftClose, Zap } from 'lucide-react';
import { ToolDefinition } from '../../../types';

interface ToolEditorProps {
  tool: ToolDefinition;
  onSave: (tool: ToolDefinition) => void;
  onCancel: () => void;
  generateRaw: (prompt: string) => Promise<string | null>;
}

export const ToolEditor: React.FC<ToolEditorProps> = ({ tool, onSave, onCancel, generateRaw }) => {
  const [form, setForm] = useState<ToolDefinition>(tool);
  const [tab, setTab] = useState<'info' | 'code' | 'schema'>('info');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [status, setStatus] = useState("");

  const handleOptimizeCode = async () => {
     setIsOptimizing(true);
     setStatus("Analyzing logic...");
     
     const prompt = `
        You are an expert JavaScript/TypeScript developer optimizing a function body.
        Context: Tool Name: ${form.name}. Description: ${form.description}.
        Current Code: ${form.code}
        Task: Improve this code. Make it cleaner, more efficient, handle errors better.
        Ensure it works as a function body (no imports).
        You have access to 'db', 'utils', 'args'.
        Output ONLY the raw code.
     `;
     
     const result = await generateRaw(prompt);
     if (result) {
        const clean = result.replace(/^```javascript|```$/g, '').replace(/^```|```$/g, '').trim();
        // Clear secure implementation when code is modified by AI
        setForm({...form, code: clean, implementation: undefined});
        setStatus("Optimized!");
        setTimeout(() => setStatus(""), 2000);
     } else {
        setStatus("Failed to optimize.");
     }
     setIsOptimizing(false);
  };

  return (
    <div className="flex flex-col h-[70vh] bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-fadeIn">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10">
         <div className="flex items-center gap-4">
            <button onClick={onCancel} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 flex items-center gap-2 text-gray-300 transition-colors"><PanelLeftClose size={14}/> Back to Grid</button>
            <div className="h-6 w-px bg-white/10"></div>
            <span className="text-sm font-bold text-white font-mono">{form.name || 'Untitled_Tool'}</span>
            <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">JS ENV</span>
         </div>
         <button onClick={() => onSave(form)} className="px-5 py-2 bg-secondary hover:bg-accent hover:text-void text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg"><Save size={14}/> SAVE CHANGES</button>
      </div>
      
      {/* IDE Container */}
      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar Navigation */}
         <div className="w-48 bg-black/20 border-r border-white/10 flex flex-col">
            <button onClick={() => setTab('info')} className={`p-4 text-xs font-bold uppercase tracking-wider text-left border-l-2 transition-all hover:bg-white/5 ${tab === 'info' ? 'border-accent text-accent bg-white/5' : 'border-transparent text-gray-500'}`}>1. Definition</button>
            <button onClick={() => setTab('schema')} className={`p-4 text-xs font-bold uppercase tracking-wider text-left border-l-2 transition-all hover:bg-white/5 ${tab === 'schema' ? 'border-accent text-accent bg-white/5' : 'border-transparent text-gray-500'}`}>2. JSON Schema</button>
            <button onClick={() => setTab('code')} className={`p-4 text-xs font-bold uppercase tracking-wider text-left border-l-2 transition-all hover:bg-white/5 ${tab === 'code' ? 'border-accent text-accent bg-white/5' : 'border-transparent text-gray-500'}`}>3. Logic (JS)</button>
         </div>

         {/* Editor Content */}
         <div className="flex-1 bg-black/60 relative">
            {tab === 'info' && (
               <div className="p-8 max-w-2xl space-y-6">
                  <div>
                     <label className="text-xs uppercase text-gray-500 font-bold block mb-2">Function Name</label>
                     <input className="w-full bg-black border border-white/20 rounded-lg p-3 text-white focus:border-accent/50 outline-none font-mono text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. check_status" />
                  </div>
                  <div>
                     <label className="text-xs uppercase text-gray-500 font-bold block mb-2">Description</label>
                     <textarea className="w-full bg-black border border-white/20 rounded-lg p-3 text-gray-300 h-32 focus:border-accent/50 outline-none resize-none text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What does this tool do?" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/10">
                       <span className="text-sm font-bold text-gray-300">Enabled</span>
                       <div onClick={() => setForm({...form, enabled: !form.enabled})} className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative ${form.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${form.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                       </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/10">
                       <span className="text-sm font-bold text-gray-300">Always On</span>
                       <div onClick={() => setForm({...form, alwaysOn: !form.alwaysOn})} className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors relative ${form.alwaysOn ? 'bg-accent' : 'bg-gray-600'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${form.alwaysOn ? 'translate-x-4' : 'translate-x-0'}`} />
                       </div>
                    </div>
                  </div>
               </div>
            )}

            {tab === 'code' && (
               <div className="flex flex-col h-full">
                  <div className="absolute top-4 right-4 z-10">
                     <button 
                        onClick={handleOptimizeCode}
                        disabled={isOptimizing}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold text-accent disabled:opacity-50 transition-colors"
                     >
                        {isOptimizing ? <span className="animate-spin">⟳</span> : <Zap size={14}/>}
                        {status || "AI Improve Code"}
                     </button>
                  </div>
                  <textarea 
                    className="w-full h-full bg-[#0d0d0d] p-6 text-green-400 font-mono text-sm leading-relaxed outline-none resize-none" 
                    value={form.code} 
                    // Clear secure implementation when code is manually modified
                    onChange={e => setForm({...form, code: e.target.value, implementation: undefined})}
                    spellCheck={false} 
                  />
               </div>
            )}

            {tab === 'schema' && (
               <textarea 
                  className="w-full h-full bg-[#0d0d0d] p-6 text-yellow-100 font-mono text-sm leading-relaxed outline-none resize-none" 
                  value={form.parameters} 
                  onChange={e => setForm({...form, parameters: e.target.value})} 
                  spellCheck={false} 
               />
            )}
         </div>
      </div>
    </div>
  );
};