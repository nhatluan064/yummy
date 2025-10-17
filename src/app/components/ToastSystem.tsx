"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  LogIn,
  LogOut,
  ArrowRight,
  Zap,
} from "lucide-react";

type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "login"
  | "logout"
  | "redirect"
  | "transition";

interface ToastConfig {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bgGradient: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  progressColor: string;
  spinning?: boolean;
}

const toastTypes: Record<ToastType, ToastConfig> = {
  success: {
    icon: CheckCircle,
    bgGradient: "from-emerald-500 to-teal-600",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    progressColor: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    bgGradient: "from-rose-500 to-pink-600",
    iconColor: "text-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    progressColor: "bg-rose-500",
  },
  warning: {
    icon: AlertCircle,
    bgGradient: "from-amber-500 to-orange-600",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    progressColor: "bg-amber-500",
  },
  info: {
    icon: Info,
    bgGradient: "from-blue-500 to-indigo-600",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    progressColor: "bg-blue-500",
  },
  loading: {
    icon: Loader2,
    bgGradient: "from-purple-500 to-violet-600",
    iconColor: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    progressColor: "bg-purple-500",
    spinning: true,
  },
  login: {
    icon: LogIn,
    bgGradient: "from-cyan-500 to-blue-600",
    iconColor: "text-cyan-500",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    progressColor: "bg-cyan-500",
  },
  logout: {
    icon: LogOut,
    bgGradient: "from-gray-500 to-slate-600",
    iconColor: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    progressColor: "bg-gray-500",
  },
  redirect: {
    icon: ArrowRight,
    bgGradient: "from-indigo-500 to-purple-600",
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    progressColor: "bg-indigo-500",
  },
  transition: {
    icon: Zap,
    bgGradient: "from-fuchsia-500 to-pink-600",
    iconColor: "text-fuchsia-500",
    bgColor: "bg-fuchsia-50",
    borderColor: "border-fuchsia-200",
    progressColor: "bg-fuchsia-500",
  },
};

interface ToastData {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
  createdAt: number;
}

interface ToastContextType {
  addToast: (
    type: ToastType,
    title: string,
    message: string,
    duration?: number
  ) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastContainer({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [nextId, setNextId] = useState(1);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message: string, duration = 4000) => {
      const id = nextId;
      setNextId((prev) => prev + 1);
      const newToast: ToastData = {
        id,
        type,
        title,
        message,
        duration,
        createdAt: Date.now(),
      };
      setToasts((prev) => [...prev, newToast]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [nextId, removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} removeToast={removeToast} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToastSystem() {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error("useToastSystem must be used within ToastContainer");
  return ctx;
}

interface ToastProps {
  toast: ToastData;
  removeToast: (id: number) => void;
}

function Toast({ toast, removeToast }: ToastProps) {
  const config = toastTypes[toast.type] || toastTypes.info;
  const Icon = config.icon;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.duration <= 0) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - toast.createdAt;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(remaining);
    }, 50);
    return () => clearInterval(interval);
  }, [toast]);

  return (
    <div
      className={`relative overflow-hidden bg-white ${config.borderColor} border rounded-lg shadow-lg backdrop-blur-sm transform transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl mb-3 w-full max-w-md`}
      style={{
        animation: "slideInRight 0.4s ease-out, fadeIn 0.4s ease-out",
      }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${config.bgGradient} opacity-5`}
      ></div>
      <div className="relative p-4 flex items-start gap-3">
        <div className={`flex-shrink-0 ${config.bgColor} p-2 rounded-full`}>
          <Icon
            className={`w-5 h-5 ${config.iconColor} ${
              config.spinning ? "animate-spin" : ""
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm mb-0.5">
            {toast.title}
          </h4>
          <p className="text-gray-600 text-xs leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div
            className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
