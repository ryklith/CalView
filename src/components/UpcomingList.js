import React, { useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { formatTime, formatDayKey, formatDayHeader } from '../lib/tz';

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NavButton = styled.button`
  background: #2a2a2a;
  color: #ddd;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.95rem;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: #333; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const DaySection = styled.div`
  margin-top: 18px;

  &:first-of-type { margin-top: 8px; }
`;

const DayHeader = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(props) => (props.$today ? '#4ea8ff' : '#aaa')};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 6px 4px;
  border-bottom: 1px solid #2a2a2a;
  margin-bottom: 6px;
`;

const EventRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;

  &:hover { background: #2a2a2a; }
`;

const TimeCol = styled.div`
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
  color: #4ea8ff;
  min-width: 92px;
  flex-shrink: 0;
`;

const ContentCol = styled.div`
  flex: 1;
  min-width: 0;
`;

const EventTitle = styled.div`
  font-size: 1rem;
  color: white;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const EventLocation = styled.div`
  font-size: 0.85rem;
  color: #999;
  margin-top: 2px;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #888;
  padding: 32px 16px;
  font-size: 0.95rem;
`;

function formatRowTime(event) {
  if (event.allDay) return 'Ganztägig';
  return `${formatTime(event.start)}`;
}

function expandMultiDay(events, rangeStart, rangeEnd) {
  const out = [];
  for (const ev of events) {
    const startKey = formatDayKey(ev.start);
    const endTime = ev.allDay ? ev.end.getTime() - 1 : ev.end.getTime();
    const endKey = formatDayKey(new Date(endTime));

    if (startKey === endKey) {
      out.push({ ...ev, dayKey: startKey });
      continue;
    }

    let cursor = new Date(ev.start);
    cursor.setHours(12, 0, 0, 0);
    const lastDay = new Date(endTime);
    lastDay.setHours(12, 0, 0, 0);

    while (cursor <= lastDay) {
      const dayKey = formatDayKey(cursor);
      if (
        (!rangeStart || cursor >= rangeStart) &&
        (!rangeEnd || cursor <= rangeEnd)
      ) {
        out.push({ ...ev, dayKey });
      }
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  return out;
}

function UpcomingList({
  events,
  rangeStart,
  rangeEnd,
  onSelectEvent,
  onExtendBackward,
  onExtendForward,
  loading,
  scrollToDayKey,
}) {
  const containerRef = useRef(null);

  const grouped = useMemo(() => {
    const expanded = expandMultiDay(events, rangeStart, rangeEnd);
    expanded.sort((a, b) => {
      if (a.dayKey !== b.dayKey) return a.dayKey < b.dayKey ? -1 : 1;
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return a.start - b.start;
    });
    const map = new Map();
    for (const ev of expanded) {
      if (!map.has(ev.dayKey)) map.set(ev.dayKey, []);
      map.get(ev.dayKey).push(ev);
    }
    return Array.from(map.entries());
  }, [events, rangeStart, rangeEnd]);

  const todayKey = useMemo(() => formatDayKey(new Date()), []);

  useEffect(() => {
    if (!scrollToDayKey || !containerRef.current) return;
    const el = containerRef.current.querySelector(`[data-day="${scrollToDayKey}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [scrollToDayKey, grouped]);

  return (
    <ListWrapper ref={containerRef}>
      <NavButton onClick={onExtendBackward} disabled={loading}>
        ← Frühere anzeigen
      </NavButton>

      {grouped.length === 0 ? (
        <EmptyState>Keine Termine in den kommenden 30 Tagen.</EmptyState>
      ) : (
        grouped.map(([dayKey, dayEvents]) => (
          <DaySection key={dayKey} data-day={dayKey}>
            <DayHeader $today={dayKey === todayKey}>
              {formatDayHeader(dayEvents[0].start)}
            </DayHeader>
            {dayEvents.map((ev, i) => (
              <EventRow
                key={`${ev.id}-${i}`}
                onClick={() => onSelectEvent(ev)}
              >
                <TimeCol>{formatRowTime(ev)}</TimeCol>
                <ContentCol>
                  <EventTitle>{ev.title}</EventTitle>
                  {ev.location && <EventLocation>{ev.location}</EventLocation>}
                </ContentCol>
              </EventRow>
            ))}
          </DaySection>
        ))
      )}

      <NavButton onClick={onExtendForward} disabled={loading} style={{ marginTop: 18 }}>
        Spätere anzeigen →
      </NavButton>
    </ListWrapper>
  );
}

export default UpcomingList;
