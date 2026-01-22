/**
 * PendingChangesIndicator component
 * Shows how many expenses are pending sync when offline
 */

import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import { getPendingSyncExpenses } from '../services/indexeddb/index';
import { getUserIdFromToken } from '../shared/utils/jwtHelper';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function PendingChangesIndicator(): JSX.Element | null {
  const [pendingCount, setPendingCount] = useState(0);
  const { accessToken } = useAuth();
  const isOnline = useOnlineStatus();
  const userId = getUserIdFromToken(accessToken);

  useEffect(() => {
    if (!userId) {
      setPendingCount(0);
      return;
    }

    // Check pending expenses every 2 seconds
    const checkPending = async () => {
      try {
        const pending = await getPendingSyncExpenses(userId);
        setPendingCount(pending.length);
      } catch (error) {
        console.error('[PendingChangesIndicator] Error checking pending:', error);
        setPendingCount(0);
      }
    };

    // Check immediately
    checkPending();

    // Set up interval to check periodically
    const interval = setInterval(checkPending, 2000);

    return () => clearInterval(interval);
  }, [userId, isOnline]);

  // Don't show if no pending changes
  if (pendingCount === 0) {
    return null;
  }

  return (
    <Alert
      severity="info"
      sx={{
        mb: 2,
        borderRadius: 2,
      }}
    >
      {pendingCount} khoản chi đang chờ đồng bộ
    </Alert>
  );
}
