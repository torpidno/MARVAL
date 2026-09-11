export const VIEW_MODES = Object.freeze({
  TIMELINE: 'timeline',
  DASHBOARD: 'dashboard',
});

export const SORT_MODES = Object.freeze({
  CHRONO: 'chrono',
  RELEASE: 'release',
});

export const MEDIA_TYPES = Object.freeze({
  ALL: 'all',
  MOVIE: 'movie',
  SERIES: 'series',
  SPECIAL: 'special',
});

export const STATUS_FILTERS = Object.freeze({
  ALL: 'all',
  WATCHED: 'watched',
  UNWATCHED: 'unwatched',
});

export const PHASE_FILTERS = Object.freeze({
  ALL: 'all',
  PHASE_1: 1,
  PHASE_2: 2,
  PHASE_3: 3,
  PHASE_4: 4,
  PHASE_5: 5,
});

export const UI_CONFIG = Object.freeze({
  MAX_SEARCH_PREVIEW_TAGS: 2,
  DEFAULT_GRID_MIN_WIDTH: '260px',
  BACKUP_FILENAME_PREFIX: 'marvel_watch_progress',
  LOCAL_STORAGE_KEY: 'marvel_watch_progress_v1',
  TOAST_DURATION_MS: 3500,
});
