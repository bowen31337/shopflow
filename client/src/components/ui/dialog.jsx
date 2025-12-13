import React from 'react';

// Dialog component
export function Dialog({ children, className = '', ...props }) {
  return (
    <div className={`relative z-50 ${className}`} {...props}>
      {children}
    </div>
  );
}

// Dialog Trigger
export function DialogTrigger({ children, onClick, ...props }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

// Dialog Content
export function DialogContent({ children, className = '', onClose, ...props }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg animate-in fade-in-90 slide-in-from-bottom-2 sm:zoom-in-90 sm:slide-in-from-bottom-1 ${className}`}
        {...props}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 hover:bg-gray-100"
          aria-label="Close"
        >
          <span className="text-gray-500 text-xl">×</span>
        </button>
      </div>
    </div>
  );
}

// Dialog Header
export function DialogHeader({ children, className = '' }) {
  return (
    <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>
      {children}
    </div>
  );
}

// Dialog Title
export function DialogTitle({ children, className = '' }) {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
}

// Dialog Description
export function DialogDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  );
}

// Dialog Footer
export function DialogFooter({ children, className = '' }) {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>
      {children}
    </div>
  );
}