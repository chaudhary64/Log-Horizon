"use client";

import { useEffect, useRef } from "react";
import styles from "./toast.module.css";
import { ToastMessage } from "@/contexts/ToastContext";

const icons = {
  success: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

export const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const { id, variant = "info", title, message, duration = 4000 } = toast;
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    el.getBoundingClientRect();
    el.style.transition = `width ${duration}ms linear`;
    el.style.width = "0%";
  }, [duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`${styles.toastWrapper} ${styles[variant]}`}
    >
      <div className={styles.icon}>
        {icons[variant]}
      </div>

      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {message && <p className={styles.message}>{message}</p>}
      </div>

      <button
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
        className={styles.closeButton}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        ref={progressRef}
        style={{ width: "100%" }}
        className={styles.progress}
      />
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  if (!toasts.length) return null;

  return (
    <div aria-label="Notifications" className={styles.toastContainer}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};
