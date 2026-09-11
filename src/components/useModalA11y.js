import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Shared modal accessibility hook (P0-4):
 * - saves the previously focused element and restores focus on unmount
 * - locks body scroll while the modal is open
 * - closes on Escape
 * - traps Tab focus inside the panel (cycles first <-> last)
 *
 * Returns a ref that MUST be attached to the modal panel element.
 * Pass `active={false}` when the modal is not rendered/open so the
 * effect (and any document listeners) stay inert.
 */
export function useModalA11y({ onClose, active = true }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusable = () => {
      const panel = panelRef.current;
      if (!panel) return [];
      return Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      );
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || !focusable.includes(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !focusable.includes(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    // Focus the panel's first focusable (close button in both modals) on mount.
    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusable();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        panelRef.current?.focus?.();
      }
    }, 0);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [active]);

  return panelRef;
}
