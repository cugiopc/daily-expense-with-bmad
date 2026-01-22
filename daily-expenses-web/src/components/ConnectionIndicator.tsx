import { Alert } from '@mui/material';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * ConnectionIndicator Component
 * Displays a banner at the top when offline
 */
export function ConnectionIndicator(): JSX.Element | null {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <Alert
      severity="warning"
      sx={{
        borderRadius: 0,
        justifyContent: 'center',
      }}
    >
      You're offline. Changes will sync when online.
    </Alert>
  );
}
