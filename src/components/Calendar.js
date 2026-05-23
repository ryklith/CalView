import React, { useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styled from 'styled-components';
import { formatDayKey } from '../lib/tz';
import './Calendar.css';

const CalendarWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

function CustomCalendar({ events, activeStartDate, onActiveStartDateChange, onSelectDate }) {
  const dayMap = useMemo(() => {
    const map = new Set();
    for (const ev of events) {
      const endTime = ev.allDay ? ev.end.getTime() - 1 : ev.end.getTime();
      let cursor = new Date(ev.start);
      cursor.setHours(12, 0, 0, 0);
      const last = new Date(endTime);
      last.setHours(12, 0, 0, 0);
      while (cursor <= last) {
        map.add(formatDayKey(cursor));
        cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
      }
    }
    return map;
  }, [events]);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    if (dayMap.has(formatDayKey(date))) {
      return <div className="event-dot" />;
    }
    return null;
  };

  return (
    <CalendarWrapper>
      <Calendar
        locale="de-DE"
        onClickDay={(date) => onSelectDate(date)}
        tileContent={tileContent}
        activeStartDate={activeStartDate}
        onActiveStartDateChange={({ activeStartDate: d }) => onActiveStartDateChange(d)}
        value={null}
      />
    </CalendarWrapper>
  );
}

export default CustomCalendar;
