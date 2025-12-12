/**
 * Utility functions for tracking number generation and management
 */

/**
 * Generate a tracking number based on order ID and current time
 * Format: TRK-YYYYMMDD-HHMMSS-XXXXXX
 * Example: TRK-20251212-105345-123456
 */
export function generateTrackingNumber(orderId) {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const datePart = `${year}${month}${day}`;
  const timePart = `${hours}${minutes}${seconds}`;

  // Generate 6-digit unique identifier based on order ID and time
  const orderHash = Math.abs(orderId * 1234567).toString().slice(-6);
  const randomPart = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

  // Combine order hash and random for uniqueness
  const uniquePart = (parseInt(orderHash) + parseInt(randomPart)).toString().slice(-6);

  return `TRK-${datePart}-${timePart}-${uniquePart}`;
}

/**
 * Generate a shipping carrier based on shipping method
 */
export function getShippingCarrier(shippingMethod) {
  const carriers = {
    standard: 'USPS',
    express: 'FedEx',
    overnight: 'FedEx',
    economy: 'USPS'
  };

  return carriers[shippingMethod] || 'UPS';
}

/**
 * Format tracking number for display
 */
export function formatTrackingNumber(trackingNumber) {
  return trackingNumber.replace(/TRK-(\d{8})-(\d{6})-(\d{6})/, 'TRK-$1-$2-$3');
}