import IcalExpander from 'ical-expander';
import { CALENDAR_URL } from './lib/config';
import { getCachedIcs, setCachedIcs, clearCachedIcs } from './lib/cache';

export async function fetchRawIcs({ bypassCache = false } = {}) {
  if (!bypassCache) {
    const cached = getCachedIcs();
    if (cached) return cached;
  }

  const response = await fetch(CALENDAR_URL, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Calendar fetch failed: HTTP ${response.status}`);
  }
  const ics = await response.text();
  setCachedIcs(ics);
  return ics;
}

export function refreshIcs() {
  clearCachedIcs();
  return fetchRawIcs({ bypassCache: true });
}

let cachedExpander = null;
let cachedIcsRef = null;

function getExpander(ics) {
  if (cachedExpander && cachedIcsRef === ics) return cachedExpander;
  cachedExpander = new IcalExpander({ ics, maxIterations: 1000 });
  cachedIcsRef = ics;
  return cachedExpander;
}

function normalize(item, startDate, endDate) {
  const isAllDay = startDate.isDate === true;
  return {
    id: `${item.uid}__${startDate.toJSDate().getTime()}`,
    uid: item.uid,
    title: item.summary || '(ohne Titel)',
    start: startDate.toJSDate(),
    end: endDate.toJSDate(),
    allDay: isAllDay,
    location: item.location || '',
    description: item.description || '',
  };
}

export function expandEventsBetween(ics, start, end) {
  const expander = getExpander(ics);
  const { events, occurrences } = expander.between(start, end);

  const out = [];
  for (const e of events) {
    out.push(normalize(e, e.startDate, e.endDate));
  }
  for (const o of occurrences) {
    out.push(normalize(o.item, o.startDate, o.endDate));
  }
  out.sort((a, b) => a.start - b.start);
  return out;
}
