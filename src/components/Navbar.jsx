import React, { useState } from 'react';
import { Film, BarChart2, Shield, CheckCircle2, RotateCcw, Download, Upload, Cloud, CloudOff, Menu, X } from 'lucide-react';
import { VIEW_MODES } from '../constants/uiConstants';

const VIEW_TABS = [
  { id: VIEW_MODES.TIMELINE, label: 'Timeline', Icon: Film },
  { id: VIEW_MODES.DASHBOARD, label: 'Dashboard', Icon: BarChart2 },
];

export function Navbar({ currentView, setCurrentView, stats, onReset, onExport, onImport, onOpenFirebaseModal, cloudStatus, syncError }) {
  const isCloudConnected = cloudStatus === 'connected';
  const isCloudError = cloudStatus === 'error';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950 safe-area-pt">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div
            className="group flex touch-target select-none items-center gap-3"
            onClick={() => setCurrentView(VIEW_MODES.TIMELINE)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView(VIEW_MODES.TIMELINE);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Go to Timeline"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white">
              <Shield className="h-5 w-5 fill-current" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-black leading-none tracking-tight text-zinc-50">
                MARVEL
              </span>
              <span className="mt-1 hidden text-[10px] font-medium text-zinc-500 sm:block">
                Chrono Tracker
              </span>
            </div>
          </div>

          {/* View Switcher Segmented Control - Desktop Only */}
          <nav className="hidden items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 md:flex">
            {VIEW_TABS.map(({ id, label, Icon }) => {
              const isActive = currentView === id;
              return (
                <button
                  key={id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-1.5 font-heading text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-zinc-700 text-zinc-50'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                  onClick={() => setCurrentView(id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & Tools Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Sync Status Button — distinct ERROR state when sync fails */}
            <button
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 touch-target ${
                isCloudConnected
                  ? 'border-emerald-500/40 bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                  : isCloudError
                    ? 'border-red-500/40 bg-red-950 text-red-400 hover:bg-red-900'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
              onClick={onOpenFirebaseModal}
              title={
                isCloudError
                  ? (syncError || 'Cloud sync error')
                  : isCloudConnected
                    ? 'Connected to Cloud Gist Sync'
                    : 'Configure Cloud Gist Sync'
              }
            >
              {isCloudConnected
                ? <Cloud className="h-5 w-5 text-emerald-400 sm:h-3.5 sm:w-3.5" />
                : <CloudOff className={`h-5 w-5 sm:h-3.5 sm:w-3.5 ${isCloudError ? 'text-red-400' : 'text-zinc-400'}`} />}
              <span className="hidden sm:inline">
                {isCloudConnected ? 'Cloud Synced' : isCloudError ? 'Sync Error' : 'Cloud Sync'}
              </span>
            </button>

            {/* Progress Status Pill - Desktop Only */}
            <div
              className="hidden items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-1.5 lg:flex"
              title={`${stats?.watchedHours || 0} hrs watched of ${stats?.totalHours || 0} total hrs`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-zinc-950">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium leading-none text-zinc-400">
                  <strong className="text-zinc-100">{stats?.watchedCount || 0}</strong> / {stats?.totalCount || 0} Watched
                </span>
                <div className="h-1 w-24 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${stats?.progressPercent || 0}%` }}
                  />
                </div>
              </div>
              <span className="font-heading text-xs font-bold text-amber-500">
                {stats?.progressPercent || 0}%
              </span>
            </div>

            {/* Quick Action Tools - Tablet & Desktop (768px+): brand ~150 + segmented ~260 + cloud ~115 + tools ~110 fits in 720px at md; progress pill stays lg+ */}
            <div className="hidden items-center gap-1.5 md:flex">
              <button
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100"
                onClick={onExport}
                title="Export Progress Backup (JSON)"
              >
                <Download className="h-4 w-4" />
              </button>
              <label
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100"
                title="Import Progress Backup (JSON)"
              >
                <Upload className="h-4 w-4" />
                <input type="file" accept=".json" onChange={onImport} className="hidden" />
              </label>
              <button
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all duration-200 hover:border-red-900 hover:bg-red-950 hover:text-red-400"
                onClick={onReset}
                title="Reset Watch Progress"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="flex h-11 w-11 touch-target items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors duration-200 hover:text-zinc-100 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle settings menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Settings Dropdown */}
        {isMenuOpen && (
          <div className="absolute inset-x-0 top-full w-full animate-fade-in border-b border-zinc-800 bg-zinc-950 p-4 shadow-xl shadow-black/50 md:hidden">
            <div className="flex flex-col gap-2">
              <button
                className="flex w-full touch-target cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 font-medium text-zinc-200 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-800"
                onClick={() => { onExport(); setIsMenuOpen(false); }}
              >
                <Download className="h-5 w-5 text-zinc-400" /> Export Backup
              </button>
              <label
                className="flex w-full touch-target cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 font-medium text-zinc-200 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-800"
              >
                <Upload className="h-5 w-5 text-zinc-400" /> Import Backup
                <input type="file" accept=".json" onChange={(e) => { onImport(e); setIsMenuOpen(false); }} className="hidden" />
              </label>
              <button
                className="flex w-full touch-target cursor-pointer items-center gap-3 rounded-xl border border-red-900/60 bg-red-950 p-3 font-medium text-red-400 transition-colors duration-200 hover:border-red-800 hover:bg-red-900"
                onClick={() => { onReset(); setIsMenuOpen(false); }}
              >
                <RotateCcw className="h-5 w-5 text-red-400" /> Reset Progress
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Bottom Tab Bar - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-zinc-800 bg-zinc-950 shadow-[0_-4px_12px_rgba(0,0,0,0.35)] safe-area-pb md:hidden">
        {VIEW_TABS.map(({ id, label, Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              className={`flex w-full flex-col items-center justify-center gap-0.5 py-2 transition-all duration-200 touch-target ${
                isActive ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-300'
              }`}
              onClick={() => setCurrentView(id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                  isActive ? 'bg-amber-500/20' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
