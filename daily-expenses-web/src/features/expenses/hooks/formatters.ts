import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Get date header label for expense groups
 * @param date - Date to format
 * @returns "Hôm nay", "Hôm qua", or formatted date string
 */
export function getDateHeader(date: Date): string {
  if (isToday(date)) {
    return 'Hôm nay';
  }
  
  if (isYesterday(date)) {
    return 'Hôm qua';
  }
  
  // Format as "15 Tháng 1, 2026"
  return format(date, 'd MMMM, yyyy', { locale: vi });
}

/**
 * Format currency in Vietnamese format
 * @param amount - Amount in VND
 * @returns Formatted currency string (e.g., "50.000₫")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format time in 12-hour format with AM/PM
 * @param date - Date to format
 * @returns Formatted time string (e.g., "9:30 AM")
 */
export function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}
