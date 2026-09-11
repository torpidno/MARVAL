import React from 'react';
import { Check, Calendar, Globe, Sparkles } from 'lucide-react';
import { TYPE_BADGES, PHASE_COLORS } from '../data/marvelData';
import { UI_CONFIG } from '../constants/uiConstants';

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=600&auto=format&fit=crop';

export function MediaCard({ item, isWatched, onToggleWatch, onSelect, isChronoOrder, animationDelay }) {
  if (!item) return null;

  const typeBadge = TYPE_BADGES[item.type] || TYPE_BADGES.movie;
  const phaseColor = PHASE_COLORS[item.phase] || '#3b82f6';
  const orderNum = isChronoOrder ? item.chronoOrder : item.releaseOrder;
  const displayArtifacts = (item.artifacts || []).slice(0, UI_CONFIG.MAX_SEARCH_PREVIEW_TAGS);
  const displayCharacters = (item.characters || []).slice(0, UI_CONFIG.MAX_SEARCH_PREVIEW_TAGS);

  const handleToggleClick = (event) => {
    event.stopPropagation();
    onToggleWatch?.(item.id);
  };

  const handleSelectKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(item);
    }
  };

  const handleImageError = (event) => {
    event.target.onerror = null;
    event.target.src = FALLBACK_POSTER;
  };

  const hasTags = displayArtifacts.length > 0 || displayCharacters.length > 0;

  return (
    <div
      className={`group relative flex animate-fade-in-up cursor-pointer flex-col overflow-hidden rounded-xl border transition-all duration-300 ease-out ${
        isWatched
          ? 'border-amber-500/40 bg-zinc-900 hover:border-amber-500/70 hover:shadow-md hover:shadow-black/50'
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:shadow-md hover:shadow-black/50'
      }`}
      style={animationDelay != null ? { animationDelay: `${animationDelay}ms` } : undefined}
      onClick={() => onSelect?.(item)}
      onKeyDown={handleSelectKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${item.title}${isWatched ? ', watched' : ''} — open details`}
    >
      {/* Poster Canvas */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={item.poster}
          alt={item.title}
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
          loading="lazy"
          onError={handleImageError}
        />

        {/* Flat bottom scrim for poster legibility */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-zinc-950/60" />

        {/* Order Index Badge */}
        <div
          className="absolute left-3 top-3 rounded-md border border-zinc-700/60 bg-zinc-950/85 px-2 py-1 font-heading text-xs font-extrabold text-amber-400"
          title={isChronoOrder ? `Chrono Index #${item.chronoOrder}` : `Release Index #${item.releaseOrder}`}
        >
          #{orderNum}
        </div>

        {/* ID Code Tag */}
        <div className="absolute bottom-3 left-3 rounded-md border border-zinc-800 bg-zinc-950/70 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
          {item.id}
        </div>

        {/* Type Label Badge — right-14 (56px) on mobile clears the 44px toggle; sm:right-12 (48px) clears the 32px toggle */}
        <div
          className="absolute right-14 top-3 max-w-[6.5rem] truncate rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase sm:right-12"
          style={{ color: typeBadge.color, backgroundColor: 'rgba(9, 9, 11, 0.85)', borderColor: `${typeBadge.color}60` }}
        >
          {typeBadge.label}
        </div>

        {/* Watched Toggle — amber badge when watched. z-10 keeps it above the type badge at all sizes.
            Idle state is faintly visible (text-zinc-500/70) so touch users can discover it without hover (P0-1). */}
        <button
          className={`absolute right-3 top-3 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-md transition-all duration-200 active:scale-95 sm:h-8 sm:w-8 ${
            isWatched
              ? 'border-amber-400 bg-amber-500 text-zinc-950 ring-2 ring-zinc-950 shadow-black/40'
              : 'border-zinc-600 bg-zinc-950/80 text-zinc-400 hover:border-amber-500 hover:text-amber-400 shadow-black/30'
          }`}
          onClick={handleToggleClick}
          title={isWatched ? 'Mark as Unwatched' : 'Mark as Watched'}
          aria-label={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
          aria-pressed={isWatched}
        >
          <Check className="h-5 w-5 stroke-[3] sm:h-4 sm:w-4" />
        </button>
      </div>

      {/* Card Body Info — compact: flex-1 + mt-auto on meta keeps all cards in a row equal height */}
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{ color: phaseColor, borderColor: `${phaseColor}40`, backgroundColor: `${phaseColor}15` }}
          >
            {item.phaseStr || `Phase ${item.phase}`}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-zinc-400">
            <Calendar className="h-3 w-3 text-zinc-500" /> {item.releaseYear}
          </span>
        </div>

        <h3 className="line-clamp-2 font-heading text-sm font-extrabold leading-snug text-zinc-100 sm:text-base">
          {item.title}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-1 text-xs text-zinc-400">
          {item.earth ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-400">
              <Globe className="h-3 w-3" /> {item.earth}
            </span>
          ) : <span />}
          <span className="text-[11px] font-medium text-zinc-400">{item.saga}</span>
        </div>

        {/* Character & Artifact Tags — consistent row height on every card */}
        {hasTags && (
          <div className="mt-0.5 flex flex-wrap gap-1.5 border-t border-zinc-800 pt-2">
            {displayArtifacts.map((art, idx) => (
              <span
                key={`art-${idx}`}
                className="inline-flex items-center gap-1 rounded-md border border-amber-900/70 bg-amber-950 px-2 py-0.5 text-[10px] font-semibold text-amber-400"
              >
                <Sparkles className="h-2.5 w-2.5" /> {art}
              </span>
            ))}
            {displayCharacters.map((char, idx) => (
              <span
                key={`char-${idx}`}
                className="rounded-md border border-zinc-700/60 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300"
              >
                {char}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
