// Utility functions for formatting numbers and currency

/**
 * Format number with thousand separators using Indonesian locale
 * @param value - The numeric value to format
 * @returns Formatted string with thousand separators (e.g., "500.000")
 */
export const formatNumber = (value: string | number): string => {
  if (typeof value === 'string') {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue === '') return '';
    
    // Convert to number and format with thousand separators
    const number = parseInt(numericValue, 10);
    return number.toLocaleString('id-ID');
  }
  
  return value.toLocaleString('id-ID');
};

/**
 * Parse formatted number back to numeric value
 * @param value - The formatted string (e.g., "500.000")
 * @returns Numeric string without separators (e.g., "500000")
 */
export const parseFormattedNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Format currency in Indonesian Rupiah
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "Rp 500.000")
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Format currency from formatted string
 * @param value - The formatted string (e.g., "500.000")
 * @returns Formatted currency string (e.g., "Rp 500.000")
 */
export const formatCurrencyFromString = (value: string): string => {
  const numericValue = parseFormattedNumber(value);
  if (numericValue === '') return '';
  
  const number = parseInt(numericValue, 10);
  return formatCurrency(number);
};
