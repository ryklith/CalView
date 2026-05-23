import React, { useEffect } from 'react';
import styled from 'styled-components';
import { formatTime, formatFullDate, formatDayKey } from '../lib/tz';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: 700px) {
    align-items: center;
  }
`;

const Sheet = styled.div`
  background: #1e1e1e;
  color: white;
  width: 100%;
  max-width: 560px;
  border-radius: 16px 16px 0 0;
  padding: 24px 20px 32px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);

  @media (min-width: 700px) {
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.3;
  font-weight: 700;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.6rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  flex-shrink: 0;

  &:hover { color: white; }
`;

const Meta = styled.div`
  color: #ccc;
  font-size: 0.95rem;
  margin-bottom: 6px;
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid #333;
  margin: 16px 0;
`;

const FieldLabel = styled.div`
  color: #888;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
`;

const FieldValue = styled.div`
  color: #eee;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 0.95rem;
  line-height: 1.45;

  a {
    color: #4ea8ff;
    word-break: break-all;
  }
`;

const urlRegex = /(https?:\/\/[^\s]+)/g;

function linkify(text) {
  if (!text) return null;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function formatTimeRange(event) {
  if (event.allDay) {
    const sameDay = formatDayKey(event.start) === formatDayKey(new Date(event.end.getTime() - 1));
    if (sameDay) return 'Ganztägig';
    return `Ganztägig (${formatFullDate(event.start)} – ${formatFullDate(new Date(event.end.getTime() - 1))})`;
  }
  const sameDay = formatDayKey(event.start) === formatDayKey(event.end);
  if (sameDay) return `${formatTime(event.start)} – ${formatTime(event.end)} Uhr`;
  return `${formatFullDate(event.start)} ${formatTime(event.start)} – ${formatFullDate(event.end)} ${formatTime(event.end)}`;
}

function EventSheet({ event, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!event) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Sheet>
        <Header>
          <Title>{event.title}</Title>
          <CloseButton onClick={onClose} aria-label="Schließen">×</CloseButton>
        </Header>
        <Meta>{formatFullDate(event.start)}</Meta>
        <Meta>{formatTimeRange(event)}</Meta>
        {event.location && (
          <>
            <Divider />
            <FieldLabel>Ort</FieldLabel>
            <FieldValue>{linkify(event.location)}</FieldValue>
          </>
        )}
        {event.description && (
          <>
            <Divider />
            <FieldLabel>Beschreibung</FieldLabel>
            <FieldValue>{linkify(event.description)}</FieldValue>
          </>
        )}
      </Sheet>
    </Backdrop>
  );
}

export default EventSheet;
