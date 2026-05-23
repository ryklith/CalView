import { CACHE_KEY, CACHE_TTL_MS } from './config';

export function getCachedIcs() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ics, ts } = JSON.parse(raw);
    if (typeof ts !== 'number' || typeof ics !== 'string') return null;
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return ics;
  } catch {
    return null;
  }
}

export function setCachedIcs(ics) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ics, ts: Date.now() }));
  } catch {
    // localStorage full or disabled — silently skip
  }
}

export function clearCachedIcs() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
