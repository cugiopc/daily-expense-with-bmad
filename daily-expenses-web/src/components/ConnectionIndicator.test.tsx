import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionIndicator } from './ConnectionIndicator';
import * as useOnlineStatusModule from '../hooks/useOnlineStatus';

describe('ConnectionIndicator', () => {
  it('should not render when online', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(true);

    const { container } = render(<ConnectionIndicator />);

    expect(container.firstChild).toBeNull();
  });

  it('should render offline banner when offline', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(false);

    render(<ConnectionIndicator />);

    expect(
      screen.getByText(/You're offline. Changes will sync when online/)
    ).toBeInTheDocument();
  });

  it('should have correct styling for offline banner', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(false);

    render(<ConnectionIndicator />);

    const alert = screen.getByRole('alert');

    expect(alert).toHaveClass('MuiAlert-standardWarning');
  });
});
