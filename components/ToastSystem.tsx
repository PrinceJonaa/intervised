import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const TOAST_DURATION = 5000;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="text-green-400" />;
      case 'error': return <AlertCircle size={18} className="text-red-400" />;
      default: return <Info size={18} className="text-accent" />;
    }
  };

  const getRole = (type: ToastType) => {
    return type === 'error' ? 'alert' : 'status';
  };

  const getAriaLive = (type: ToastType): "assertive" | "polite" | "off" => {
    return type === 'error' ? 'assertive' : 'polite';
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        className="fixed top-24 right-4 sm:right-8 z-[100] flex flex-col gap-3 pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              layout
              role={getRole(toast.type)}
              aria-live={getAriaLive(toast.type)}
              className="pointer-events-auto min-w-[300px] max-w-sm glass-panel border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl bg-[#001428]/90 relative overflow-hidden"
            >
              <div className="p-4 flex items-start gap-3">
                <div className="mt-0.5">{getIcon(toast.type)}</div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">
                    {toast.type === 'success' ? 'System Success' : toast.type === 'error' ? 'System Error' : 'Notification'}
                  </h4>
                  <p className="text-sm text-white leading-tight">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-500 hover:text-white transition-colors"
                  aria-label="Close notification"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>

              {/* Timer Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: TOAST_DURATION / 1000, ease: "linear" }}
                  className={`h-full ${
                    toast.type === 'success' ? 'bg-green-400/50' :
                    toast.type === 'error' ? 'bg-red-400/50' :
                    'bg-accent/50'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
