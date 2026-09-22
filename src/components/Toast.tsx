import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface Props {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<Props> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-6 right-8 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => onRemoveToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  };

  const borderColors = {
    success: 'border-emerald-200 bg-white/95',
    error: 'border-rose-200 bg-white/95',
    info: 'border-blue-200 bg-white/95'
  };

  return (
    <div className={`pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 flex items-start justify-between gap-3 ${borderColors[toast.type]}`}>
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <div>
          <h4 className="text-xs font-bold text-slate-800 leading-tight">{toast.title}</h4>
          {toast.description && (
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{toast.description}</p>
          )}
        </div>
      </div>
      <button 
        onClick={onRemove}
        className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
