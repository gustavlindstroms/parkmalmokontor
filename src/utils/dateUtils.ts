import { parseISO, format, startOfWeek, addDays, subDays, isToday as isTodayFn, isTomorrow } from 'date-fns';
import { sv } from 'date-fns/locale';

/**
 * Get today's date as a YYYY-MM-DD string in local timezone
 * This is timezone-safe and will always return the current local date
 */
export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a date string (YYYY-MM-DD) to a Date object in local timezone
 * This avoids timezone issues that occur with new Date(dateString + 'T00:00:00')
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a date string (YYYY-MM-DD) to a Date object and return as ISO string
 * This ensures consistent formatting
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the Monday of the week for a given date string
 * Sunday belongs to the week that started on the previous Monday
 */
export function getWeekStart(dateString: string): Date {
  const date = parseISO(dateString);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (dayOfWeek === 0) {
    // If it's Sunday, go back 6 days to get to the Monday of that week
    return subDays(date, 6);
  } else {
    // Otherwise, return the Monday of the current week
    return startOfWeek(date, { weekStartsOn: 1 });
  }
}

/**
 * Get the Monday of the week for a given date string, returned as YYYY-MM-DD
 */
export function getWeekStartString(dateString: string): string {
  const monday = getWeekStart(dateString);
  return formatDateString(monday);
}

/**
 * Check if a date string represents today
 */
export function isToday(dateString: string): boolean {
  const date = parseISO(dateString);
  return isTodayFn(date);
}

/**
 * Check if a date string represents tomorrow
 */
export function isTomorrowDate(dateString: string): boolean {
  const date = parseISO(dateString);
  return isTomorrow(date);
}

/**
 * Compare two date strings (YYYY-MM-DD)
 * Returns negative if date1 < date2, positive if date1 > date2, 0 if equal
 */
export function compareDateStrings(date1: string, date2: string): number {
  return date1.localeCompare(date2);
}

/**
 * Format date for mobile display: "Mån 10 nov" (without dots)
 */
export function formatDateMobile(dateString: string): string {
  const date = parseISO(dateString);
  const weekdayShort = format(date, 'EEE', { locale: sv });
  const day = date.getDate();
  const monthShort = format(date, 'MMM', { locale: sv }).replace(/\./g, '');
  return `${weekdayShort} ${day} ${monthShort}`;
}

/**
 * Format date as short string: "10 nov" (without dots)
 * Returns "Idag" for today, "Imorgon" for tomorrow
 */
export function formatDateShort(dateString: string): string {
  if (isToday(dateString)) {
    return 'Idag';
  }
  if (isTomorrowDate(dateString)) {
    return 'Imorgon';
  }
  
  const date = parseISO(dateString);
  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  }).replace(/\./g, '');
}

/**
 * Format date as full header: "Måndag 10 november 2024"
 * Returns "Idag" for today, "Imorgon" for tomorrow
 */
export function formatDateHeader(dateString: string): string {
  if (isToday(dateString)) {
    return 'Idag';
  }
  if (isTomorrowDate(dateString)) {
    return 'Imorgon';
  }
  
  const date = parseISO(dateString);
  const dateStr = date.toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Capitalize first letter
  return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

/**
 * Get all weekdays (Monday-Friday) in a week for a given date string
 * Returns array of date info objects
 */
export interface WeekDateInfo {
  date: string;
  dayName: string;
  dateLabel: string;
  isToday: boolean;
}

export function getWeekDates(dateString: string): WeekDateInfo[] {
  const weekStart = getWeekStart(dateString);
  const dates: WeekDateInfo[] = [];
  const today = getToday();
  
  const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dayOfWeek = date.getDay();
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }
    
    const dateStr = formatDateString(date);
    const dayName = dayNames[dayOfWeek - 1]; // dayOfWeek is 1-5 for Mon-Fri
    const dateLabel = date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }).replace(/\./g, '');
    
    dates.push({
      date: dateStr,
      dayName,
      dateLabel,
      isToday: dateStr === today,
    });
  }
  
  return dates;
}

/**
 * Add days to a date string and return as date string
 */
export function addDaysToString(dateString: string, days: number): string {
  const date = parseISO(dateString);
  const newDate = addDays(date, days);
  return formatDateString(newDate);
}

/**
 * Subtract days from a date string and return as date string
 */
export function subDaysToString(dateString: string, days: number): string {
  const date = parseISO(dateString);
  const newDate = subDays(date, days);
  return formatDateString(newDate);
}

