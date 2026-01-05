import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ServiceItem } from '../types';
import { SERVICES_DATA } from '../constants';

export const BookingSection = () => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <section className="min-h-screen pt-24 pb-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
      <div className="flex-1">
        <h2 className="text-4xl font-display font-bold mb-8">SELECT SERVICE</h2>
        <div className="space-y-3 h-[50vh] lg:h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {SERVICES_DATA.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`p-6 rounded-2xl cursor-pointer transition-all border ${
                selectedService?.id === service.id 
                  ? 'bg-white text-black border-white scale-[1.02]' 
                  : 'glass-panel border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{service.title}</h3>
                <span className={`font-mono text-sm px-2 py-1 rounded ${selectedService?.id === service.id ? 'bg-black/10' : 'bg-white/10'}`}>
                  ${service.price}
                </span>
              </div>
              <div className="flex justify-between mt-2 text-sm opacity-70">
                <span>{service.category}</span>
                <span>{service.durationMinutes} min</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 lg:max-w-md">
        <h2 className="text-4xl font-display font-bold mb-8">AVAILABILITY</h2>
        <div className="glass-panel p-8 rounded-3xl sticky top-24">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-bold">October 2023</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/10 rounded-full"><ChevronRight className="rotate-180" size={20} /></button>
              <button className="p-2 hover:bg-white/10 rounded-full"><ChevronRight size={20} /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-6 text-center text-sm font-mono text-gray-500">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {[...Array(2)].map((_, i) => <div key={`empty-${i}`} />)}
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square rounded-full flex items-center justify-center text-sm transition-all ${
                  selectedDate === day 
                    ? 'bg-accent text-white shadow-lg shadow-purple-500/30' 
                    : 'hover:bg-white/10 text-gray-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Total</span>
              <span className="text-2xl font-bold font-mono">
                ${selectedService ? selectedService.price : '0.00'}
              </span>
            </div>
            <button 
              disabled={!selectedService || !selectedDate}
              className="w-full py-4 bg-white text-black font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};