/**
 * Connection Manager
 * Handles online/offline state detection
 */

/**
 * Get current online status
 */
export function getOnlineStatus(): boolean {
  return navigator.onLine;
}
