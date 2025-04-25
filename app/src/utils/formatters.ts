import {addLeadingZero} from '../utils/dateUtils';
import {formatDate} from '../utils/dateUtils';
import { format } from 'date-fns';
export const formatCurrency = (
  value: number | null | undefined,
  digitsInfo: string = '1.2-2',
  currencyCode: string = 'USD',
  symbol: boolean = true
): string => {
  if (value == null) return '';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: symbol ? 'symbol' : 'code'
  });

  return formatter.format(value);
};

export const formatPhone = (value: number): string => {
  return (value || '').toString().replace(/(\d{1})(\d{2})(\d{2})(\d{3})/, '0$1-$2-$3-$4');
};

export const formatMinutesToHours = (value: number): string => {
  const hours = Math.floor(value / 60);
  const minutes = Math.floor(value % 60);
  return `${hours}h ${minutes}m`;
};

export const formatAmPm = (value: string): string => {
  const [hours, minutes] = value.split(':');
  if (Number(hours) >= 12) {
    return `${addLeadingZero(Number(hours) - 12 || 12)}:${minutes}PM`;
  }
  return value + 'AM';
};

export const formatExpiryDate = (value: Date | string): string => {
  const date = new Date(value);
  if (date.getFullYear() > 2900) {
    return 'Never';
  }
  return formatDate(date);
};

export const checkExpiry = (value: Date | string): string => {
  const date = new Date(value);
  if (date.getFullYear() > 2900) {
    return 'Never';
  }
  return format(date, 'dd/MM/yyyy');
};


export const formatDateLocalString = (dateString: string): string => {
  const date = new Date(dateString); // Current date
  
  // Format the date to "Apr 15, 2025" format
  return date.toLocaleDateString('en-US', {
    month: 'short', // "Apr"
    day: 'numeric',  // "15"
    year: 'numeric', // "2025"
  });
};

export const formatDateTimeLocalString = (dateString: string): string => {
  const date = new Date(dateString); // Current date
  
  // Format the date to "Apr 15, 2025" format
  return format(date, 'MMM d, yyyy h:mm a');
};