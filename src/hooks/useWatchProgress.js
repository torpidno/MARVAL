import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MARVEL_ITEMS } from '../data/marvelData';

const STORAGE_KEY = 'marvel_watch_progress_v1';
const GIST_TOKEN_KEY = 'marvel_gist_token_v1';
const GIST_ID_KEY = 'marvel_gist_id_v1';

// Deterministic key-sorted JSON serialization for safe object comparisons
const getSortedJsonString = (obj) => {
  if (!obj || typeof obj !== 'object') return JSON.stringify(obj);
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = {};
  for (const key of sortedKeys) {
    sortedObj[key] = obj[key];
  }
  return JSON.stringify(sortedObj);
};

export function useWatchProgress() {
  const [gistToken, setGistToken] = useState(() => localStorage.getItem(GIST_TOKEN_KEY) || '');
  const [gistId, setGistId] = useState(() => localStorage.getItem(GIST_ID_KEY) || '');
  const [cloudStatus, setCloudStatus] = useState(gistToken && gistId ? 'connected' : 'disconnected'); // 'connected' | 'disconnected' | 'syncing' | 'error'
  const [syncError, setSyncError] = useState('');

  const [watchedIds, setWatchedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('Failed to load watch progress from localStorage:', e);
      return {};
    }
  });

  const lastSyncedWatchedIds = useRef(null);
  const initialCloudLoadDone = useRef(false);

  // Helper to fetch Gist data
  const fetchGistData = useCallback(async (token, id) => {
    if (!token || !id) return null;
    const response = await fetch(`https://api.github.com/gists/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }

    const gist = await response.json();
    const file = gist.files['marvel_watch_progress.json'];
    if (file && file.content) {
      return JSON.parse(file.content);
    }
    return {};
  }, []);

  // Helper to save Gist data
  const uploadGistData = useCallback(async (token, id, data) => {
    if (!token || !id) return;
    const response = await fetch(`https://api.github.com/gists/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          'marvel_watch_progress.json': {
            content: JSON.stringify(data || {})
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }
  }, []);

  // Helper to create a new Gist
  const createGist = useCallback(async (token, initialData) => {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Marvel Watch Tracker Progress',
        public: false,
        files: {
          'marvel_watch_progress.json': {
            content: JSON.stringify(initialData || {})
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }

    const gist = await response.json();
    return gist.id;
  }, []);

  // Memoized poll function for instant pulls
  const doPoll = useCallback(async () => {
    if (!gistToken || !gistId) return;
    // Skip background polling when the tab/window is hidden; the focus/visibilitychange
    // listener already triggers an instant pull when the app becomes visible again.
    if (document.hidden) return;
    try {
      const cloudData = await fetchGistData(gistToken, gistId);
      if (cloudData && typeof cloudData === 'object') {
        const strCloud = getSortedJsonString(cloudData);
        setWatchedIds((prev) => {
          const strLocal = getSortedJsonString(prev);
          // Only adopt cloud state when there are NO unsynced local changes.
          // If a local toggle is pending (not yet uploaded), keep local state so
          // the pending debounced upload wins instead of being silently reverted.
          const strSynced = getSortedJsonString(lastSyncedWatchedIds.current);
          const hasPendingLocal = lastSyncedWatchedIds.current !== null && strLocal !== strSynced;
          if (strCloud !== strLocal && !hasPendingLocal) {
            lastSyncedWatchedIds.current = cloudData;
            return cloudData;
          }
          return prev;
        });
      }
      initialCloudLoadDone.current = true;
      setCloudStatus((prev) => prev === 'syncing' ? 'syncing' : 'connected');
      setSyncError('');
    } catch (err) {
      console.error('Gist Polling Error:', err);
      setCloudStatus('error');
      setSyncError(err.message || 'Sync failed');
    }
  }, [gistToken, gistId, fetchGistData]);

  // 1. Gist Real-Time / Periodic Polling Sync (Runs every 30 seconds)
  useEffect(() => {
    if (!gistToken || !gistId) {
      setCloudStatus('disconnected');
      return;
    }

    setCloudStatus('connected');
    setSyncError('');

    // Initial pull on mount/link
    doPoll();

    // Poll every 30 seconds (battery/data friendly on mobile; focus pull covers resume)
    const interval = setInterval(doPoll, 30000);
    return () => clearInterval(interval);
  }, [gistToken, gistId, doPoll]);

  // 1b. Instant Pull on App Focus / Resume (Visible)
  useEffect(() => {
    if (!gistToken || !gistId) return;

    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        doPoll();
      }
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    return () => {
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
    };
  }, [gistToken, gistId, doPoll]);

  // 2. Load initial data from Electron desktop disk storage if available
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.loadProgress) {
      window.electronAPI.loadProgress().then((diskData) => {
        if (diskData && typeof diskData === 'object' && Object.keys(diskData).length > 0) {
          setWatchedIds((prev) => (Object.keys(prev).length === 0 ? diskData : prev));
        }
      });
    }
  }, []);

  // 3. Save progress to LocalStorage and Electron disk file immediately for responsiveness
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedIds));

      if (window.electronAPI && window.electronAPI.saveProgress) {
        window.electronAPI.saveProgress(watchedIds);
      }
    } catch (e) {
      console.error('Failed to save watch progress locally:', e);
    }
  }, [watchedIds]);

  // 4. Debounced cloud save to Gist to prevent API rate-limit thrashing
  useEffect(() => {
    if (!gistToken || !gistId || !initialCloudLoadDone.current) return;

    // Check if the current state is already identical to the last synced/loaded cloud data
    const strLocal = getSortedJsonString(watchedIds);
    const strSynced = getSortedJsonString(lastSyncedWatchedIds.current);
    if (strLocal === strSynced) {
      return;
    }

    setCloudStatus('syncing');

    const timer = setTimeout(() => {
      uploadGistData(gistToken, gistId, watchedIds)
        .then(() => {
          lastSyncedWatchedIds.current = watchedIds;
          setCloudStatus('connected');
          setSyncError('');
        })
        .catch((err) => {
          console.error('Gist Save Error:', err);
          setCloudStatus('error');
          setSyncError(err.message || 'Failed to save to cloud');
        });
    }, 750); // Fast 750ms debounce

    return () => clearTimeout(timer);
  }, [watchedIds, gistToken, gistId, uploadGistData]);

  const saveGistCredentials = useCallback(async (token, id) => {
    try {
      setCloudStatus('syncing');
      setSyncError('');

      let activeGistId = id;
      let merged = false;
      let localCount = 0;
      let cloudCount = 0;
      if (!activeGistId) {
        // Automatically create a new Secret Gist if the user leaves ID blank
        activeGistId = await createGist(token, watchedIds);
      } else {
        // Validate existing Gist ID
        const cloudData = await fetchGistData(token, activeGistId);
        if (cloudData && typeof cloudData === 'object') {
          // UNION merge: local wins ties, nothing is ever lost
          localCount = Object.keys(watchedIds).length;
          cloudCount = Object.keys(cloudData).length;
          const mergedData = { ...cloudData, ...watchedIds };
          setWatchedIds(mergedData);
          lastSyncedWatchedIds.current = mergedData;
          merged = true;
        }
      }

      localStorage.setItem(GIST_TOKEN_KEY, token);
      localStorage.setItem(GIST_ID_KEY, activeGistId);
      setGistToken(token);
      setGistId(activeGistId);
      setCloudStatus('connected');
      initialCloudLoadDone.current = true;
      return merged
        ? { success: true, gistId: activeGistId, merged: true, localCount, cloudCount }
        : { success: true, gistId: activeGistId, merged: false };
    } catch (err) {
      console.error('Failed to configure Gist Sync:', err);
      setCloudStatus('error');
      setSyncError(err.message || 'Configuration failed');
      return { success: false, error: err.message };
    }
  }, [watchedIds, createGist, fetchGistData]);

  const clearGistCredentials = useCallback(() => {
    localStorage.removeItem(GIST_TOKEN_KEY);
    localStorage.removeItem(GIST_ID_KEY);
    setGistToken('');
    setGistId('');
    setCloudStatus('disconnected');
    setSyncError('');
    initialCloudLoadDone.current = false;
  }, []);

  const toggleWatched = (id) => {
    setWatchedIds((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = new Date().toISOString();
      }
      return next;
    });
  };

  const markAllWatched = () => {
    const all = {};
    const now = new Date().toISOString();
    MARVEL_ITEMS.forEach((item) => {
      all[item.id] = now;
    });
    setWatchedIds(all);
  };

  const resetAllProgress = () => {
    setWatchedIds({});
  };

  // Import externally-provided progress (id -> ISO timestamp). Only plain objects
  // are accepted; the existing local state is fully replaced (App persists it).
  const importProgress = useCallback((ids) => {
    if (!ids || typeof ids !== 'object' || Array.isArray(ids)) return;
    setWatchedIds(ids);
  }, []);

  const stats = useMemo(() => {
    const totalCount = MARVEL_ITEMS.length;
    const watchedCount = Object.keys(watchedIds).length;
    const progressPercent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

    let watchedMinutes = 0;
    let totalMinutes = 0;
    let moviesWatched = 0;
    let totalMovies = 0;
    let seriesWatched = 0;
    let totalSeries = 0;

    const phaseStats = {
      1: { watched: 0, total: 0 },
      2: { watched: 0, total: 0 },
      3: { watched: 0, total: 0 },
      4: { watched: 0, total: 0 },
      5: { watched: 0, total: 0 },
      6: { watched: 0, total: 0 },
      99: { watched: 0, total: 0 },
    };

    MARVEL_ITEMS.forEach((item) => {
      totalMinutes += item.minutes || 0;
      if (item.type === 'movie') totalMovies++;
      if (item.type === 'series') totalSeries++;
      const pKey = item.phase || 99;
      if (phaseStats[pKey]) phaseStats[pKey].total++;

      if (watchedIds[item.id]) {
        watchedMinutes += item.minutes || 0;
        if (item.type === 'movie') moviesWatched++;
        if (item.type === 'series') seriesWatched++;
        if (phaseStats[pKey]) phaseStats[pKey].watched++;
      }
    });

    const watchedHours = (watchedMinutes / 60).toFixed(1);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return {
      totalCount,
      watchedCount,
      progressPercent,
      watchedMinutes,
      totalMinutes,
      watchedHours,
      totalHours,
      moviesWatched,
      totalMovies,
      seriesWatched,
      totalSeries,
      phaseStats,
    };
  }, [watchedIds]);

  return {
    watchedIds,
    toggleWatched,
    markAllWatched,
    resetAllProgress,
    stats,
    isWatched: (id) => !!watchedIds[id],
    gistToken,
    gistId,
    cloudStatus,
    syncError,
    saveGistCredentials,
    clearGistCredentials,
    importProgress,
  };
}
