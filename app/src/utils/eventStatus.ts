export type EventStatus = 'upcoming' | 'soon' | 'past';

export const getEventStatus = (date: string): EventStatus => {
  const eventDate = new Date(date);
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  if (eventDate < now) {
    return 'past';
  } else if (eventDate <= threeDaysFromNow) {
    return 'soon';
  } else {
    return 'upcoming';
  }
};

export const getStatusColor = (status: EventStatus): string => {
  switch (status) {
    case 'upcoming':
      return 'var(--nash-color-green-1000)';
    case 'soon':
      return 'var(--nash-color-yellow-1000)';
    case 'past':
      return 'var(--nash-color-red-1000)';
    default:
      return 'var(--nash-color-dark-500)';
  }
};

export const getStatusText = (status: EventStatus): string => {
  switch (status) {
    case 'upcoming':
      return 'Registered';
    case 'soon':
      return 'Coming Soon';
    case 'past':
      return 'Past Event';
    default:
      return '';
  }
}; 