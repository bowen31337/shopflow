import { useState, createContext, useContext, useCallback } from 'react';

// Confirm Modal Context
const ConfirmContext = createContext(null);

// Modal Component
function ConfirmModalComponent({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type }) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      icon: '⚠️',
      iconBg: 'bg-red-100'
    },
    warning: {
      button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      icon: '⚠️',
      iconBg: 'bg-amber-100'
    },
    info: {
      button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
      icon: '❓',
      iconBg: 'bg-emerald-100'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed inset-0 z-[10001] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-modal-in">
          <div className="p-6">
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${style.iconBg} mb-4`}>
              <span className="text-2xl">{style.icon}</span>
            </div>
            
            {/* Content */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title || 'Confirm Action'}
              </h3>
              <p className="text-gray-600">
                {message}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {cancelText || 'Cancel'}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.button}`}
            >
              {confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirm Provider
export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        message,
        title: options.title || 'Confirm Action',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'info',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  }, []);

  const closeModal = useCallback(() => {
    modalState.onCancel();
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, [modalState]);

  const handleConfirm = useCallback(() => {
    modalState.onConfirm();
  }, [modalState]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModalComponent
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
      />
    </ConfirmContext.Provider>
  );
}

// Hook to use confirm
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

// Add keyframes for animation
const style = document.createElement('style');
style.textContent = `
  @keyframes modal-in {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  .animate-modal-in {
    animation: modal-in 0.2s ease-out;
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('#modal-styles')) {
  style.id = 'modal-styles';
  document.head.appendChild(style);
}

export default ConfirmProvider;

