import React from 'react';
import {
  Trophy,
  Clock,
  Film,
  Tv,
  CheckCircle2,
  Layers,
  RotateCcw,
  Download,
  CheckSquare,
  Database,
} from 'lucide-react';
import { PHASES, PHASE_COLORS, SAGAS } from '../data/marvelData';

function MetricCard({ label, icon: Icon, iconClass, accentClass, barClass, value, unit, caption, percent }) {
  return (
    <div className="group relative overflow-hidden p-4 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between gap-3 sm:gap-5 hover:border-zinc-600 transition-colors duration-300">
      {/* Top accent line (per-metric color) */}
      <div
        className={`absolute top-0 left-4 right-4 h-0.5 ${accentClass} pointer-events-none`}
      />
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 line-clamp-2 min-w-0 leading-snug">
          {label}
        </span>
        <div
          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-zinc-100 tabular-nums tracking-tight whitespace-nowrap">
            {value}
            {unit && <span className="ml-1.5 text-sm font-semibold text-zinc-500">{unit}</span>}
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-zinc-400">{caption}</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ stats = {}, onMarkAll, onReset, onExport }) {
  const overallPercent = stats.progressPercent || 0;
  const watchedHours = stats.watchedHours || 0;
  const totalHours = stats.totalHours || 0;
  const watchTimePercent = stats.totalMinutes > 0 ? Math.round((stats.watchedMinutes / stats.totalMinutes) * 100) : 0;

  const moviesWatched = stats.moviesWatched || 0;
  const totalMovies = stats.totalMovies || 0;
  const moviesPercent = totalMovies > 0 ? Math.round((moviesWatched / totalMovies) * 100) : 0;

  const seriesWatched = stats.seriesWatched || 0;
  const totalSeries = stats.totalSeries || 0;
  const seriesPercent = totalSeries > 0 ? Math.round((seriesWatched / totalSeries) * 100) : 0;

  const metricCards = [
    {
      label: 'Overall Progress',
      icon: Trophy,
      iconClass: 'bg-amber-500/15 text-amber-400',
      accentClass: 'bg-amber-500',
      barClass: 'bg-amber-500',
      value: `${overallPercent}%`,
      percent: overallPercent,
      caption: (
        <>
          <strong className="text-zinc-200">{stats.watchedCount || 0}</strong> / {stats.totalCount || 0} watched
        </>
      ),
    },
    {
      label: 'Watch Time',
      icon: Clock,
      iconClass: 'bg-blue-500/15 text-blue-400',
      accentClass: 'bg-blue-500',
      barClass: 'bg-blue-500',
      value: watchedHours,
      unit: 'hrs',
      percent: watchTimePercent,
      caption: <>of {totalHours} hrs</>,
    },
    {
      label: 'Movies Watched',
      icon: Film,
      iconClass: 'bg-purple-500/15 text-purple-400',
      accentClass: 'bg-purple-500',
      barClass: 'bg-purple-500',
      value: moviesWatched,
      percent: moviesPercent,
      caption: <>of {totalMovies} movies</>,
    },
    {
      label: 'TV Series & Specials',
      icon: Tv,
      iconClass: 'bg-emerald-500/15 text-emerald-400',
      accentClass: 'bg-emerald-500',
      barClass: 'bg-emerald-500',
      value: seriesWatched,
      percent: seriesPercent,
      caption: <>of {totalSeries} series</>,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      {/* Phase Breakdown Section */}
      <div className="p-4 sm:p-7 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <h2 className="font-heading font-black text-lg text-zinc-100">
              MCU Phase Breakdown
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            Progress analytics across Marvel Sagas
          </span>
        </div>

        {/* 7 phase cards (1-6 + 99): 2/3/4 columns — 4-col at lg keeps the legacy card from being orphaned alone */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {PHASES.map((phaseNum) => {
            const phaseData = stats.phaseStats?.[phaseNum] || { watched: 0, total: 0 };
            const phasePercent =
              phaseData.total > 0 ? Math.round((phaseData.watched / phaseData.total) * 100) : 0;
            const phaseColor = PHASE_COLORS[phaseNum] || '#3b82f6';
            const sagaName =
              phaseNum <= 3 ? SAGAS.INFINITY : phaseNum === 99 ? SAGAS.CLASSIC : SAGAS.MULTIVERSE;
            const isComplete = phasePercent === 100;
            const phaseLabel = Number(phaseNum) === 99 ? 'Legacy' : `Phase ${phaseNum}`;

            return (
              <div
                key={phaseNum}
                className="relative overflow-hidden p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-4 hover:border-zinc-600 transition-colors duration-300"
                style={{ borderTop: '4px solid ' + phaseColor }}
              >
                <div className="relative flex items-center justify-between gap-2">
                  <span
                    className="text-[10px] font-extrabold text-white px-2.5 py-0.5 rounded-md"
                    style={{ backgroundColor: phaseColor }}
                  >
                    {phaseLabel}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium truncate">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: phaseColor }}
                    />
                    {sagaName}
                  </span>
                </div>

                <div className="relative flex flex-col gap-2.5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <span className="font-heading font-black text-2xl sm:text-3xl text-zinc-100 tabular-nums tracking-tight whitespace-nowrap">
                      {phasePercent}%
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium text-zinc-400">
                      <strong className="text-zinc-200">{phaseData.watched}</strong> / {phaseData.total}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${phasePercent}%`,
                        backgroundColor: phaseColor,
                      }}
                    />
                  </div>
                </div>

                {isComplete && (
                  <div className="relative flex items-center gap-1.5 w-fit text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950 border border-emerald-500/40 rounded-md px-2 py-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management Section */}
      <div className="p-4 sm:p-7 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-heading font-black text-base text-zinc-100">
              Data Management
            </h3>
            <p className="text-xs text-zinc-400">
              Export progress backup, mark all titles watched, or reset progress.
            </p>
          </div>
        </div>

        <div className="flex flex-col w-full sm:flex-row sm:w-auto items-stretch sm:items-center gap-2.5 sm:gap-3">
          <button
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-[10px] bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-heading font-bold text-xs border border-transparent shadow-sm shadow-black/40 transition-colors cursor-pointer touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            onClick={onMarkAll}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Mark All Watched</span>
          </button>
          <button
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-heading font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            onClick={onExport}
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Backup</span>
          </button>
          <button
            className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-[10px] bg-red-950 hover:bg-red-900 text-red-400 font-heading font-semibold text-xs border border-red-900/80 transition-colors cursor-pointer touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}
