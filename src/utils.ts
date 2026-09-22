/**
 * Formats a date string to "Hari, DD/MM/YYYY"
 * Example: "Senin, 15/09/2026"
 */
export const formatDateLong = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  try {
    // Handle formats like "2026-03-20 09:00" or "2026-03-20T09:00"
    // Also handle just date "2026-03-20"
    const cleanDateStr = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
    const date = new Date(cleanDateStr);
    
    if (isNaN(date.getTime())) return dateStr;

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch (e) {
    return dateStr;
  }
};

/**
 * Formats a date string to "DD/MM/YYYY"
 */
export const formatDateShort = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  try {
    const cleanDateStr = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
    const date = new Date(cleanDateStr);
    
    if (isNaN(date.getTime())) return dateStr;

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch (e) {
    return dateStr;
  }
};
