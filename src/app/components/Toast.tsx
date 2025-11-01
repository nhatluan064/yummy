"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

type ToastContextType = {
  showToast: (message: string, durationMs?: number, type?: "success" | "error") => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, durationMs = 3500, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Portal container - Stack toasts vertically */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t, index) => (
          <div
            key={t.id}
            style={{ 
              animation: 'slideDown 0.3s ease-out',
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'backwards'
            }}
            className={`pointer-events-auto max-w-[90vw] w-full sm:w-[450px] px-6 py-5 rounded-2xl shadow-2xl text-white text-base font-semibold ${
              t.type === "success" 
                ? "bg-gradient-to-br from-green-500 to-green-600" 
                : "bg-gradient-to-br from-red-500 to-red-600"
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                {t.type === "success" ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              {/* Message */}
              <div className="flex-1 text-left">
                {t.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// Small CSS animation via Tailwind utility (fallback if not defined)
// Add a minimal keyframe if needed via global CSS. We rely on existing styles.
