"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastRecord = {
  id: number;
  variant: ToastVariant;
  message: string;
  leaving: boolean;
};

type ToastOptions = { duration?: number };

type ToastApi = {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { bg: string; iconColor: string; icon: React.ReactNode }> = {
  info: { bg: "bg-purple-600", iconColor: "text-purple-600", icon: <Info className="h-4 w-4" strokeWidth={2.5} /> },
  success: {
    bg: "bg-emerald-600",
    iconColor: "text-emerald-600",
    icon: <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />,
  },
  warning: {
    bg: "bg-orange-500",
    iconColor: "text-orange-500",
    icon: <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />,
  },
  error: { bg: "bg-red-600", iconColor: "text-red-600", icon: <XCircle className="h-4 w-4" strokeWidth={2.5} /> },
};

const DEFAULT_DURATION = 4000;
const EXIT_ANIMATION_MS = 200;

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: number) => void;
}) {
  const [entered, setEntered] = useState(false);
  const styles = VARIANT_STYLES[toast.variant];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const visible = entered && !toast.leaving;

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl py-3 pr-3 pl-3.5 shadow-lg transition-all duration-200 ease-out ${styles.bg} ${
        visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white ${styles.iconColor}`}>
        {styles.icon}
      </span>
      <p className="flex-1 text-sm font-semibold text-white">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const exitTimer = timers.current.get(id);
    if (exitTimer) clearTimeout(exitTimer);
    setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      timers.current.delete(id);
    }, EXIT_ANIMATION_MS);
    timers.current.set(id, removeTimer);
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string, options?: ToastOptions) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, variant, message, leaving: false }]);
      const duration = options?.duration ?? DEFAULT_DURATION;
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, options) => push("success", message, options),
      error: (message, options) => push("error", message, options),
      warning: (message, options) => push("warning", message, options),
      info: (message, options) => push("info", message, options),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-end gap-2 px-4 sm:right-4 sm:left-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
