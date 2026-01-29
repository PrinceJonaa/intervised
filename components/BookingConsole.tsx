

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Cpu, ChevronRight, CheckCircle2, Zap, User, Clock, Settings2, FileText, Copy, Mail, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import { ServiceItem, ServiceOption, Page } from '../types';
import { useToast } from './ToastSystem';
import { submitBooking, type BookingData } from '../lib/supabase/bookingService';

interface BookingConsoleProps {
  selectedService: ServiceItem | null;
  selectedDate: number | null;
  setSelectedDate: (d: number | null) => void;
  isBooked: boolean;
  setIsBooked: (b: boolean) => void;
  days: number[];
  setPage?: (p: Page) => void;
}

export const BookingConsole: React.FC<BookingConsoleProps> = ({
  selectedService, selectedDate, setSelectedDate, isBooked, setIsBooked, days, setPage
}) => {
  const { addToast } = useToast();
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  // Configuration States
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [durationMultiplier, setDurationMultiplier] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [projectContext, setProjectContext] = useState('');

  // Computed States
  const [totalPrice, setTotalPrice] = useState(0);

  // Submit booking to Supabase
  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedDate || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const bookingData: BookingData = {
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        provider: selectedProvider || undefined,
        durationMinutes: selectedService.durationMinutes * durationMultiplier,
        selectedOptions: selectedOptions,
        projectContext: projectContext || undefined,
        selectedDate: selectedDate,
        totalPrice: totalPrice,
      };

      const booking = await submitBooking(bookingData);
      setBookingReference(booking.reference_number || null);
      setIsBooked(true);
      addToast('Configuration transmitted successfully.', 'success');
    } catch (error) {
      console.error('Booking submission failed:', error);
      addToast('Transmission failed. Please try again.', 'error');
      setHoldProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset local configuration states when service ID changes
  useEffect(() => {
    if (selectedService) {
      setSelectedProvider(selectedService.providers && selectedService.providers.length > 0 ? selectedService.providers[0] : null);
      setDurationMultiplier(1);
      setSelectedOptions([]);
      setProjectContext('');
      setBookingReference(null);
      // Note: isBooked and selectedDate are managed by parent component (Services.tsx) and reset on click there.
    }
  }, [selectedService ? selectedService.id : 'none']);

  // Calculate Price
  useEffect(() => {
    if (!selectedService) {
      setTotalPrice(0);
      return;
    }

    let base = selectedService.price;

    // Apply Options
    const optionsTotal = selectedOptions.reduce((acc, optId) => {
      const opt = selectedService.options?.find(o => o.id === optId);
      return acc + (opt ? opt.price : 0);
    }, 0);

    // Apply Duration Multiplier (Only if hourly, or assume options are flat fee)
    let timeCalculatedPrice = selectedService.hourly
      ? (base * durationMultiplier)
      : base;

    setTotalPrice(timeCalculatedPrice + optionsTotal);

  }, [selectedService, durationMultiplier, selectedOptions]);

  const toggleOption = (optId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optId) ? prev.filter(id => id !== optId) : [...prev, optId]
    );
  };

  const startHold = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedDate || isBooked || isSubmitting) return;
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdIntervalRef.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current);
          // Trigger async booking submission
          handleBookingSubmit();
          return 100;
        }
        return prev + 3; // Slightly faster for better feel
      });
    }, 16);
  };

  const endHold = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (holdProgress < 100 && !isBooked && !isSubmitting) {
      clearInterval(holdIntervalRef.current);
      setHoldProgress(0);
    }
  };

  const generateQuoteString = () => {
    if (!selectedService) return '';
    const opts = selectedOptions.map(id => selectedService.options?.find(o => o.id === id)?.label).filter(Boolean).join(', ');
    return `Service: ${selectedService.title}
Provider: ${selectedProvider || 'Any'}
Duration: ${selectedService.durationMinutes * durationMultiplier}m
Options: ${opts || 'None'}
Date: ${selectedDate}th
Est. Total: $${totalPrice}
Mission: ${projectContext || 'N/A'}`;
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(generateQuoteString());
    addToast('Quote copied to system clipboard.', 'success');
  };

  const [showEmailModal, setShowEmailModal] = useState(false);

  const getEmailUrl = (provider: 'default' | 'gmail' | 'outlook' | 'yahoo') => {
    const subject = encodeURIComponent(`Booking Inquiry: ${selectedService?.title}`);
    const body = encodeURIComponent(`Hello Intervised Team,\n\nI'd like to proceed with the following configuration:\n\n${generateQuoteString()}\n\nAwaiting your transmission.\n`);
    const email = 'jona@intervised.com';

    switch (provider) {
      case 'gmail':
        return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
      case 'outlook':
        return `https://outlook.office.com/mail/deeplink/compose?to=${email}&subject=${subject}&body=${body}`;
      case 'yahoo':
        return `https://compose.mail.yahoo.com/?to=${email}&subject=${subject}&body=${body}`;
      default:
        return `mailto:${email}?subject=${subject}&body=${body}`;
    }
  };

  const handleOpenMail = (provider: 'default' | 'gmail' | 'outlook' | 'yahoo') => {
    window.open(getEmailUrl(provider), '_blank');
    setShowEmailModal(false);
  };

  const handleReset = () => {
    setIsBooked(false);
    setSelectedDate(null);
    setHoldProgress(0);
    setBookingReference(null);
  };

  return (
    <div className="w-full lg:w-[450px] xl:w-[500px] relative scroll-mt-24">
      <div className="lg:sticky lg:top-28">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-surface/50 overflow-hidden relative min-h-[500px] flex flex-col"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

          <div className="relative z-10 flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Settings2 className="text-accent" />
                <h3 className="font-display font-bold text-lg sm:text-xl">CONSOLE</h3>
              </div>
              {setPage && (
                <button onClick={() => setPage(Page.CHAT)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                  <MessageSquare size={14} /> Ask Intelligence
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!selectedService ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 text-gray-500 flex-1 flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full border border-dashed border-white/20 mx-auto flex items-center justify-center mb-4"><Cpu size={24} className="opacity-50" /></div>
                  <p>Select a service node from the catalog to configure parameters.</p>
                  <p className="font-mono text-xs text-accent/50 mt-4 tracking-widest animate-pulse">AWAITING INPUT STREAM...</p>
                </motion.div>
              ) : isBooked ? (
                // RECEIPT MODE
                <motion.div
                  key="receipt"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 mx-auto flex items-center justify-center mb-4 border border-green-500/50 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-1">PROTOCOL INITIATED</h3>
                    <p className="text-gray-400 text-sm">Your configuration has been logged.</p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-6 font-mono text-sm space-y-3 mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={handleCopyQuote} className="p-2 bg-black/50 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Copy Details" aria-label="Copy booking details"><Copy size={14} /></button>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                      <span className="text-gray-500 uppercase tracking-widest text-[10px]">Reference</span>
                      <span className="text-accent font-bold">{bookingReference || `#IV-${Date.now().toString().slice(-6)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Service</span>
                      <span className="text-white text-right truncate ml-4">{selectedService.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creative</span>
                      <span className="text-white text-right">{selectedProvider || 'Any'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scope</span>
                      <span className="text-white text-right">{selectedService.durationMinutes * durationMultiplier} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date</span>
                      <span className="text-white text-right text-accent">{selectedDate}th (Hold)</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between text-lg font-bold">
                      <span className="text-gray-300">Total Est.</span>
                      <span className="text-accent">${totalPrice}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-auto relative z-20">
                    <button onClick={() => setShowEmailModal(true)} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                      <Mail size={18} /> CONFIRM VIA EMAIL
                    </button>
                    <button onClick={handleReset} className="w-full py-3 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 text-sm">
                      <RefreshCw size={14} /> NEW CONFIGURATION
                    </button>
                  </div>

                  {/* Email Provider Modal */}
                  <AnimatePresence>
                    {showEmailModal && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-0 bg-black/95 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center"
                      >
                        <h4 className="text-xl font-bold font-display mb-2 text-white">Select Channel</h4>
                        <p className="text-gray-400 text-sm mb-6">Choose your preferred email client.</p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                          <button onClick={() => handleOpenMail('gmail')} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center gap-2">
                            <span className="text-lg">📧</span>
                            <span className="text-xs font-bold font-mono uppercase">Gmail</span>
                          </button>
                          <button onClick={() => handleOpenMail('outlook')} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center gap-2">
                            <span className="text-lg">📫</span>
                            <span className="text-xs font-bold font-mono uppercase">Outlook</span>
                          </button>
                          <button onClick={() => handleOpenMail('default')} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center gap-2 col-span-2">
                            <Mail size={20} className="text-accent" />
                            <span className="text-xs font-bold font-mono uppercase">System Default / iCloud</span>
                          </button>
                        </div>
                        <button onClick={() => setShowEmailModal(false)} className="mt-6 text-gray-500 hover:text-white text-sm">Cancel</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                // CONFIGURATION MODE
                <motion.div
                  key={selectedService.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col"
                >

                  {/* Service Info & Price */}
                  <div className="mb-6 border-b border-white/5 pb-4 shrink-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-mono text-accent uppercase tracking-widest mb-1 block">Active Protocol</motion.span>
                        <h4 className="text-xl sm:text-2xl font-bold font-display leading-tight mb-1">{selectedService.title}</h4>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <motion.div key={totalPrice} initial={{ scale: 1.2, color: "#fff" }} animate={{ scale: 1, color: "#F4C95D" }} className="text-2xl sm:text-3xl font-mono font-bold text-accent">
                          ${totalPrice}
                        </motion.div>
                        <button onClick={handleCopyQuote} className="text-[10px] font-mono text-gray-500 hover:text-white flex items-center gap-1 uppercase tracking-widest transition-colors">
                          <Copy size={10} /> Copy Quote
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CONFIGURATION SECTION */}
                  <div className="space-y-6 mb-6 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">

                    {/* Providers */}
                    {selectedService.providers && selectedService.providers.length > 1 && (
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><User size={12} /> Lead Creative</label>
                        <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                          {selectedService.providers.map(p => (
                            <button
                              key={p}
                              onClick={() => setSelectedProvider(p)}
                              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${selectedProvider === p ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-gray-500 hover:text-white'}`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Duration Slider (Only if hourly or long duration) */}
                    {(selectedService.hourly || selectedService.durationMinutes >= 60) && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label htmlFor="duration-slider" className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12} /> Duration Scope</label>
                          <span className="text-xs font-mono text-accent">{selectedService.durationMinutes * durationMultiplier} MIN</span>
                        </div>
                        <div className="relative h-6 flex items-center">
                          <input
                            id="duration-slider"
                            type="range"
                            min="1"
                            max="8"
                            step="0.5"
                            value={durationMultiplier}
                            onChange={(e) => setDurationMultiplier(parseFloat(e.target.value))}
                            className="w-full accent-accent bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                          <span>Base ({selectedService.durationMinutes}m)</span>
                          <span>Full Day</span>
                        </div>
                      </div>
                    )}

                    {/* Add-on Options */}
                    {selectedService.options && selectedService.options.length > 0 && (
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Zap size={12} /> Enhanced Modules</label>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedService.options.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => toggleOption(opt.id)}
                              aria-pressed={selectedOptions.includes(opt.id)}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all text-sm ${selectedOptions.includes(opt.id) ? 'bg-accent/10 border-accent/50 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'}`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedOptions.includes(opt.id) ? 'bg-accent border-accent' : 'border-gray-500'}`}>
                                  {selectedOptions.includes(opt.id) && <CheckCircle2 size={12} className="text-black" />}
                                </div>
                                <span className="font-bold">{opt.label}</span>
                              </div>
                              <span className="font-mono text-xs opacity-70">{opt.price > 0 ? `+$${opt.price}` : `-$${Math.abs(opt.price)}`}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Project Context Form */}
                    <div className="space-y-3">
                      <label htmlFor="project-context" className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FileText size={12} /> Mission Context</label>
                      <textarea
                        id="project-context"
                        value={projectContext}
                        onChange={(e) => setProjectContext(e.target.value)}
                        placeholder="Briefly describe your specific needs or vision..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-accent/50 resize-none h-24"
                      />
                    </div>
                  </div>

                  {/* CALENDAR & CONFIRM */}
                  <div className="mb-6 bg-white/5 rounded-2xl p-4 border border-white/5 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-xs text-gray-300 uppercase tracking-widest">Select Target Date</h4>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-white/10 rounded" aria-hidden="true" tabIndex={-1}><ChevronRight className="rotate-180 w-4 h-4" /></button>
                        <button className="p-1 hover:bg-white/10 rounded" aria-hidden="true" tabIndex={-1}><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[9px] font-mono text-gray-600" aria-hidden="true"><div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div></div>
                    <div className="grid grid-cols-7 gap-1">
                      {[...Array(1)].map((_, i) => <div key={`empty-${i}`} />)}
                      {days.slice(0, 28).map((day) => (
                        <button
                          key={day}
                          onClick={() => !isBooked && setSelectedDate(day)}
                          disabled={isBooked}
                          aria-label={`Select day ${day}`}
                          aria-pressed={selectedDate === day}
                          className={`aspect-square rounded-md flex items-center justify-center text-xs transition-all relative overflow-hidden touch-manipulation ${selectedDate === day ? 'bg-accent text-void font-bold shadow-lg' : 'hover:bg-white/10 text-gray-400 hover:text-white'} ${isBooked ? 'opacity-50' : ''}`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-4 shrink-0">
                    <div className="relative touch-none">
                      <button
                        disabled={!selectedDate || isBooked || isSubmitting}
                        onMouseDown={startHold}
                        onMouseUp={endHold}
                        onMouseLeave={endHold}
                        onTouchStart={startHold}
                        onTouchEnd={endHold}
                        onKeyDown={(e) => {
                          if (e.repeat) return;
                          if (e.key === ' ' || e.key === 'Enter') startHold(e);
                        }}
                        onKeyUp={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') endHold(e);
                        }}
                        className={`relative w-full py-4 font-bold rounded-xl overflow-hidden transition-all select-none ${isBooked ? 'bg-green-500 text-black' : !selectedDate ? 'bg-white/10 text-gray-500 cursor-not-allowed' : isSubmitting ? 'bg-accent/50 text-black cursor-wait' : 'bg-white text-black active:scale-[0.98]'}`}
                      >
                        <div className="absolute inset-0 bg-accent z-0 transition-all duration-75 ease-linear" style={{ width: `${holdProgress}%` }} />
                        <div className="relative z-10 flex items-center justify-center gap-2">{isBooked ? <><CheckCircle2 size={18} /> REQUEST TRANSMITTED</> : isSubmitting ? <><RefreshCw size={18} className="animate-spin" /> TRANSMITTING...</> : selectedDate ? <><Zap size={18} className={holdProgress > 0 ? "fill-void" : ""} /> HOLD TO INITIATE</> : 'SELECT DATE TO PROCEED'}</div>
                      </button>
                      {selectedDate && !isBooked && !isSubmitting && (
                        <div
                          className="text-center mt-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest"
                          aria-live="polite"
                        >
                          <span className="sr-only">
                            {holdProgress > 0 ? 'ENCRYPTING...' : 'Hold to Confirm Configuration'}
                          </span>
                          <span aria-hidden="true">
                            {holdProgress > 0 ? `ENCRYPTING... ${holdProgress}%` : 'Hold to Confirm Configuration'}
                          </span>
                        </div>
                      )}
                      {isSubmitting && <div className="text-center mt-2 text-[10px] font-mono text-accent uppercase tracking-widest animate-pulse">SAVING TO DATABASE...</div>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};