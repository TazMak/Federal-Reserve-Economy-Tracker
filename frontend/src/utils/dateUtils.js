import { format, parseISO, subYears, subMonths } from 'date-fns';

/**
 * Format a date string to display format
 * @param {string} dateString - ISO date string
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Get date range for time periods
 * @param {string} period - Time periods
 * @returns {Object} Start and end dates
 */
export const getDateRange = (period) => {
  const today = new Date();
  const endDate = format(today, 'yyyy-MM-dd');
  let startDate;

  switch (period) {
    case '1y':
      startDate = format(subYears(today, 1), 'yyyy-MM-dd');
      break;
    case '5y':
      startDate = format(subYears(today, 5), 'yyyy-MM-dd');
      break;
    case '10y':
      startDate = format(subYears(today, 10), 'yyyy-MM-dd');
      break;
    case 'ytd':
      startDate = `${today.getFullYear()}-01-01`;
      break;
    case '6m':
      startDate = format(subMonths(today, 6), 'yyyy-MM-dd');
      break;
    case 'all':
    default:
      startDate = format(subYears(today, 20), 'yyyy-MM-dd'); // default setting is to 20 years
      break;
  }

  return { startDate, endDate };
};