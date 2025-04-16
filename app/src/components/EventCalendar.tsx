import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Components, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Icon from './Icon';

// Match the EventData interface from VolunteerListings
interface EventData {
  event_id: number;
  o_id: number;
  date: string;
  people_needed: number;
  location: string;
  name: string;
  time: string;
  description: string;
  tags: string[];
  image_url?: string;
  link?: string;
}

interface EventCalendarProps {
  events: EventData[];
  onEventClick: (event: EventData) => void;
  organizationMap: { [key: number]: string };
}

const EventCalendar: React.FC<EventCalendarProps> = ({ 
  events, 
  onEventClick,
  organizationMap
}) => {
  const localizer = momentLocalizer(moment);
  const [calendarKey, setCalendarKey] = useState(0); // Add key for forced re-render
  const [calendarRef, setCalendarRef] = useState<any>(null);

  // Transform events to the format expected by react-big-calendar
  const calendarEvents = events.map(event => {
    // Parse the date and time
    const [year, month, day] = event.date.split('-');
    const [hours, minutes] = event.time.split(':');
    
    // Create start date
    const startDate = new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-based
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
    
    // End date (1 hour later by default)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    return {
      id: event.event_id,
      title: event.name,
      start: startDate,
      end: endDate,
      allDay: false,
      resource: event, // Store the original event object
    };
  });

  // Custom event component to display organization name
  const EventComponent = ({ event }: any) => {
    const originalEvent = event.resource as EventData;
    
    return (
      <div className="rbc-event-content">
        <strong>{event.title}</strong>
        <div>{organizationMap[originalEvent.o_id] || 'Unknown Organization'}</div>
      </div>
    );
  };

  // Custom toolbar component
  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    const goToPrev = () => {
      toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };

    const label = () => {
      const date = moment(toolbar.date);
      return (
        <span>{date.format('MMMM YYYY')}</span>
      );
    };

    return (
      <div className="rbc-toolbar">
        <div className="Calendar-nav-container">
          <button 
            type="button" 
            onClick={goToPrev}
            className="Calendar-nav-button"
            aria-label="Previous"
          >
            <Icon glyph="chevron-left" />
          </button>
          <button 
            type="button" 
            onClick={goToToday}
            className="Calendar-nav-button Calendar-nav-today"
          >
            Today
          </button>
          <button 
            type="button" 
            onClick={goToNext}
            className="Calendar-nav-button"
            aria-label="Next"
          >
            <Icon glyph="chevron-right" />
          </button>
          <div className="rbc-toolbar-label">{label()}</div>
        </div>
        
        <div className="Calendar-view-buttons">
          <button
            type="button"
            className={toolbar.view === 'month' ? 'Calendar-view-button active' : 'Calendar-view-button'}
            onClick={() => toolbar.onView('month')}
          >
            Month
          </button>
          <button
            type="button"
            className={toolbar.view === 'week' ? 'Calendar-view-button active' : 'Calendar-view-button'}
            onClick={() => toolbar.onView('week')}
          >
            Week
          </button>
          <button
            type="button"
            className={toolbar.view === 'agenda' ? 'Calendar-view-button active' : 'Calendar-view-button'}
            onClick={() => toolbar.onView('agenda')}
          >
            List
          </button>
        </div>
      </div>
    );
  };

  // Define custom components
  const components: Components = {
    event: EventComponent,
    toolbar: CustomToolbar
  };

  // Handle event selection - a more aggressive approach
  const handleSelectEvent = useCallback((event: any) => {
    // Immediately call the parent's click handler
    onEventClick(event.resource);
    
    // Force a re-render to clear selection
    setTimeout(() => {
      setCalendarKey(prev => prev + 1);
    }, 50);
  }, [onEventClick]);

  return (
    <div className="EventCalendar">
      <Calendar
        key={calendarKey}
        ref={setCalendarRef}
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 750 }}
        onSelectEvent={handleSelectEvent}
        components={components}
        views={['month', 'week', 'agenda']}
        selectable={false}
      />
    </div>
  );
};

export default EventCalendar; 
