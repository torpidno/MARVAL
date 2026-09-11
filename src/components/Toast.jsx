import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { UI_CONFIG } from '../constants/uiConstants';

const TOAST_VARIANTS = {
  success: { Icon: CheckCircle2, iconClass: 'text-emerald-400', accentClass: 'border-l-emerald-500' },
  error: { Icon: XCircle, iconClass: 'text-red-400', accentClass: 'border-l-red-500' },
  info: { Icon: Info, iconClass: 'text-amber-400', accentClass: 'border-l-amber-500' },
};

function ToastItem({ toast, onDismiss }) {
  const { Icon, iconClass, accentClass } = TOAST_VARIANTS[toast.type] || TOAST_VARIANTS.info;

  // Auto-dismiss after the configured duration.
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), UI_CONFIG.TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className={`flex animate-fade-in-up items-start gap-3 rounded-xl border border-l-[3px] border-zinc-700/70 bg-zinc-900 p-3.5 shadow-xl shadow-black/60 ${accentClass}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} />
      <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-zinc-100">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors duration-200 hover:bg-zinc-700 hover:text-zinc-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Fixed-position toast stack (P0-2 / P1-1 feedback surface).
 * Container is pointer-events-none so it never blocks the app;
 * individual toasts re-enable pointer events.
 */
export function ToastStack({ toasts = [], onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-20 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6 sm:top-24 sm:w-auto"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

export default ToastStack;
