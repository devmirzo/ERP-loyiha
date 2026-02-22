/**
 * Format a phone number to a human-readable format.
 * Expects a string of digits, e.g., "998901234567"
 * Returns "+998 (90) 123-45-67"
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Check if it's an Uzbekistan number (12 digits starting with 998)
  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    const country = cleaned.slice(0, 3);
    const code = cleaned.slice(3, 5);
    const part1 = cleaned.slice(5, 8);
    const part2 = cleaned.slice(8, 10);
    const part3 = cleaned.slice(10, 12);
    return `+${country} (${code}) ${part1}-${part2}-${part3}`;
  }
  
  // If it's a 9 digit number (assuming local UZ without 998)
  if (cleaned.length === 9) {
    const code = cleaned.slice(0, 2);
    const part1 = cleaned.slice(2, 5);
    const part2 = cleaned.slice(5, 7);
    const part3 = cleaned.slice(7, 9);
    return `+998 (${code}) ${part1}-${part2}-${part3}`;
  }

  // Fallback
  return phone;
};

/**
 * Format a date string to DD.MM.YYYY
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

/**
 * Format a time string to HH:MM
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};
