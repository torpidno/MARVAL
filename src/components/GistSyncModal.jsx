import React, { useState, useEffect, useId } from 'react';
import {
  X,
  Cloud,
  CloudOff,
  Key,
  Database,
  LogOut,
  CheckCircle,
  Info,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useModalA11y } from './useModalA11y';

// Scoped entrance animation (index.css is owned by another agent — keep it local).
const MODAL_ANIMATION = `
  @keyframes gs-overlay-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes gs-panel-in { from { opacity: 0; transform: translateY(28px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .gs-overlay { animation: gs-overlay-in 0.18s ease-out both; }
  .gs-panel { animation: gs-panel-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @media (prefers-reduced-motion: reduce) { .gs-overlay, .gs-panel { animation: none; } }
`;

export function GistSyncModal({ isOpen, onClose, cloudStatus, gistToken, gistId, syncError, onSave, onClear }) {
  const [tokenInput, setTokenInput] = useState(gistToken || '');
  const [gistIdInput, setGistIdInput] = useState(gistId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [lastMerge, setLastMerge] = useState(null);

  const headerId = useId();
  // Focus trap + Escape + scroll lock + focus restore (P0-4). Guarded by `active`
  // so the hook stays inert while the modal is closed (early return below).
  const panelRef = useModalA11y({ onClose, active: isOpen });

  useEffect(() => {
    setTokenInput(gistToken || '');
    setGistIdInput(gistId || '');
    setLocalError('');
    setLastMerge(null);
  }, [isOpen, gistToken, gistId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    if (!tokenInput.trim()) {
      setLocalError('GitHub Personal Access Token is required');
      setIsLoading(false);
      return;
    }

    const result = await onSave(tokenInput.trim(), gistIdInput.trim());
    setIsLoading(false);
    if (!result.success) {
      setLocalError(result.error || 'Failed to connect');
    } else if (result.merged) {
      // Surface the union-merge outcome so linking never looks like silent data loss (P0-5).
      setLastMerge({
        localCount: result.localCount ?? 0,
        cloudCount: result.cloudCount ?? 0,
      });
    }
  };

  const isConnected = cloudStatus === 'connected' || cloudStatus === 'syncing';

  const statusDotClass =
    cloudStatus === 'syncing'
      ? 'bg-amber-400 animate-pulse'
      : cloudStatus === 'connected'
        ? 'bg-emerald-400'
        : cloudStatus === 'error'
          ? 'bg-red-500'
          : 'bg-zinc-600';

  const statusTextClass =
    cloudStatus === 'syncing'
      ? 'text-amber-300'
      : cloudStatus === 'connected'
        ? 'text-emerald-300'
        : cloudStatus === 'error'
          ? 'text-red-300'
          : 'text-zinc-400';

  return (
    <>
      <style>{MODAL_ANIMATION}</style>
      <div
        className="gs-overlay fixed inset-0 z-50 bg-black/85 flex items-end sm:items-center justify-center p-0 sm:p-6"
        onClick={onClose}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headerId}
          className="gs-panel relative w-full max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-y-auto momentum-scroll rounded-t-2xl rounded-b-none sm:rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/80 p-6 sm:p-7 flex flex-col gap-6 pb-[env(safe-area-inset-bottom)] sm:pb-7"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Handle Indicator */}
          <div className="absolute top-0 left-0 right-0 h-4 flex sm:hidden justify-center items-center z-30 pt-3 pb-1" onClick={onClose}>
            <div className="w-12 h-1.5 bg-zinc-600 rounded-full"></div>
          </div>

          {/* Close Button */}
          <button
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-zinc-100 flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
            onClick={onClose}
            aria-label="Close sync settings"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 pr-8">
            <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border ${
              isConnected
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              {isConnected ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 id={headerId} className="font-heading font-black text-xl text-zinc-100">
                Cloud Sync Settings
              </h2>
              <div className="flex items-center gap-2 mt-0.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotClass}`} />
                <span className={`text-xs font-medium truncate ${statusTextClass}`}>
                  {cloudStatus === 'syncing' && 'Syncing changes...'}
                  {cloudStatus === 'connected' && 'Synced with GitHub Gist'}
                  {cloudStatus === 'error' && 'Sync Error'}
                  {cloudStatus === 'disconnected' && 'Local Storage Only (Offline)'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-4">
            {isConnected ? (
              <div className="p-4 rounded-xl bg-zinc-800/50 border border-emerald-500/30 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-heading font-extrabold text-emerald-300">
                        Sync Active
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        Progress auto-syncs to your private GitHub Gist
                      </span>
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 text-xs font-bold border border-red-900/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
                    onClick={onClear}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disable Sync</span>
                  </button>
                </div>
                <div className="text-xs font-mono bg-zinc-950 p-3 rounded-lg border border-zinc-800 overflow-x-auto text-zinc-400">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-bold mb-1.5">
                    <Database className="w-3 h-3" /> Gist ID
                  </div>
                  {gistId || '—'}
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex flex-col gap-2">
                  <span className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    Your watch progress is securely saved as a secret Gist in your GitHub account.
                  </span>
                  <span className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    Both devices stay synchronized over any network (LTE/Wi-Fi) automatically.
                  </span>
                  {lastMerge && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-950 border border-blue-900/80 text-xs text-blue-300 mt-1">
                      <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        Merged {lastMerge.localCount} titles from this device with {lastMerge.cloudCount} from cloud — nothing was lost.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Info alert */}
                <div className="p-3.5 rounded-xl bg-blue-950 border border-blue-900/80 text-xs text-blue-300 flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="font-heading font-extrabold text-blue-200 text-sm">
                      Sync over any network for free
                    </span>
                    <span className="text-[11px] leading-relaxed text-blue-300/80">
                      We use your GitHub account as a free, secure, and private database. No Firebase limits.
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 text-blue-300 uppercase">
                        Free
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 uppercase">
                        Private
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 uppercase">
                        2-Way Sync
                      </span>
                    </div>
                  </div>
                </div>

                {(localError || syncError) && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950 border border-red-900/80 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-medium">{localError || syncError}</span>
                  </div>
                )}

                {/* Token Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between gap-2">
                    <span>GitHub Personal Token</span>
                    <a
                      href="https://github.com/settings/tokens/new?description=MarvelWatchTracker&scopes=gist"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-400 hover:underline normal-case font-bold shrink-0"
                    >
                      Generate Token (Gist scope)
                    </a>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 flex items-center justify-center w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500">
                      <Key className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      required
                      className="w-full pl-11 pr-3 py-3 sm:py-2.5 rounded-[10px] bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors touch-target"
                    />
                  </div>
                </div>

                {/* Gist ID Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-zinc-300">
                      Gist ID (Optional)
                    </label>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Leave blank to automatically create a new sync profile!
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 flex items-center justify-center w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500">
                      <Database className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Existing Gist ID (for second device link)"
                      value={gistIdInput}
                      onChange={(e) => setGistIdInput(e.target.value)}
                      className="w-full pl-11 pr-3 py-3 sm:py-2.5 rounded-[10px] bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors touch-target"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 flex items-center justify-center gap-2 py-3.5 sm:py-3 rounded-[10px] bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-heading font-extrabold text-sm transition-colors shadow-sm shadow-black/40 touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  <span>{isLoading ? 'Connecting...' : gistIdInput.trim() ? 'Link Sync Profile' : 'Create & Enable Sync'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
