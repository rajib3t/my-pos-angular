/**
 * Date and Time utility functions
 */

/**
 * Formats a date string to display time in 12-hour format (HH:MM AM/PM)
 * @param dateString - The date string to format
 * @returns Formatted time string or empty string if no date provided
 */
export function formatTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a date string to display date in readable format
 * @param dateString - The date string to format
 * @returns Formatted date string or 'N/A' if no date provided
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats a date string to display both date and time
 * @param dateString - The date string to format
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = formatDate(dateString);
  const time = formatTime(dateString);
  return time ? `${date} ${time}` : date;
}