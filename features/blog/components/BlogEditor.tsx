
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3, Save, Bold, Italic, Heading1, Heading2, Heading3, Quote, Code,
  Image as ImageIcon, List, Layout, Eye, Type, Settings, Globe, Hash,
  ArrowLeft, Terminal, Sparkles, X, Plus, Trash2, Upload, Link as LinkIcon,
  Printer, Sun, Moon, History, Check, Loader2
} from 'lucide-react';
import { BlogPost, User as UserType } from '../../../types';
import { MarkdownRenderer } from './reader/MarkdownRenderer';
import { useToast } from '../../../components/ToastSystem';

const calculateReadTime = (text: string) => Math.ceil(text.trim().split(/\s+/).length / 200);

// Auto-save key prefix
const AUTOSAVE_KEY = 'blog_draft_';

export const Editor = ({
  initialPost,
  onCancel,
  onSave,
  currentUser,
  categories
}: {
  initialPost?: BlogPost,
  onCancel: () => void,
  onSave: (p: BlogPost) => void,
  currentUser: UserType | null,
  categories: string[]
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'metadata'>('write');
  const [formData, setFormData] = useState<Partial<BlogPost>>(initialPost || {
    title: '',
    content: '',
    tags: [],
    category: 'Creative',
    imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&grayscale`,
    status: 'draft',
    excerpt: '',
    slug: '',
    metaDescription: '',
    keywords: [],
    authorRole: currentUser?.isAdmin ? 'Technologist' : 'Contributor'
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toc, setToc] = useState<{ level: number, text: string }[]>([]);

  // Phase 1: Editor Enhancement States
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [editorTheme, setEditorTheme] = useState<'dark' | 'light'>('dark');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AI Assistant State
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fontSizeMap = { sm: 'text-sm', md: 'text-base md:text-xl', lg: 'text-lg md:text-2xl', xl: 'text-xl md:text-3xl' };
  const titleFontMap = { sm: 'text-2xl md:text-4xl', md: 'text-3xl md:text-6xl', lg: 'text-4xl md:text-7xl', xl: 'text-5xl md:text-8xl' };

  // Load auto-saved draft on mount
  useEffect(() => {
    if (!initialPost) {
      const savedDraft = localStorage.getItem(AUTOSAVE_KEY + 'new');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData(prev => ({ ...prev, ...parsed }));
          addToast('Draft restored from auto-save', 'info');
        } catch (e) { /* ignore */ }
      }
    }
  }, []);

  // Auto-save debounced effect
  useEffect(() => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (formData.title || formData.content) {
        setAutoSaveStatus('saving');
        const key = AUTOSAVE_KEY + (initialPost?.id || 'new');
        localStorage.setItem(key, JSON.stringify(formData));
        setTimeout(() => setAutoSaveStatus('saved'), 300);
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [formData, initialPost?.id]);

  // Update TOC on content change
  useEffect(() => {
    const lines = (formData.content || '').split('\n');
    const headings = lines
      .filter(line => line.startsWith('#'))
      .map(line => {
        const level = line.match(/^#+/)?.[0].length || 0;
        const text = line.replace(/^#+\s/, '').trim();
        return { level, text };
      });
    setToc(headings);
  }, [formData.content]);

  // Print handler
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html><head><title>${formData.title || 'Blog Post'}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; }
          h1 { font-size: 2.5em; margin-bottom: 0.5em; }
          h2, h3 { margin-top: 1.5em; }
          pre { background: #f5f5f5; padding: 1em; overflow-x: auto; }
          code { background: #f5f5f5; padding: 0.2em 0.4em; }
          img { max-width: 100%; }
          @media print { body { margin: 0; } }
        </style></head><body>
        <h1>${formData.title || 'Untitled'}</h1>
        <div>${formData.content?.replace(/\n/g, '<br>') || ''}</div>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [formData.title, formData.content]);

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      addToast('Title and content are required to broadcast.', 'error');
      return;
    }
    let slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const postToSave: BlogPost = {
      id: initialPost?.id || Date.now().toString(),
      title: formData.title,
      slug: slug,
      content: formData.content,
      excerpt: formData.excerpt || formData.content.substring(0, 150).replace(/[#*`]/g, '') + '...',
      imageUrl: formData.imageUrl!,
      tags: formData.tags || [],
      category: formData.category || 'Creative',
      status: formData.status as 'draft' | 'published' || 'draft',
      author: initialPost?.author || currentUser?.name || 'Admin',
      authorRole: formData.authorRole || 'Contributor',
      date: initialPost?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: initialPost?.timestamp || Date.now(),
      lastModified: Date.now(),
      readTime: calculateReadTime(formData.content),
      views: initialPost?.views || 0,
      likes: initialPost?.likes || 0,
      comments: initialPost?.comments || [],
      metaDescription: formData.metaDescription || formData.excerpt || '',
      keywords: formData.keywords || []
    };
    onSave(postToSave);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
        addToast('Visual anchor updated successfully.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Tool Handler
  const handleAITool = async (tool: string, customPrompt?: string) => {
    setAiLoading(true);
    const textarea = textareaRef.current;
    const selectedText = textarea ? textarea.value.substring(textarea.selectionStart, textarea.selectionEnd) : '';
    const content = formData.content || '';
    const title = formData.title || '';

    const prompts: Record<string, string> = {
      generate_title: `Generate 5 compelling blog post titles based on this content:\n\n${content.substring(0, 500)}`,
      generate_outline: `Create a detailed outline with sections and bullet points for a blog post titled "${title}" about:\n\n${content.substring(0, 500)}`,
      expand: `Expand and elaborate on this text, adding more detail and context:\n\n${selectedText || content.substring(0, 500)}`,
      rewrite: `Rewrite this text to be more engaging and professional:\n\n${selectedText || content.substring(0, 500)}`,
      grammar: `Fix any grammar, spelling, and punctuation errors in this text. Return only the corrected text:\n\n${selectedText || content}`,
      shorten: `Make this text more concise while keeping the key points:\n\n${selectedText || content.substring(0, 500)}`,
      seo: `Optimize this blog post for SEO. Suggest title, meta description, keywords, and content improvements:\n\nTitle: ${title}\n\nContent:\n${content.substring(0, 1000)}`,
      emoji: `Add relevant emojis to enhance this text:\n\n${selectedText || content.substring(0, 500)}`,
      custom: customPrompt || ''
    };

    const systemPrompt = "You are a professional blog writing assistant. Be concise, creative, and helpful. Format responses in markdown when appropriate.";
    const userPrompt = prompts[tool];

    try {
      const response = await fetch('https://jnfnqtohljybohlcslnm.supabase.co/functions/v1/azure-ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: 'gpt-4o-mini'
        })
      });

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || data.content || '';

      if (aiResponse) {
        if (tool === 'generate_title') {
          addToast('Title suggestions generated! Check below or apply one.', 'success');
          setFormData({ ...formData, content: content + '\n\n---\n### AI Title Suggestions:\n' + aiResponse });
        } else if (tool === 'generate_outline') {
          setFormData({ ...formData, content: content + '\n\n' + aiResponse });
          addToast('Outline added to content!', 'success');
        } else if (selectedText && textarea) {
          // Replace selected text
          const before = content.substring(0, textarea.selectionStart);
          const after = content.substring(textarea.selectionEnd);
          setFormData({ ...formData, content: before + aiResponse + after });
          addToast('Selection updated!', 'success');
        } else {
          setFormData({ ...formData, content: content + '\n\n' + aiResponse });
          addToast('AI response added!', 'success');
        }
        setAiPrompt('');
      }
    } catch (error) {
      console.error('AI error:', error);
      addToast('AI request failed. Try again.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Tool Button Component
  const AIToolBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={aiLoading}
      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono text-gray-300 hover:text-white transition-all disabled:opacity-50"
    >
      {label}
    </button>
  );

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newContent = before + prefix + (selection || 'text') + suffix + after;
    setFormData({ ...formData, content: newContent });

    // Focus back and select
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
      e.preventDefault();
      const val = (e.target as HTMLInputElement).value.trim();
      if (!formData.tags?.includes(val)) {
        setFormData({ ...formData, tags: [...(formData.tags || []), val] });
      }
      (e.target as HTMLInputElement).value = '';
    }
  };

  const VisualAnchorSection = () => (
    <div>
      <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Layout size={12} /> Visual Anchor
      </h4>
      <div className="aspect-video rounded-xl border border-white/10 overflow-hidden bg-black/40 group relative">
        <img src={formData.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="cover" />
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-void rounded-lg text-xs font-bold hover:bg-white transition-colors"
          >
            <Upload size={14} /> Upload Photo
          </button>
          <div className="flex items-center gap-2 w-full">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] text-gray-500 font-mono">OR URL</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <input
            type="text"
            placeholder="Paste External URL"
            value={formData.imageUrl?.startsWith('data:') ? '' : formData.imageUrl}
            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full bg-black/80 border border-white/20 rounded px-3 py-2 text-[10px] text-white outline-none focus:border-accent"
          />
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
    </div>
  );

  const CategorySection = () => (
    <div>
      <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Hash size={12} /> Categories
      </h4>
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFormData({ ...formData, category: c })}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${formData.category === c ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-[#050505] flex flex-col overflow-hidden"
    >
      {/* Top Header Navigation - Fully Opaque Void Color to hide global header */}
      <header className="h-16 md:h-20 border-b border-white/10 bg-void flex items-center justify-between px-4 md:px-8 shrink-0 relative z-[210]">
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors flex-shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div className="hidden sm:block h-6 w-px bg-white/10 flex-shrink-0" />
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg flex-shrink-0">
              <Terminal size={18} className="text-white" />
            </div>
            <span className="hidden xs:block font-display font-bold text-white tracking-tight uppercase text-xs md:text-base truncate">Neural Publishing</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Auto-save indicator */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-500">
            {autoSaveStatus === 'saving' && <><Loader2 size={12} className="animate-spin" /> Saving...</>}
            {autoSaveStatus === 'saved' && <><Check size={12} className="text-green-500" /> Saved</>}
          </div>

          {/* Font size control */}
          <div className="hidden md:flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
            {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${fontSize === size ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setEditorTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="hidden md:flex p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Toggle theme"
          >
            {editorTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="hidden md:flex p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Print-friendly version"
          >
            <Printer size={16} />
          </button>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('write')}
              className={`px-2 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'write' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Edit3 size={14} /> <span className="hidden md:inline">Write</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-2 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Eye size={14} /> <span className="hidden md:inline">Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-2 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'metadata' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Settings size={14} /> <span className="hidden md:inline">Config</span>
            </button>
          </div>
          <button
            onClick={handleSave}
            className="px-4 md:px-6 py-2 bg-accent text-void font-bold rounded-xl hover:bg-white transition-all flex items-center gap-2 text-xs md:text-sm shadow-[0_0_20px_rgba(244,201,93,0.2)]"
          >
            <Save size={16} /> <span className="hidden xs:inline">Publish</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Sidebar: Structure & Media (Visible only on LG screens) */}
        <aside className="hidden lg:flex w-80 border-r border-white/10 bg-black/20 flex-col overflow-y-auto custom-scrollbar p-8 space-y-10">
          <VisualAnchorSection />

          <div>
            <h4 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <List size={12} /> Neural Map
            </h4>
            <div className="space-y-3 relative">
              <div className="absolute left-[7px] top-1 bottom-1 w-[1px] bg-white/5" />
              {toc.length > 0 ? toc.map((h, i) => (
                <div key={i} className="flex gap-2 items-center pl-4" style={{ marginLeft: `${(h.level - 1) * 8}px` }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                  <span className="text-[11px] text-gray-400 truncate">{h.text}</span>
                </div>
              )) : (
                <p className="text-[11px] text-gray-600 italic pl-2">No headings detected.</p>
              )}
            </div>
          </div>

          <CategorySection />
        </aside>

        {/* Center: The Editor / Preview Pane */}
        <main className={`flex-1 flex flex-col relative overflow-hidden transition-colors duration-300 ${editorTheme === 'dark' ? 'bg-[#050505]' : 'bg-gray-100'}`}>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'write' && (
              <motion.div
                key="write"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                {/* Editor Toolbar */}
                <div className="h-12 border-b border-white/10 bg-black/40 flex items-center px-4 gap-1 overflow-x-auto scrollbar-hide shrink-0">
                  <ToolbarBtn icon={Heading1} onClick={() => insertMarkdown('# ', '')} label="H1" />
                  <ToolbarBtn icon={Heading2} onClick={() => insertMarkdown('## ', '')} label="H2" />
                  <ToolbarBtn icon={Heading3} onClick={() => insertMarkdown('### ', '')} label="H3" />
                  <div className="h-6 w-px bg-white/10 mx-1 shrink-0" />
                  <ToolbarBtn icon={Bold} onClick={() => insertMarkdown('**', '**')} />
                  <ToolbarBtn icon={Italic} onClick={() => insertMarkdown('*', '*')} />
                  <ToolbarBtn icon={Code} onClick={() => insertMarkdown('`', '`')} />
                  <div className="h-6 w-px bg-white/10 mx-1 shrink-0" />
                  <ToolbarBtn icon={Quote} onClick={() => insertMarkdown('> ', '')} />
                  <ToolbarBtn icon={List} onClick={() => insertMarkdown('- ', '')} />
                  <ToolbarBtn icon={ImageIcon} onClick={() => insertMarkdown('![Image Alt Text](', ')')} />
                  <ToolbarBtn icon={LinkIcon} onClick={() => insertMarkdown('[', '](url)')} label="Link" />
                  <ToolbarBtn icon={Terminal} onClick={() => insertMarkdown('```\n', '\n```')} label="Code" />
                  <div className="h-6 w-px bg-white/10 mx-1 shrink-0" />
                  <ToolbarBtn icon={Sparkles} onClick={() => setShowAIPanel(!showAIPanel)} color={showAIPanel ? 'text-accent' : 'text-gray-400'} label="AI" />
                </div>

                {/* AI Assistant Panel */}
                <AnimatePresence>
                  {showAIPanel && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-gradient-to-r from-accent/10 via-purple-500/10 to-pink-500/10 border-b border-white/10 overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-accent font-bold">
                          <Sparkles size={14} /> AI Writing Assistant
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <AIToolBtn label="Generate Title" onClick={() => handleAITool('generate_title')} />
                          <AIToolBtn label="Generate Outline" onClick={() => handleAITool('generate_outline')} />
                          <AIToolBtn label="Expand Selection" onClick={() => handleAITool('expand')} />
                          <AIToolBtn label="Rewrite" onClick={() => handleAITool('rewrite')} />
                          <AIToolBtn label="Fix Grammar" onClick={() => handleAITool('grammar')} />
                          <AIToolBtn label="Make Shorter" onClick={() => handleAITool('shorten')} />
                          <AIToolBtn label="SEO Optimize" onClick={() => handleAITool('seo')} />
                          <AIToolBtn label="Add Emoji" onClick={() => handleAITool('emoji')} />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ask AI anything about your content..."
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAITool('custom', aiPrompt)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-500 outline-none focus:border-accent"
                          />
                          <button
                            onClick={() => handleAITool('custom', aiPrompt)}
                            disabled={aiLoading || !aiPrompt}
                            className="px-4 py-2 bg-accent text-void rounded-lg text-xs font-bold hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            Generate
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`flex-1 relative p-6 md:p-12 overflow-y-auto custom-scrollbar transition-colors ${editorTheme === 'light' ? 'bg-white' : ''}`}>
                  <div className="max-w-4xl mx-auto space-y-6">
                    <input
                      type="text"
                      placeholder="Signal Title..."
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full bg-transparent ${titleFontMap[fontSize]} font-display font-bold outline-none selection:bg-accent/30 transition-all ${editorTheme === 'dark' ? 'text-white placeholder:text-white/10' : 'text-gray-900 placeholder:text-gray-300'}`}
                    />

                    <textarea
                      ref={textareaRef}
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Initialize content transmission... Use Markdown for sophisticated formatting."
                      className={`w-full min-h-[60vh] bg-transparent ${fontSizeMap[fontSize]} font-serif outline-none resize-none leading-relaxed selection:bg-accent/30 transition-all ${editorTheme === 'dark' ? 'text-gray-300 placeholder:text-white/10' : 'text-gray-700 placeholder:text-gray-400'}`}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="relative aspect-video rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12 border border-white/10 shadow-2xl">
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="preview" />
                    <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 right-6">
                      <span className="bg-accent text-void px-2 py-0.5 md:px-3 md:py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 md:mb-4 inline-block">{formData.category}</span>
                      <h1 className="text-2xl md:text-6xl font-display font-bold text-white drop-shadow-lg leading-tight">{formData.title || 'Untitled Transmission'}</h1>
                    </div>
                  </div>
                  <MarkdownRenderer content={formData.content || ''} />
                </div>
              </motion.div>
            )}

            {activeTab === 'metadata' && (
              <motion.div
                key="meta"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar"
              >
                <div className="max-w-2xl mx-auto space-y-12">
                  {/* Mobile-only sections that are normally in the sidebar */}
                  <div className="lg:hidden space-y-8">
                    <VisualAnchorSection />
                    <CategorySection />
                    <div className="h-px bg-white/10" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                      <Type size={20} className="text-accent" /> Editorial Metadata
                    </h3>
                    <div className="space-y-6 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl">
                      <MetaInput label="Custom Slug" placeholder="the-theology-of-automation" value={formData.slug} onChange={val => setFormData({ ...formData, slug: val })} />
                      <MetaTextArea label="Excerpt (Summary)" placeholder="A brief hook for the list view..." value={formData.excerpt} onChange={val => setFormData({ ...formData, excerpt: val })} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                      <Globe size={20} className="text-accent" /> Signal Optimization (SEO)
                    </h3>
                    <div className="space-y-6 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl">
                      <MetaTextArea label="Meta Description" placeholder="Brief description for search engines..." value={formData.metaDescription} onChange={val => setFormData({ ...formData, metaDescription: val })} />

                      <div>
                        <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Transmission Tags</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.tags?.map(t => (
                            <span key={t} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
                              {t} <button onClick={() => setFormData({ ...formData, tags: formData.tags?.filter(tag => tag !== t) })} className="hover:text-white"><X size={12} /></button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Type tag and press Enter..."
                          onKeyDown={handleTagAdd}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-gray-300 outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-red-400 font-bold text-sm">Destructive Action</h4>
                      <p className="text-red-500/60 text-xs">Purge this draft entirely from local storage.</p>
                    </div>
                    <button onClick={onCancel} className="w-full sm:w-auto px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-bold">
                      <Trash2 size={14} /> Discard Draft
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
};

const ToolbarBtn = ({ icon: Icon, onClick, color = "text-gray-400", label }: any) => (
  <button
    onClick={onClick}
    className={`p-2 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 group shrink-0 ${color}`}
    title={label}
  >
    <Icon size={18} className="group-hover:scale-110 transition-transform md:w-4 md:h-4" />
    {label && <span className="text-[10px] font-bold uppercase hidden sm:inline">{label}</span>}
  </button>
);

const MetaInput = ({ label, placeholder, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-200 outline-none focus:border-accent/50 transition-all"
    />
  </div>
);

const MetaTextArea = ({ label, placeholder, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-200 outline-none focus:border-accent/50 transition-all resize-none"
    />
  </div>
);
