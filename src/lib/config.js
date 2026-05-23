export const CALENDAR_URL =
  process.env.REACT_APP_CALENDAR_URL ||
  'https://calendar.wagnis-projekte.de/wwest/63949869-a67d-0053-5554-648aac9ffcfd/';

export const DISPLAY_TZ = 'Europe/Berlin';

export const WINDOW_DAYS = 30;
export const LOOKBACK_DAYS = 1;

export const CACHE_KEY = 'calview:ics:v1';
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
