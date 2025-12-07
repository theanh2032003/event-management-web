import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Enable plugins
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

// Set default timezone to Asia/Ho_Chi_Minh (GMT+7)
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

/**
 * Parse date from API (handles ISO string with timezone)
 * Always converts to local timezone (Asia/Ho_Chi_Minh)
 * @param {string|Date} dateString - Date string from API
 * @returns {dayjs.Dayjs} Dayjs object in local timezone
 */
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Parse UTC/ISO date and convert to local timezone
    return dayjs(dateString).tz('Asia/Ho_Chi_Minh');
  } catch (e) {
    console.error('Error parsing date:', e, 'Input:', dateString);
    return null;
  }
};

/**
 * Format date time for display in table/list
 * Format: dd/MM/yyyy HH:mm (24-hour format)
 * Displays the exact time from server without timezone conversion
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string or "N/A" if invalid
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    // Parse the date string as-is and extract the date/time components
    // This preserves the exact time values from the server
    const date = dayjs(dateString);
    if (!date.isValid()) return "N/A";
    
    return date.format('DD/MM/YYYY HH:mm');
  } catch (e) {
    console.error('Error formatting date:', e);
    return "N/A";
  }
};

/**
 * Format date only (without time)
 * Format: dd/MM/yyyy
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string or "N/A" if invalid
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    const date = dayjs.utc(dateString);
    if (!date.isValid()) return "N/A";
    
    return date.format('DD/MM/YYYY');
  } catch (e) {
    console.error('Error formatting date:', e);
    return "N/A";
  }
};

/**
 * Format time only (without date)
 * Format: HH:mm (24-hour format)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted time string or "N/A" if invalid
 */
export const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    const date = dayjs.utc(dateString);
    if (!date.isValid()) return "N/A";
    
    return date.format('HH:mm');
  } catch (e) {
    console.error('Error formatting time:', e);
    return "N/A";
  }
};

/**
 * Format date time for datetime-local input
 * Format: yyyy-MM-ddTHH:mm
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted string for datetime-local input
 */
export const formatDateTimeLocal = (dateString) => {
  if (!dateString) return "";
  
  try {
    const date = dayjs.utc(dateString);
    if (!date.isValid()) return "";
    
    
    return date.format('YYYY-MM-DDTHH:mm');
  } catch (e) {
    console.error('Error formatting datetime-local:', e);
    return "";
  }
};

/**
 * Get current date time formatted for datetime-local input
 * @returns {string} Current datetime in yyyy-MM-ddTHH:mm format
 */
export const getCurrentDateTimeLocal = () => {
  return dayjs().format('YYYY-MM-DDTHH:mm');
};

/**
 * Format child schedule time based on parent schedule
 * - If child is on same day as parent: show only time (HH:mm)
 * - If child is on different day: show date and time (dd/MM HH:mm)
 * 
 * @param {string|Date} childDate - Child schedule date
 * @param {string|Date} parentStartDate - Parent schedule start date
 * @param {string|Date} parentEndDate - Parent schedule end date
 * @returns {string} Formatted string based on date comparison
 */
export const formatChildScheduleTime = (childDate, parentStartDate, parentEndDate) => {
  if (!childDate) return "N/A";
  
  try {
    const child = dayjs.utc(childDate);
    const parentStart = dayjs.utc(parentStartDate);
    const parentEnd = dayjs.utc(parentEndDate);
    
    if (!child.isValid() || !parentStart.isValid() || !parentEnd.isValid()) {
      return "N/A";
    }
    
    // Check if child date is on the same day as parent start or parent end
    const isSameDayAsStart = child.isSame(parentStart, 'day');
    const isSameDayAsEnd = child.isSame(parentEnd, 'day');
    
    if (isSameDayAsStart || isSameDayAsEnd) {
      // Same day: show only time
      return child.format('HH:mm');
    } else {
      // Different day: show date and time
      return child.format('DD/MM HH:mm');
    }
  } catch (e) {
    console.error('Error formatting child schedule time:', e);
    return "N/A";
  }
};

/**
 * Format time range for display
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string} Formatted time range
 */
export const formatTimeRange = (startDate, endDate) => {
  const start = formatDateTime(startDate);
  const end = formatDateTime(endDate);
  
  if (start === "N/A" || end === "N/A") return "N/A";
  
  return `${start} - ${end}`;
};

/**
 * Check if two dates are on the same day
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {boolean} True if same day, false otherwise
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  try {
    return dayjs.utc(date1).isSame(dayjs.utc(date2), 'day');
  } catch (e) {
    console.error('Error comparing dates:', e);
    return false;
  }
};

/**
 * Validate if date1 is before date2
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {boolean} True if date1 is before date2
 */
export const isBefore = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  try {
    return dayjs.utc(date1).isBefore(dayjs.utc(date2));
  } catch (e) {
    console.error('Error comparing dates:', e);
    return false;
  }
};

/**
 * Validate if date is within range
 * @param {string|Date} date - Date to check
 * @param {string|Date} startDate - Range start date
 * @param {string|Date} endDate - Range end date
 * @returns {boolean} True if date is within range
 */
export const isWithinRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  
  try {
    const checkDate = dayjs.utc(date);
    const start = dayjs.utc(startDate);
    const end = dayjs.utc(endDate);
    
    return checkDate.isSameOrAfter(start) && checkDate.isSameOrBefore(end);
  } catch (e) {
    console.error('Error checking date range:', e);
    return false;
  }
};

/**
 * Parse datetime-local input value to ISO string with +00:00 timezone
 * (Backend expects local time with +00:00 suffix)
 * @param {string} dateTimeLocalValue - Value from datetime-local input
 * @returns {string} ISO string with +00:00 timezone
 */
export const parseDateTimeLocal = (dateTimeLocalValue) => {
  if (!dateTimeLocalValue) return "";
  
  try {
    // Parse as local time and convert to ISO string with +00:00 suffix
    const isoString = dayjs(dateTimeLocalValue).toISOString();
    // Replace Z with +00:00 to match backend expectation
    return isoString.replace('Z', '+00:00');
  } catch (e) {
    console.error('Error parsing datetime-local:', e);
    return "";
  }
};

export default {
  formatDateTime,
  formatDate,
  formatTime,
  formatDateTimeLocal,
  getCurrentDateTimeLocal,
  formatChildScheduleTime,
  formatTimeRange,
  isSameDay,
  isBefore,
  isWithinRange,
  parseDateTimeLocal,
};
