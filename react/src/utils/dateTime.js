export const TIME_SLOTS = [
  { value: '09:00', label: '9:00 AM', range: '9:00 AM - 11:00 AM' },
  { value: '11:00', label: '11:00 AM', range: '11:00 AM - 1:00 PM' },
  { value: '13:00', label: '1:00 PM', range: '1:00 PM - 3:00 PM' },
  { value: '15:00', label: '3:00 PM', range: '3:00 PM - 5:00 PM' },
];

export function formatBookingDate(dateValue) {
  if (!dateValue) return '-';

  const parsedDate = typeof dateValue === 'string' && dateValue.includes('T')
    ? new Date(dateValue)
    : new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
}

export function formatTimeSlot(timeValue) {
  const slot = TIME_SLOTS.find((item) => item.value === timeValue);
  return slot?.range || timeValue || '-';
}
