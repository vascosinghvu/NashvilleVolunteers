export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatTime = (timeString: string): string => {
  // Handle full ISO string or just time string
  const time = timeString.includes('T') 
    ? new Date(timeString)
    : new Date(`1970-01-01T${timeString}`)

  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
} 