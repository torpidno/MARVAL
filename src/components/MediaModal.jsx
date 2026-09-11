import React, { useMemo, useId } from 'react';
import { useModalA11y } from './useModalA11y';
import {
  X,
  Check,
  CheckCircle2,
  Clock,
  Calendar,
  Globe,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  Link2,
} from 'lucide-react';
import { MARVEL_ITEMS, TYPE_BADGES, PHASE_COLORS } from '../data/marvelData';

// Scoped entrance animation (index.css is owned by another agent — keep it local).
const MODAL_ANIMATION = `
  @keyframes mm-overlay-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes mm-panel-in { from { opacity: 0; transform: translateY(28px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .mm-overlay { animation: mm-overlay-in 0.18s ease-out both; }
  .mm-panel { animation: mm-panel-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @media (prefers-reduced-motion: reduce) { .mm-overlay, .mm-panel { animation: none; } }
`;

export function MediaModal({ item, onClose, isWatched, onToggleWatch, onNavigateToItem }) {
  const connectedItems = useMemo(() => {
    if (!item?.directConnections || !Array.isArray(item.directConnections)) {
      return [];
    }
    return item.directConnections
      .map((connId) => MARVEL_ITEMS.find((m) => m.id === connId))
      .filter(Boolean);
  }, [item?.directConnections]);

  const headerId = useId();
  // Focus trap + Escape + scroll lock + focus restore (P0-4). `active` guards the
  // early return below — when item is null the modal is not rendered.
  const panelRef = useModalA11y({ onClose, active: !!item });

  if (!item) return null;

  const typeBadge = TYPE_BADGES[item.type] || TYPE_BADGES.movie;
  const phaseColor = PHASE_COLORS[item.phase] || '#3b82f6';

  return (
    <>
      <style>{MODAL_ANIMATION}</style>
      <div
        className="mm-overlay fixed inset-0 z-50 bg-black/85 flex items-end sm:items-center justify-center p-0 sm:p-6 lg:p-8"
        onClick={onClose}
      >
        <div
          key={item.id}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headerId}
          className="mm-panel relative w-full max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto momentum-scroll rounded-t-2xl rounded-b-none sm:rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/80"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Handle Indicator */}
          <div className="absolute top-0 left-0 right-0 h-4 flex sm:hidden justify-center items-center z-30 pt-3 pb-1" onClick={onClose}>
            <div className="w-12 h-1.5 bg-zinc-600 rounded-full"></div>
          </div>
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-zinc-50 flex items-center justify-center cursor-pointer transition-colors duration-200 shadow-md shadow-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
            onClick={onClose}
            aria-label="Close details"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Media Header Banner */}
          <div className="relative w-full h-80 sm:h-96 overflow-hidden bg-zinc-950">
            <img
              src={item.poster}
              alt={item.title}
              className="w-full h-full object-cover opacity-80"
            />
            {/* Flat scrim over the banner image */}
            <div className="absolute inset-0 bg-zinc-950/45" />

            <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7 right-5 sm:right-7 flex flex-col gap-3 sm:gap-3.5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-zinc-950/90 text-amber-400 border border-amber-500/40">
                  {item.id}
                </span>
                <span
                  className="text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-md border uppercase"
                  style={{ color: typeBadge.color, backgroundColor: 'rgba(9, 9, 11, 0.8)', borderColor: `${typeBadge.color}55` }}
                >
                  {typeBadge.label}
                </span>
                <span
                  className="text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-md border uppercase"
                  style={{ color: phaseColor, borderColor: `${phaseColor}55`, backgroundColor: `${phaseColor}22` }}
                >
                  {item.phaseStr || `Phase ${item.phase}`}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-950/85 text-zinc-300 border border-zinc-800">
                  {item.saga}
                </span>
                {item.earth && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md bg-blue-950 text-blue-400 border border-blue-900/80">
                    <Globe className="w-3.5 h-3.5" /> {item.earth}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 id={headerId} className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-zinc-100 leading-[1.05] max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {item.title}
              </h2>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" /> {item.releaseYear}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" /> {item.runtime}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Chrono</span>
                  <strong className="text-zinc-100">#{item.chronoOrder}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Release</span>
                  <strong className="text-zinc-100">#{item.releaseOrder}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-5 sm:p-8 flex flex-col gap-7">
            {/* Action Row */}
            <div className="flex items-center gap-4">
              <button
                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[10px] font-heading font-extrabold text-sm transition-all duration-200 cursor-pointer touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
                  isWatched
                    ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-black/40 hover:bg-amber-400 active:bg-amber-600 active:scale-[0.98]'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 active:scale-[0.98]'
                }`}
                onClick={() => onToggleWatch?.(item.id)}
                aria-pressed={isWatched}
              >
                {isWatched ? (
                  <CheckCircle2 className="w-4.5 h-4.5" />
                ) : (
                  <Check className="w-4.5 h-4.5 stroke-[3]" />
                )}
                <span>{isWatched ? 'Watched! Click to uncheck' : 'Mark as Watched'}</span>
              </button>
            </div>

            {/* Synopsis Section */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                  Synopsis
                </h4>
              </div>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                {item.overview}
              </p>
            </div>

            {/* Key Artifacts Section */}
            {item.artifacts && item.artifacts.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                    Key Artifacts & Concepts
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.artifacts.map((art, idx) => (
                    <span
                      key={`modal-art-${idx}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-900/70 hover:bg-amber-900/50 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {art}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Characters Section */}
            {item.characters && item.characters.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                    Primary Characters
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.characters.map((char, idx) => (
                    <span
                      key={`modal-char-${idx}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/60 text-zinc-300 border border-zinc-800 hover:border-zinc-600 transition-colors"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interconnected Marvel Titles (Tactile Mini Cards) */}
            {connectedItems.length > 0 && (
              <div className="flex flex-col gap-3.5 pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-purple-400" />
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                    Interconnected Marvel Titles ({connectedItems.length})
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {connectedItems.map((conn) => (
                    <div
                      key={conn.id}
                      role="button"
                      tabIndex={0}
                      className="group flex items-center gap-3.5 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                      onClick={() => onNavigateToItem?.(conn)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onNavigateToItem?.(conn);
                        }
                      }}
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-700/60 shrink-0">
                        <img
                          src={conn.poster}
                          alt={conn.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                        <span className="text-xs font-bold text-zinc-100 truncate">
                          {conn.title}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5 min-w-0">
                          <span
                            className="text-[10px] font-extrabold uppercase shrink-0"
                            style={{ color: (TYPE_BADGES[conn.type] || TYPE_BADGES.movie).color }}
                          >
                            {(TYPE_BADGES[conn.type] || TYPE_BADGES.movie).label}
                          </span>
                          <span className="w-0.5 h-0.5 rounded-full bg-zinc-600 shrink-0" />
                          <span className="shrink-0">{conn.releaseYear}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-zinc-600 shrink-0" />
                          <span className="font-mono truncate">{conn.id}</span>
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
