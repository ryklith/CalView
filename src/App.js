import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import Calendar from './components/Calendar';
import UpcomingList from './components/UpcomingList';
import EventSheet from './components/EventSheet';
import { fetchRawIcs, refreshIcs, expandEventsBetween } from './caldavService';
import { WINDOW_DAYS, LOOKBACK_DAYS } from './lib/config';
import { addDays, formatDayKey, formatMonthYear, startOfBerlinDay } from './lib/tz';

const Page = styled.div`
  min-height: 100vh;
  background: #121212;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 720px;
  padding: 16px;
  box-sizing: border-box;

  @media (min-width: 700px) {
    padding: 32px 24px;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: #2a2a2a;
  border: 1px solid #333;
  color: #ddd;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: #333;
    color: white;
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const SpinIcon = styled.span`
  display: inline-block;
  animation: ${({ $spinning }) => ($spinning ? spin : 'none')} 0.9s linear infinite;
`;

const ErrorBanner = styled.div`
  background: #3a1f1f;
  color: #f5b8b8;
  border: 1px solid #5a2a2a;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 0.9rem;
`;

const LoadingHint = styled.div`
  text-align: center;
  color: #888;
  padding: 48px 16px;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 700px) {
    align-items: center;
  }
`;

const ModalContent = styled.div`
  background: #1e1e1e;
  width: 100%;
  max-width: 520px;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  box-sizing: border-box;

  @media (min-width: 700px) {
    border-radius: 12px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 4px;
`;

const ModalTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #ddd;
`;

const CloseModalBtn = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 4px 8px;
  &:hover { color: white; }
`;

function App() {
  const today = useMemo(() => startOfBerlinDay(new Date()), []);
  const initialStart = useMemo(() => addDays(today, -LOOKBACK_DAYS), [today]);
  const initialEnd = useMemo(() => addDays(today, WINDOW_DAYS), [today]);

  const [rawIcs, setRawIcs] = useState(null);
  const [rangeStart, setRangeStart] = useState(initialStart);
  const [rangeEnd, setRangeEnd] = useState(initialEnd);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [gridOpen, setGridOpen] = useState(false);
  const [gridActiveDate, setGridActiveDate] = useState(today);
  const [scrollToDayKey, setScrollToDayKey] = useState(null);

  const loadIcs = useCallback(async (opts = {}) => {
    try {
      setError(null);
      const ics = opts.bypass ? await refreshIcs() : await fetchRawIcs();
      setRawIcs(ics);
      return ics;
    } catch (e) {
      console.error('Failed to fetch calendar:', e);
      setError('Kalender konnte nicht geladen werden.');
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const ics = await loadIcs();
      if (ics) {
        setEvents(expandEventsBetween(ics, initialStart, initialEnd));
      }
      setLoading(false);
    })();
  }, [loadIcs, initialStart, initialEnd]);

  useEffect(() => {
    if (!rawIcs) return;
    setEvents(expandEventsBetween(rawIcs, rangeStart, rangeEnd));
  }, [rawIcs, rangeStart, rangeEnd]);

  const handleExtendBackward = useCallback(() => {
    setRangeStart((prev) => addDays(prev, -WINDOW_DAYS));
  }, []);

  const handleExtendForward = useCallback(() => {
    setRangeEnd((prev) => addDays(prev, WINDOW_DAYS));
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadIcs({ bypass: true });
    setRefreshing(false);
  }, [loadIcs]);

  const handleGridMonthChange = useCallback(
    (newActiveDate) => {
      setGridActiveDate(newActiveDate);
      const monthStart = new Date(newActiveDate.getFullYear(), newActiveDate.getMonth(), 1);
      const monthEnd = new Date(newActiveDate.getFullYear(), newActiveDate.getMonth() + 1, 0, 23, 59, 59);
      if (monthStart < rangeStart) setRangeStart(monthStart);
      if (monthEnd > rangeEnd) setRangeEnd(monthEnd);
    },
    [rangeStart, rangeEnd]
  );

  const handleGridSelectDate = useCallback(
    (date) => {
      const dayStart = startOfBerlinDay(date);
      if (dayStart < rangeStart) setRangeStart(dayStart);
      if (dayStart > rangeEnd) setRangeEnd(addDays(dayStart, 1));
      setScrollToDayKey(formatDayKey(date));
      setGridOpen(false);
    },
    [rangeStart, rangeEnd]
  );

  useEffect(() => {
    if (!scrollToDayKey) return;
    const t = setTimeout(() => setScrollToDayKey(null), 1500);
    return () => clearTimeout(t);
  }, [scrollToDayKey]);

  return (
    <Page>
      <Container>
        <Header>
          <Title>Kalender</Title>
          <HeaderActions>
            <IconButton
              onClick={() => setGridOpen(true)}
              aria-label="Datum wählen"
              title="Datum wählen"
            >
              📅
            </IconButton>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Aktualisieren"
              title="Aktualisieren"
            >
              <SpinIcon $spinning={refreshing}>↻</SpinIcon>
            </IconButton>
          </HeaderActions>
        </Header>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        {loading ? (
          <LoadingHint>Lade Termine…</LoadingHint>
        ) : (
          <UpcomingList
            events={events}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onSelectEvent={setSelectedEvent}
            onExtendBackward={handleExtendBackward}
            onExtendForward={handleExtendForward}
            loading={refreshing}
            scrollToDayKey={scrollToDayKey}
          />
        )}
      </Container>

      {gridOpen && (
        <ModalBackdrop onClick={(e) => { if (e.target === e.currentTarget) setGridOpen(false); }}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{formatMonthYear(gridActiveDate)}</ModalTitle>
              <CloseModalBtn onClick={() => setGridOpen(false)} aria-label="Schließen">×</CloseModalBtn>
            </ModalHeader>
            <Calendar
              events={events}
              activeStartDate={gridActiveDate}
              onActiveStartDateChange={handleGridMonthChange}
              onSelectDate={handleGridSelectDate}
            />
          </ModalContent>
        </ModalBackdrop>
      )}

      {selectedEvent && (
        <EventSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </Page>
  );
}

export default App;
