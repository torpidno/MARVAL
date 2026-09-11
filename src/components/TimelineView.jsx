import React, { useCallback, useMemo } from 'react';
import { Search, Clock, Calendar, X, Film } from 'lucide-react';
import { MARVEL_ITEMS, PHASES, PHASE_COLORS } from '../data/marvelData';
import { MediaCard } from './MediaCard';
import { SORT_MODES, MEDIA_TYPES, STATUS_FILTERS, PHASE_FILTERS } from '../constants/uiConstants';

// Controlled default filters — state lives in App so the keyed view remount
// (view switch) no longer resets the user's active filters (P2-c).
const DEFAULT_FILTERS = Object.freeze({
  orderMode: SORT_MODES.CHRONO,
  searchQuery: '',
  typeFilter: MEDIA_TYPES.ALL,
  phaseFilter: PHASE_FILTERS.ALL,
  statusFilter: STATUS_FILTERS.ALL,
});

export function TimelineView({
  watchedIds = {},
  onToggleWatch,
  onSelectItem,
  filters = DEFAULT_FILTERS,
  onFiltersChange,
}) {
  const { orderMode, searchQuery, typeFilter, phaseFilter, statusFilter } = filters;

  const updateFilter = useCallback(
    (patch) => onFiltersChange?.({ ...filters, ...patch }),
    [filters, onFiltersChange]
  );
  const setOrderMode = useCallback((value) => updateFilter({ orderMode: value }), [updateFilter]);
  const setSearchQuery = useCallback((value) => updateFilter({ searchQuery: value }), [updateFilter]);
  const setTypeFilter = useCallback((value) => updateFilter({ typeFilter: value }), [updateFilter]);
  const setPhaseFilter = useCallback((value) => updateFilter({ phaseFilter: value }), [updateFilter]);
  const setStatusFilter = useCallback((value) => updateFilter({ statusFilter: value }), [updateFilter]);

  // Pure filtering & sorting logic
  const processedItems = useMemo(() => {
    let items = [...MARVEL_ITEMS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.overview?.toLowerCase().includes(q) ||
          (item.characters && item.characters.some((c) => c.toLowerCase().includes(q))) ||
          (item.artifacts && item.artifacts.some((a) => a.toLowerCase().includes(q))) ||
          item.id?.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== MEDIA_TYPES.ALL) {
      items = items.filter((item) => item.type === typeFilter);
    }

    if (phaseFilter !== PHASE_FILTERS.ALL) {
      items = items.filter((item) => item.phase === Number(phaseFilter));
    }

    if (statusFilter === STATUS_FILTERS.WATCHED) {
      items = items.filter((item) => !!watchedIds[item.id]);
    } else if (statusFilter === STATUS_FILTERS.UNWATCHED) {
      items = items.filter((item) => !watchedIds[item.id]);
    }

    if (orderMode === SORT_MODES.CHRONO) {
      return items.sort((a, b) => (a.chronoOrder || 0) - (b.chronoOrder || 0));
    }

    return items.sort((a, b) => (a.releaseOrder || 0) - (b.releaseOrder || 0));
  }, [searchQuery, typeFilter, phaseFilter, statusFilter, orderMode, watchedIds]);

  // Group items by Phase when in Release Order
  const itemsByPhase = useMemo(() => {
    if (orderMode === SORT_MODES.CHRONO) return {};

    return processedItems.reduce((acc, item) => {
      const p = item.phase || 1;
      if (!acc[p]) acc[p] = [];
      acc[p].push(item);
      return acc;
    }, {});
  }, [processedItems, orderMode]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter(MEDIA_TYPES.ALL);
    setPhaseFilter(PHASE_FILTERS.ALL);
    setStatusFilter(STATUS_FILTERS.ALL);
  };

  const isChronoMode = orderMode === SORT_MODES.CHRONO;
  const watchedCount = Object.keys(watchedIds).length;
  const activeFilterCount = (typeFilter !== MEDIA_TYPES.ALL ? 1 : 0) +
    (phaseFilter !== PHASE_FILTERS.ALL ? 1 : 0) +
    (statusFilter !== STATUS_FILTERS.ALL ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const pillBase = 'px-3 py-1.5 min-h-11 rounded-lg text-xs font-semibold border transition-colors duration-200 cursor-pointer';
  const pillActive = 'bg-zinc-700 text-zinc-50 border-zinc-600';
  const pillIdle = 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200 hover:border-zinc-700';

  return (
    <div className="flex flex-col gap-7 sm:gap-8">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/30">
        <div className="relative z-10 flex flex-col justify-between gap-6 p-5 sm:p-8 md:flex-row md:items-center lg:p-10">
          <div className="flex max-w-2xl flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md border border-red-500/30 bg-red-950 px-2.5 py-1 text-[10px] font-bold uppercase text-red-400">
                Official Watch Guide
              </span>
              <span className="hidden h-px w-6 bg-zinc-700 sm:inline-block" />
              <span className="text-xs font-medium text-zinc-400">{MARVEL_ITEMS.length} Connected MCU Titles</span>
            </div>
            <h1 className="font-heading text-2xl font-black leading-[1.05] tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
              Marvel Cinematic <span className="text-amber-400">Universe</span>
            </h1>
            <p className="hidden max-w-xl text-sm leading-relaxed text-zinc-400 sm:block sm:text-[15px]">
              Explore the entire MCU timeline in story chronological sequence or original release date order. Select any title to inspect connected storylines and jump between interconnected titles.
            </p>
          </div>

          {/* Stat Chips — flex-wrap so chips wrap below the headline instead of overflowing at 320px */}
          <div className="flex shrink-0 flex-wrap items-center">
            <div className="flex items-stretch divide-x divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-md shadow-black/30">
              <div className="flex min-w-[104px] flex-col items-center justify-center px-5 py-3.5 sm:px-6">
                <span className="font-heading text-2xl font-black text-amber-400 sm:text-3xl">{watchedCount}</span>
                <span className="mt-1 text-[10px] font-medium text-zinc-500">Watched</span>
              </div>
              <div className="flex min-w-[104px] flex-col items-center justify-center px-5 py-3.5 sm:px-6">
                <span className="font-heading text-2xl font-black text-zinc-100 sm:text-3xl">{MARVEL_ITEMS.length}</span>
                <span className="mt-1 text-[10px] font-medium text-zinc-500">Total Titles</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg shadow-black/30 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Order Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
            <button
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-heading text-xs font-extrabold transition-all duration-200 touch-target ${
                isChronoMode
                  ? 'bg-zinc-700 text-amber-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
              onClick={() => setOrderMode(SORT_MODES.CHRONO)}
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="sm:hidden">Chrono</span><span className="hidden sm:inline">Story Chronological Order</span>
            </button>
            <button
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-heading text-xs font-extrabold transition-all duration-200 touch-target ${
                !isChronoMode
                  ? 'bg-zinc-700 text-amber-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
              onClick={() => setOrderMode(SORT_MODES.RELEASE)}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="sm:hidden">Release</span><span className="hidden sm:inline">Release Date Order</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex w-full min-w-[240px] flex-1 items-center sm:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search title or plot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-[10px] border border-zinc-700 bg-zinc-950 pl-10 pr-10 text-sm text-zinc-100 placeholder-zinc-500 transition-colors duration-200 hover:border-zinc-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            {searchQuery && (
              <button
                className="absolute right-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-zinc-100"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Toolbar — relative wrapper holds edge fades that stay fixed while the row scrolls */}
        <div className="relative">
          <div className="flex flex-nowrap items-center gap-4 overflow-x-auto border-t border-zinc-800 pb-1 pt-3.5 hide-scrollbar momentum-scroll safe-area-pb">
            <div className="flex flex-nowrap shrink-0 items-center gap-5">
            {/* Type Filter */}
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="mr-1 text-[10px] font-bold uppercase text-zinc-500">Type</span>
              {[
                { id: MEDIA_TYPES.ALL, label: 'All' },
                { id: MEDIA_TYPES.MOVIE, label: 'Movies' },
                { id: MEDIA_TYPES.SERIES, label: 'TV Series' },
                { id: MEDIA_TYPES.SPECIAL, label: 'Specials' },
              ].map((t) => (
                <button
                  key={t.id}
                  className={`${pillBase} ${typeFilter === t.id ? pillActive : pillIdle}`}
                  onClick={() => setTypeFilter(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div aria-hidden="true" className="h-5 w-px shrink-0 bg-zinc-800" />

            {/* Phase Filter */}
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="mr-1 text-[10px] font-bold uppercase text-zinc-500">Era</span>
              <button
                className={`${pillBase} ${phaseFilter === PHASE_FILTERS.ALL ? pillActive : pillIdle}`}
                onClick={() => setPhaseFilter(PHASE_FILTERS.ALL)}
              >
                All Eras
              </button>
              {PHASES.map((p) => {
                const isActive = Number(phaseFilter) === p;
                const phaseColor = PHASE_COLORS[p] || '#3b82f6';
                const phaseLabel = Number(p) === 99 ? 'Legacy' : `Phase ${p}`;

                return (
                  <button
                    key={p}
                    className={`${pillBase} ${isActive ? 'bg-zinc-700 text-zinc-100' : pillIdle}`}
                    onClick={() => setPhaseFilter(p)}
                    style={isActive ? { borderColor: phaseColor, color: phaseColor } : {}}
                  >
                    {phaseLabel}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div aria-hidden="true" className="h-5 w-px shrink-0 bg-zinc-800" />

            {/* Status Filter */}
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="mr-1 text-[10px] font-bold uppercase text-zinc-500">Status</span>
              {[
                { id: STATUS_FILTERS.ALL, label: 'All' },
                { id: STATUS_FILTERS.WATCHED, label: 'Watched' },
                { id: STATUS_FILTERS.UNWATCHED, label: 'Unwatched' },
              ].map((s) => (
                <button
                  key={s.id}
                  className={`${pillBase} ${statusFilter === s.id ? pillActive : pillIdle}`}
                  onClick={() => setStatusFilter(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              className="ml-auto flex shrink-0 cursor-pointer touch-target items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-400 transition-colors duration-200 hover:bg-amber-500/15 hover:text-amber-300"
              onClick={handleResetFilters}
            >
              <X className="h-3.5 w-3.5" />
              Reset {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-zinc-400">
        <span className="flex items-center gap-2">
          <Film className="h-3.5 w-3.5 text-amber-500" />
          Showing <strong className="font-bold text-zinc-100">{processedItems.length}</strong> of {MARVEL_ITEMS.length} titles
          <span className="hidden text-zinc-600 sm:inline">•</span>
          <span className="hidden font-medium sm:inline">
            {isChronoMode ? 'Story Chronological Order' : 'Release Date Order'}
          </span>
        </span>
        {activeFilterCount > 0 && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 font-bold text-amber-400">
            {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Media Grid / Empty State */}
      {processedItems.length === 0 ? (
        <div className="animate-fade-in-up flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center sm:p-14">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-800">
            <Film className="h-7 w-7 text-zinc-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-lg font-bold text-zinc-100">No titles found</h3>
            <p className="max-w-sm text-sm text-zinc-400">
              Nothing matches your search and filters. Try different keywords or clear the active filters.
            </p>
          </div>
          <button
            className="mt-1 inline-flex touch-target cursor-pointer items-center gap-2 rounded-[10px] bg-amber-500 px-5 py-2.5 font-heading text-sm font-bold text-zinc-950 shadow-sm shadow-black/40 transition-colors duration-200 hover:bg-amber-400 active:bg-amber-600 active:scale-95"
            onClick={handleResetFilters}
          >
            <X className="h-4 w-4" />
            Clear Active Filters
          </button>
        </div>
      ) : isChronoMode ? (
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {processedItems.map((item, index) => (
            <MediaCard
              key={item.id}
              item={item}
              isWatched={!!watchedIds[item.id]}
              onToggleWatch={onToggleWatch}
              onSelect={onSelectItem}
              isChronoOrder={true}
              animationDelay={Math.min(index, 11) * 40}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.keys(itemsByPhase)
            .sort((a, b) => Number(a) - Number(b))
            .map((phaseNum) => {
              const phaseItems = itemsByPhase[phaseNum] || [];
              const phaseColor = PHASE_COLORS[phaseNum] || '#3b82f6';
              const watchedInPhase = phaseItems.filter((i) => !!watchedIds[i.id]).length;
              const phasePercent = phaseItems.length > 0 ? Math.round((watchedInPhase / phaseItems.length) * 100) : 0;

              return (
                <section key={phaseNum} className="animate-fade-in flex flex-col gap-4">
                  <div
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                    style={{ borderLeft: '4px solid ' + phaseColor }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg font-heading text-xs font-black"
                        style={{ color: phaseColor, backgroundColor: `${phaseColor}22`, border: `1px solid ${phaseColor}40` }}
                      >
                        {Number(phaseNum) === 99 ? '∞' : phaseNum}
                      </div>
                      <h2 className="font-heading text-lg font-extrabold text-zinc-100">
                        {Number(phaseNum) === 99 ? 'Multiverse & Legacy Era' : `Phase ${phaseNum}`}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                      <span><strong className="text-zinc-200">{watchedInPhase}</strong> / {phaseItems.length} Watched</span>
                      <span className="font-heading font-bold" style={{ color: phaseColor }}>{phasePercent}%</span>
                      <div className="h-1 w-20 overflow-hidden rounded-full bg-zinc-800">
                        <div className="h-full transition-all duration-300" style={{ width: `${phasePercent}%`, backgroundColor: phaseColor }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {phaseItems.map((item, index) => (
                      <MediaCard
                        key={item.id}
                        item={item}
                        isWatched={!!watchedIds[item.id]}
                        onToggleWatch={onToggleWatch}
                        onSelect={onSelectItem}
                        isChronoOrder={false}
                        animationDelay={Math.min(index, 11) * 40}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
