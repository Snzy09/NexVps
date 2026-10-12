import React, { createContext, useContext, useState, useCallback } from 'react';
import SwipeToast from '../components/SwipeToast';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

export interface ToastOptions {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: 'success' | 'info' | 'warning' | 'error';
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = options.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { ...options, id }]);

    // Emit event so notification dropdown on navbar logs this update in real time
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('nexvps:notification', {
            detail: {
              title: typeof options.title === 'string' ? options.title : 'Notifikasi Akun',
              desc: typeof options.description === 'string' ? options.description : '',
              type: options.type || 'info',
            },
          })
        );
      }
    } catch {}
  }, []);

  const success = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'success' });
  }, [showToast]);

  const error = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'error' });
  }, [showToast]);

  const warning = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'warning' });
  }, [showToast]);

  const info = useCallback((title: string, description?: string) => {
    showToast({ title, description, type: 'info' });
  }, [showToast]);

  // Intercept window.alert globally so any popup uses SwipeToast automatically
  React.useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message?: any) => {
      const msgStr = typeof message === 'string' ? message : String(message ?? '');
      const lower = msgStr.toLowerCase();
      const isError = lower.includes('gagal') || lower.includes('error') || lower.includes('failed');
      const isSuccess = lower.includes('berhasil') || lower.includes('sukses') || lower.includes('success');
      const isWarning = lower.includes('peringatan') || lower.includes('warning') || lower.includes('perhatian') || lower.includes('silakan');

      showToast({
        title: msgStr,
        type: isError ? 'error' : isSuccess ? 'success' : isWarning ? 'warning' : 'info',
        duration: 4000
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  React.useEffect(() => {
    (window as any).__showToast = showToast;
    (window as any).__toast = { success, error, warning, info };
  }, [showToast, success, error, warning, info]);

  const getToastIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  const getFuseColor = (type?: string) => {
    switch (type) {
      case 'success':
        return '#10b981'; // emerald
      case 'error':
        return '#f43f5e'; // rose
      case 'warning':
        return '#f59e0b'; // amber
      case 'info':
      default:
        return '#06b6d4'; // cyan
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast container (stacked at bottom right) */}
      <div 
        className="fixed bottom-6 right-6 z-[999999] flex flex-col items-end gap-2.5 pointer-events-none"
        style={{ maxWidth: 'calc(100vw - 32px)' }}
      >
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <SwipeToast
              inline
              open
              title={toast.title}
              description={toast.description}
              icon={getToastIcon(toast.type)}
              actionLabel={toast.actionLabel}
              onAction={toast.onAction}
              onClose={() => removeToast(toast.id)}
              duration={toast.duration || 3500}
              background="#0b101d"
              color="#f8fafc"
              fuseColor={getFuseColor(toast.type)}
              width={360}
              radius={16}
              closeButton={true}
              pauseOnHover={true}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
