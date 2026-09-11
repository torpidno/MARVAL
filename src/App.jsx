import React, { useState, useCallback, useMemo } from 'react';
import { useWatchProgress } from './hooks/useWatchProgress';
import { Navbar } from './components/Navbar';
import { TimelineView } from './components/TimelineView';
import { Dashboard } from './components/Dashboard';
import { MediaModal } from './components/MediaModal';
import { GistSyncModal } from './components/GistSyncModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastStack } from './components/Toast';
import { MARVEL_ITEMS } from './data/marvelData';
import {
  VIEW_MODES,
  SORT_MODES,
  MEDIA_TYPES,
  STATUS_FILTERS,
  PHASE_FILTERS,
  UI_CONFIG,
} from './constants/uiConstants';

export function App() {
  const {
    watchedIds,
    toggleWatched,
    markAllWatched,
    resetAllProgress,
    stats,
    isWatched,
    gistToken,
    gistId,
    cloudStatus,
    syncError,
    saveGistCredentials,
    clearGistCredentials,
    importProgress,
  } = useWatchProgress();

  const [currentView, setCurrentView] = useState(VIEW_MODES.TIMELINE);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Timeline filters live in App (P2-c) so switching views (keyed remount)
  // no longer silently resets the user's active filters.
  const [timelineFilters, setTimelineFilters] = useState({
    orderMode: SORT_MODES.CHRONO,
    searchQuery: '',
    typeFilter: MEDIA_TYPES.ALL,
    phaseFilter: PHASE_FILTERS.ALL,
    statusFilter: STATUS_FILTERS.ALL,
  });

  const knownCatalogIds = useMemo(() => new Set(MARVEL_ITEMS.map((item) => item.id)), []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    // Keep the stack small — drop the oldest toast beyond the last 4.
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
  }, []);

  const handleExport = useCallback(() => {
    const jsonString = JSON.stringify(watchedIds, null, 2);
    const dataUri = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const filename = `${UI_CONFIG.BACKUP_FILENAME_PREFIX}_${new Date().toISOString().slice(0, 10)}.json`;

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataUri);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('success', `Backup saved as ${filename}`);
  }, [watchedIds, addToast]);

  const handleImport = useCallback((event) => {
    const file = event.target?.files?.[0];
    if (!file) return;
    // Clear the input so selecting the same file again re-triggers onChange.
    event.target.value = '';

    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = (readEvent) => {
      let parsedData;
      try {
        parsedData = JSON.parse(readEvent.target.result);
      } catch (error) {
        console.error('Backup JSON import failed:', error);
        addToast('error', "This doesn't look like a Marvel Watch Tracker backup — nothing was changed");
        return;
      }

      // Must be a plain object (not an array) whose every key is a known catalog id.
      const isValid =
        parsedData !== null &&
        typeof parsedData === 'object' &&
        !Array.isArray(parsedData) &&
        Object.keys(parsedData).every((id) => knownCatalogIds.has(id));

      if (!isValid) {
        addToast('error', "This doesn't look like a Marvel Watch Tracker backup — nothing was changed");
        return;
      }

      // Import via the hook (persists to localStorage + cloud + Electron disk);
      // no window reload needed anymore.
      importProgress?.(parsedData);
      const importedCount = Object.keys(parsedData).length;
      addToast('success', `Imported ${importedCount} watched titles`);
    };
  }, [addToast, importProgress, knownCatalogIds]);

  const handleReset = useCallback(() => {
    setConfirmState({
      type: 'reset',
      title: 'Reset watch progress?',
      body: `This will clear ${stats.watchedCount} watched titles. This cannot be undone.`,
      confirmLabel: 'Reset',
    });
  }, [stats.watchedCount]);

  const handleMarkAll = useCallback(() => {
    setConfirmState({
      type: 'markAll',
      title: 'Mark all titles as watched?',
      body: `Mark all ${stats.totalCount} titles as watched?`,
      confirmLabel: 'Mark All',
    });
  }, [stats.totalCount]);

  const handleConfirmDialog = useCallback(() => {
    if (!confirmState) return;
    if (confirmState.type === 'reset') {
      resetAllProgress();
      addToast('info', 'Watch progress cleared');
    } else if (confirmState.type === 'markAll') {
      markAllWatched();
      addToast('success', 'Marked all titles as watched');
    }
    setConfirmState(null);
  }, [confirmState, resetAllProgress, markAllWatched, addToast]);

  const handleCloseModal = useCallback(() => {
    setSelectedMedia(null);
  }, []);

  return (
    <div className="relative flex w-full min-h-screen flex-col overflow-x-clip bg-zinc-950 text-zinc-100">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        stats={stats}
        onReset={handleReset}
        onExport={handleExport}
        onImport={handleImport}
        onOpenFirebaseModal={() => setIsSyncModalOpen(true)}
        cloudStatus={cloudStatus}
        syncError={syncError}
      />

      {/* Main View Container — keyed by view so switching replays the entrance animation */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8 sm:pb-16">
        <div key={currentView} className="animate-view-enter">
          {currentView === VIEW_MODES.TIMELINE && (
            <TimelineView
              watchedIds={watchedIds}
              onToggleWatch={toggleWatched}
              onSelectItem={setSelectedMedia}
              filters={timelineFilters}
              onFiltersChange={setTimelineFilters}
            />
          )}

          {currentView === VIEW_MODES.DASHBOARD && (
            <Dashboard
              stats={stats}
              onMarkAll={handleMarkAll}
              onReset={handleReset}
              onExport={handleExport}
            />
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedMedia && (
        <MediaModal
          item={selectedMedia}
          onClose={handleCloseModal}
          isWatched={isWatched(selectedMedia.id)}
          onToggleWatch={toggleWatched}
          onNavigateToItem={setSelectedMedia}
        />
      )}

      {/* GitHub Gist Cloud Sync Modal */}
      <GistSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        cloudStatus={cloudStatus}
        gistToken={gistToken}
        gistId={gistId}
        syncError={syncError}
        onSave={saveGistCredentials}
        onClear={clearGistCredentials}
      />

      {/* In-app confirm dialog (replaces window.confirm) */}
      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.title}
        body={confirmState?.body}
        confirmLabel={confirmState?.confirmLabel}
        tone={confirmState?.type === 'markAll' ? 'info' : 'danger'}
        onConfirm={handleConfirmDialog}
        onCancel={() => setConfirmState(null)}
      />

      {/* Toast notifications */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
