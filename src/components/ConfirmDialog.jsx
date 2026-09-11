import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle, CheckSquare } from 'lucide-react';

/**
 * In-app confirmation dialog (P1-1) — replaces native window.confirm.
 * Solid Material-style dialog panel, backdrop click + Escape to cancel,
 * focus lands on the cancel button, focus restored on close.
 */
export function ConfirmDialog({
  open,
  title = 'Are you sure?',
  body = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger', // 'danger' | 'info'
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const bodyId = useId();
  const cancelButtonRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancelRef.current?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  const isDanger = tone === 'danger';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop — click to cancel */}
      <div
        aria-hidden="true"
        className="absolute inset-0 animate-fade-in bg-black/70"
        onClick={onCancel}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={body ? bodyId : undefined}
        className="relative w-full max-w-sm animate-scale-in rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/70"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                isDanger
                  ? 'border-red-500/40 bg-red-950 text-red-400'
                  : 'border-amber-500/40 bg-amber-950 text-amber-400'
              }`}
            >
              {isDanger ? <AlertTriangle className="h-5 w-5" /> : <CheckSquare className="h-5 w-5" />}
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <h2 id={titleId} className="font-heading text-lg font-black leading-snug text-zinc-100">
                {title}
              </h2>
              {body && (
                <p id={bodyId} className="text-sm leading-relaxed text-zinc-400">
                  {body}
                </p>
              )}
            </div>
          </div>

          <div className="mt-1 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              ref={cancelButtonRef}
              type="button"
              className="flex touch-target cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-zinc-700 bg-zinc-800 px-4 py-2.5 font-heading text-sm font-semibold text-zinc-100 transition-colors duration-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/70"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`flex touch-target cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 font-heading text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
                isDanger
                  ? 'bg-red-600 text-white shadow-md shadow-black/40 hover:bg-red-500 active:bg-red-700 focus-visible:ring-red-400/70'
                  : 'bg-amber-500 text-zinc-950 shadow-md shadow-black/40 hover:bg-amber-400 active:bg-amber-600 focus-visible:ring-amber-400/70'
              }`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
