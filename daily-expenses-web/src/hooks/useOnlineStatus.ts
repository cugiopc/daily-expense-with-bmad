import { useState, useEffect } from 'react';
import { getOnlineStatus } from '../services/offline/connectionManager';

/**
 * Custom hook to track online/offline status
 * @returns boolean indicating if the user is online
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(getOnlineStatus());

  useEffect(() => {
    const handleOnline = (): void => {
      console.log('[ConnectionManager] Connection restored - online');
      setIsOnline(true);
    };

    const handleOffline = (): void => {
      console.log('[ConnectionManager] Connection lost - offline');
      setIsOnline(false);
    };

    // Listen to online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
