import { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Toast Context
const ToastContext = createContext(null);

// Toast Types with styling
const toastStyles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    icon: '✓',
    iconBg: 'bg-emerald-100 text-emerald-600'
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: '✕',
    iconBg: 'bg-red-100 text-red-600'
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    icon: '⚠',
    iconBg: 'bg-amber-100 text-amber-600'
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ',
    iconBg: 'bg-blue-100 text-blue-600'
  }
};

// Individual Toast Component
function ToastItem({ toast, onClose }) {
  const style = toastStyles[toast.type] || toastStyles.info;

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${style.bg} animate-slide-in`}
      role="alert"
    >
      <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${style.iconBg}`}>
        {style.icon}
      </span>
      <div className="flex-1">
        {toast.title && (
          <p className={`font-semibold ${style.text}`}>{toast.title}</p>
        )}
        <p className={`text-sm ${style.text}`}>{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className={`flex-shrink-0 p-1 rounded hover:bg-black/5 transition ${style.text}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Toast Container
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration ?? 4000
    };
    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (message, options) => addToast(message, { ...options, type: 'success' }),
    error: (message, options) => addToast(message, { ...options, type: 'error' }),
    warning: (message, options) => addToast(message, { ...options, type: 'warning' }),
    info: (message, options) => addToast(message, { ...options, type: 'info' })
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Add keyframes for animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('#toast-styles')) {
  style.id = 'toast-styles';
  document.head.appendChild(style);
}

export default ToastProvider;

