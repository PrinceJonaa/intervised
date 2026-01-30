

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Loader2, Mail, MapPin, Clock, Globe, ArrowRight, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ToastSystem';
import { submitContactMessage } from '../lib/supabase/contactService';

const ContactInput = ({ label, value, onChange, placeholder, type = "text", disabled }: any) => {
  const id = React.useId();
  return (
    <div className="group">
      <label htmlFor={id} className="block text-[10px] font-mono text-gray-500 mb-2 uppercase tracking-widest group-focus-within:text-accent transition-colors">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all text-sm text-white placeholder-gray-700 hover:border-white/20"
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

const SelectButton = ({ active, onClick, label, icon: Icon }: any) => (
  <button 
    type="button"
    role="radio"
    aria-checked={active}
    onClick={onClick}
    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${active ? 'bg-white text-black border-white' : 'bg-black/20 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}
  >
    {Icon && <Icon size={14} />}
    {label}
  </button>
);

export const ContactSection = () => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    category: 'Creative Services',
    budget: 'Growth',
    timeline: 'Flexible',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast('Identity and transmission content required.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Supabase
      await submitContactMessage({
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        category: formData.category,
        budget: formData.budget,
        timeline: formData.timeline,
        message: formData.message,
      });

      setIsSuccess(true);
      addToast('Secure transmission received.', 'success');
      setFormData({ name: '', email: '', company: '', category: 'Creative Services', budget: 'Growth', timeline: 'Flexible', message: '' });
    } catch (error) {
      console.error('Contact form submission failed:', error);
      addToast('Transmission failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-28 pb-32">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: System Status / Info */}
        <div className="lg:col-span-2 space-y-8">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">INITIATE<br /><span className="text-gray-500">UPLINK</span></h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Intervised operates at the intersection of vision and execution. 
                Whether you need a full ministry overhaul or a single creative campaign, 
                our channel is open.
              </p>
           </motion.div>

           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-accent border border-white/10 group-hover:border-accent/50 transition-colors">
                       <Mail size={18} />
                    </div>
                    <div>
                       <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Direct Frequency</div>
                       <div className="text-white font-bold">jona@intervised.com</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-gray-400 border border-white/10">
                       <MapPin size={18} />
                    </div>
                    <div>
                       <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Base of Operations</div>
                       <div className="text-white font-bold">New York City, NY</div>
                    </div>
                 </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/20 to-transparent border border-white/5">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wide">System Online</span>
                 </div>
                 <p className="text-xs text-gray-400">Response time currently averaging &lt; 4 hours for priority inquiries.</p>
              </div>
           </motion.div>
        </div>

        {/* RIGHT COLUMN: The Form */}
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-3xl p-1 border border-white/10 shadow-2xl relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
             
             <div className="bg-[#001428]/80 backdrop-blur-xl rounded-[20px] p-6 sm:p-8 h-full relative z-10">
                {isSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} 
                      className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
                    >
                      <CheckCircle2 size={48} />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">TRANSMISSION LOGGED</h3>
                    <p className="text-gray-400 mb-8 max-w-xs">Your signal has been encrypted and queued for review. Stand by for response.</p>
                    <button 
                      onClick={() => setIsSuccess(false)}
                      className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors border border-white/10"
                    >
                      SEND ANOTHER
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Identity Section */}
                    <div className="space-y-4">
                       <h4 className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2"><Globe size={14}/> Identity Protocol</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ContactInput label="Name" placeholder="Enter full name" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} disabled={isSubmitting} />
                          <ContactInput label="Email" placeholder="name@domain.com" type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} disabled={isSubmitting} />
                       </div>
                       <ContactInput label="Organization (Optional)" placeholder="Church, Brand, or Collective" value={formData.company} onChange={(e: any) => setFormData({...formData, company: e.target.value})} disabled={isSubmitting} />
                    </div>

                    {/* Parameters Section */}
                    <div className="space-y-4">
                       <h4 className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2"><DollarSign size={14}/> Parameters</h4>
                       
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Budget Parameters">
                          {['Seed', 'Growth', 'Scale', 'Enterprise'].map((b) => (
                             <SelectButton 
                                key={b} 
                                label={b} 
                                active={formData.budget === b} 
                                onClick={() => setFormData({...formData, budget: b})} 
                             />
                          ))}
                       </div>
                       
                       <div className="grid grid-cols-2 gap-2">
                           <div className="relative">
                              <select 
                                aria-label="Timeline"
                                value={formData.timeline}
                                onChange={e => setFormData({...formData, timeline: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 appearance-none text-sm focus:border-accent/50 outline-none text-gray-300"
                              >
                                 <option>Flexible Timeline</option>
                                 <option>ASAP (Rush)</option>
                                 <option>Within 1 Month</option>
                                 <option>Q3/Q4 Planning</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><Calendar size={14} /></div>
                           </div>
                           <div className="relative">
                              <select 
                                aria-label="Category"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 appearance-none text-sm focus:border-accent/50 outline-none text-gray-300"
                              >
                                 <option>Creative Services</option>
                                 <option>Tech Consulting</option>
                                 <option>Ministry Solutions</option>
                                 <option>Other Inquiry</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ArrowRight size={14} /></div>
                           </div>
                       </div>
                    </div>

                    {/* Message Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> The Signal</h4>
                        <textarea 
                          value={formData.message}
                          onChange={e => setFormData({...formData, message: e.target.value})}
                          className="w-full bg-black/20 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent/50 transition-colors h-32 resize-none text-sm text-white placeholder-gray-700" 
                          placeholder="Briefing on your vision..." 
                          disabled={isSubmitting}
                        />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-accent hover:scale-[1.01] transition-all text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin" /> Encrypting...</>
                      ) : (
                        <><Send size={16} /> Transmit Signal</>
                      )}
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                    </button>

                  </form>
                )}
             </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};