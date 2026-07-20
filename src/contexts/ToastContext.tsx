"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { ToastContainer } from "../components/ui/Toast";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  variant?: ToastVariant;
  title?: string;
  message?: string;
  duration?: number;
}

interface ToastOptions {
  duration?: number;
}

interface ToastContextType {
  (toast: Omit<ToastMessage, "id">): void;
  success: (title: string, message?: string, opts?: ToastOptions) => void;
  error: (title: string, message?: string, opts?: ToastOptions) => void;
  warning: (title: string, message?: string, opts?: ToastOptions) => void;
  info: (title: string, message?: string, opts?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(({ variant = "info", title, message, duration = 4000 }: Omit<ToastMessage, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, variant, title, message, duration }]);
    timers.current[id] = setTimeout(() => remove(id), duration);
  }, [remove]) as ToastContextType;

  toast.success = (title, message, opts) => toast({ variant: "success", title, message, ...opts });
  toast.error = (title, message, opts) => toast({ variant: "error", title, message, ...opts });
  toast.warning = (title, message, opts) => toast({ variant: "warning", title, message, ...opts });
  toast.info = (title, message, opts) => toast({ variant: "info", title, message, ...opts });

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>.");
  return ctx;
};
