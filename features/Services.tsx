

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Camera, Cpu, Video, Hash, Mic, Filter, ArrowDownCircle, CheckCircle2, Clock, HelpCircle, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { ServiceItem, ServiceOption, Page } from '../types';
import { ServiceSkeleton, SkeletonPulse } from '../components/Loading';
import { getServices, getFAQItems, getProjects, type Service, type FAQItem, type Project } from '../lib/supabase/referenceService';

// Modular Components - Updated path
import { BookingConsole } from '../components/BookingConsole';

interface ServicesSectionProps {
  onCategoryChange: (category: string | null) => void;
  setPage?: (page: Page) => void;
}

const cardVariants: Variants = {
  idle: { scale: 1, borderColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" },
  hover: { scale: 1.02, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.05)" },
  active: { scale: 1.05, borderColor: "#F4C95D", backgroundColor: "rgba(244, 201, 93, 0.05)", boxShadow: "0 0 30px rgba(244, 201, 93, 0.2), inset 0 0 20px rgba(244, 201, 93, 0.05)", transition: { type: "spring", stiffness: 300, damping: 20 } }
};

const FAQCard = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors touch-manipulation"><span className="font-bold text-gray-200 text-sm sm:text-base">{question}</span><ChevronDown className={`text-gray-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} size={18} /></button>
      <AnimatePresence>{isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="p-4 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5">{answer}</div></motion.div>}</AnimatePresence>
    </div>
  );
};

export const ServicesSection = ({ onCategoryChange, setPage }: ServicesSectionProps) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const bookingRef = useRef<HTMLDivElement>(null);

  // Data from Supabase
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, faqData, projectsData] = await Promise.all([
          getServices(),
          getFAQItems(),
          getProjects()
        ]);

        // Map DB Service to Frontend ServiceItem
        const mappedServices: ServiceItem[] = servicesData.map(s => ({
          id: s.id,
          title: s.name,
          description: s.description || '',
          price: s.base_price,
          displayPrice: s.price_display,
          durationMinutes: s.duration || 60,
          category: s.category,
          features: [], // Default empty features if not in DB
          options: s.options?.map((opt: any) => ({
            id: opt.id || opt.name, // Fallback if id missing
            label: opt.name || opt.label,
            price: opt.price
          })) || []
        }));

        setServices(mappedServices);
        setFaqItems(faqData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load services data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = Array.from(new Set(services.map(s => s.category)));
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const displayedCategories = activeFilter === 'All' ? categories : [activeFilter];

  // Find related project based on selected service's category
  const relatedProject = selectedService
    ? projects.find(p => p.category.toLowerCase().includes(selectedService.category.toLowerCase()) || selectedService.category.toLowerCase().includes(p.category.toLowerCase()))
    : null;

  useEffect(() => { onCategoryChange(selectedService ? selectedService.category : null); }, [selectedService, onCategoryChange]);
  useEffect(() => { const timer = setTimeout(() => setIsLoading(false), 800); return () => clearTimeout(timer); }, []);

  const scrollToBooking = () => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const getIcon = (category: string) => { switch (category) { case 'Creative': return <Camera className="text-accent" />; case 'Tech': return <Cpu className="text-white" />; case 'Content': return <Video className="text-accent" />; case 'Growth': return <Hash className="text-white" />; case 'Ministry': return <Mic className="text-accent" />; default: return <Cpu />; } };

  return (
    <section className="min-h-screen pt-20 sm:pt-24 pb-32 px-4 sm:px-6 max-w-[1400px] mx-auto flex flex-col gap-12 lg:gap-24 relative">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Catalog */}
        <div className="flex-1 space-y-8 sm:space-y-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">SERVICES</h2>
            <p className="text-gray-400 max-w-xl text-base sm:text-lg mb-8">Select a service protocol to initialize booking sequence.</p>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <button onClick={() => setActiveFilter('All')} className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-mono uppercase tracking-wider transition-all border flex items-center gap-2 ${activeFilter === 'All' ? 'bg-accent text-void border-accent font-bold' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}><Filter size={14} /> All Protocols</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveFilter(cat)} className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-mono uppercase tracking-wider transition-all border ${activeFilter === cat ? 'bg-accent/20 text-accent border-accent' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}>{cat}</button>
              ))}
            </div>
          </motion.div>
          <div className="space-y-12">
            {isLoading ? (
              <div className="space-y-12">{[1, 2, 3].map(i => (<div key={i}><div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-2"><SkeletonPulse className="w-6 h-6 rounded-full" /><SkeletonPulse className="h-6 w-32" /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map(j => <ServiceSkeleton key={j} />)}</div></div>))}</div>
            ) : services.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 px-8 rounded-3xl border border-white/10 bg-white/5"
              >
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-bold text-white mb-2">Services Coming Soon</h3>
                <p className="text-gray-400 max-w-md mx-auto">We're preparing our service catalog. Check back soon for our full range of offerings.</p>
              </motion.div>
            ) : (
              displayedCategories.map((category, idx) => (
                <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2 sticky top-16 bg-void/90 z-20 backdrop-blur-md lg:static lg:bg-transparent">{getIcon(category)}<h3 className="text-lg sm:text-xl font-bold font-display uppercase tracking-wider text-gray-200">{category}</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {services.filter(s => s.category === category).map(service => (
                      <motion.div key={service.id} variants={cardVariants} initial="idle" whileHover="hover" animate={selectedService?.id === service.id ? "active" : "idle"} layoutId={`card-${service.id}`} onClick={() => { setSelectedService(service); setIsBooked(false); setSelectedDate(null); }} className="relative p-5 sm:p-6 rounded-2xl cursor-pointer overflow-hidden border touch-manipulation">
                        {selectedService?.id === service.id && <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/10 to-transparent pointer-events-none" initial={{ y: "-100%" }} animate={{ y: "100%" }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />}
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-2 gap-4"><h4 className={`font-bold text-base sm:text-lg leading-tight ${selectedService?.id === service.id ? 'text-white' : 'text-gray-200'}`}>{service.title}</h4><span className={`font-mono text-xs px-2 py-1 rounded-full whitespace-nowrap ${selectedService?.id === service.id ? 'bg-black/20 text-accent' : 'bg-white/10'}`}>{service.displayPrice || `$${service.price}`}</span></div>
                          <p className={`text-sm mb-4 line-clamp-2 ${selectedService?.id === service.id ? 'text-gray-300' : 'text-gray-400'}`}>{service.description}</p>
                          <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider ${selectedService?.id === service.id ? 'text-accent' : 'text-gray-400'}`}><Clock size={12} />{service.duration || 60} MIN</div>
                        </div>
                        {selectedService?.id === service.id && <div className="absolute bottom-4 right-4 text-accent"><CheckCircle2 size={20} /></div>}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Booking Console & Contextual Intelligence */}
        <div ref={bookingRef} className="w-full lg:w-auto flex flex-col gap-6">
          <BookingConsole
            selectedService={selectedService} selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            isBooked={isBooked} setIsBooked={setIsBooked} days={days} setPage={setPage}
          />

          {/* Contextual Case Study - Only shows when a service is selected */}
          <AnimatePresence>
            {selectedService && relatedProject && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden group hidden lg:block"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles size={100} /></div>
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest mb-2 block">Relevant Transmission</span>
                <h4 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">{relatedProject.title}</h4>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{relatedProject.description}</p>
                <div className="text-xs text-gray-500 flex items-center gap-2 font-mono">
                  <CheckCircle2 size={12} className="text-green-500" />
                  Outcome: {relatedProject.outcome}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedService && !isBooked && (
          <motion.button
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            onClick={scrollToBooking}
            className="fixed bottom-28 right-4 z-40 bg-accent text-void font-bold p-4 rounded-full shadow-2xl lg:hidden flex items-center gap-2 border-2 border-white/20"
          >
            <span className="text-xs font-bold uppercase">Configure</span><ArrowDownCircle size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto w-full mt-12">
        <div className="flex items-center gap-2 mb-8 justify-center"><HelpCircle className="text-accent" /><h3 className="text-2xl sm:text-3xl font-display font-bold">FREQUENTLY ASKED</h3></div>
        <div className="space-y-4">{faqItems.map((faq, i) => <FAQCard key={faq.id} question={faq.question} answer={faq.answer} />)}</div>
      </div>
    </section>
  );
};