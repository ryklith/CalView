import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { de } from 'date-fns/locale';
import { isSameDay } from 'date-fns';
import { DISPLAY_TZ } from './config';

export function berlinDate(date) {
  return toZonedTime(date, DISPLAY_TZ);
}

export function formatTime(date) {
  return formatInTimeZone(date, DISPLAY_TZ, 'HH:mm', { locale: de });
}

export function formatDayKey(date) {
  return formatInTimeZone(date, DISPLAY_TZ, 'yyyy-MM-dd');
}

export function formatDayHeader(date) {
  const today = berlinDate(new Date());
  const target = berlinDate(date);
  if (isSameDay(today, target)) return 'Heute';
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(tomorrow, target)) return 'Morgen';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(yesterday, target)) return 'Gestern';
  return formatInTimeZone(date, DISPLAY_TZ, 'EEEE, d. MMMM yyyy', { locale: de });
}

export function formatFullDate(date) {
  return formatInTimeZone(date, DISPLAY_TZ, 'EEEE, d. MMMM yyyy', { locale: de });
}

export function formatMonthYear(date) {
  return formatInTimeZone(date, DISPLAY_TZ, 'MMMM yyyy', { locale: de });
}

export function startOfBerlinDay(date) {
  const zoned = berlinDate(date);
  zoned.setHours(0, 0, 0, 0);
  return zoned;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
