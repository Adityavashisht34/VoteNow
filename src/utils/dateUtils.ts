export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Format: Month Day, Year at HH:MM AM/PM
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

// Check if a date is in the past
export const isPast = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};

// Check if a date is in the future
export const isFuture = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

// Get a human-readable time remaining string
export const getTimeRemaining = (dateString: string): string => {
  const targetDate = new Date(dateString);
  const now = new Date();
  
  if (now > targetDate) {
    return 'Ended';
  }
  
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
  }
  
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`;
  }
  
  return 'Less than an hour left';
};