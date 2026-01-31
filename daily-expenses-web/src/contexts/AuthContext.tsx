/**
 * AuthContext - Centralized Authentication State Management
 * 
 * SECURITY ARCHITECTURE DECISION:
 * ==============================
 * Access tokens are stored in React state (memory) rather than localStorage/sessionStorage.
 * 
 * WHY MEMORY STORAGE:
 * - XSS Protection: JavaScript-based attacks cannot access memory-stored tokens
 * - localStorage is vulnerable to XSS: Any injected script can read/steal tokens
 * - sessionStorage has similar vulnerabilities to localStorage
 * - Memory is cleared on page refresh (acceptable trade-off for security)
 * 
 * HOW IT WORKS WITH REFRESH TOKENS:
 * - Refresh tokens are stored in httpOnly cookies (set by backend)
 * - httpOnly cookies cannot be accessed by JavaScript at all
 * - When page refreshes and memory is cleared, the refresh token cookie
 *   can be used to obtain a new access token via POST /api/auth/refresh
 * 
 * TRADE-OFFS:
 * - User needs to re-authenticate on page refresh (mitigated by auto-refresh on app init)
 * - Slightly more complex auth flow compared to localStorage
 * - Better security posture for financial/sensitive applications
 * 
 * REFERENCES:
 * - OWASP Token Storage: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
 * - JWT Best Practices: https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Auth context type definition.
 * Provides access token state and authentication status.
 */
interface AuthContextType {
  /** Current JWT access token (1-hour expiry). Null if not authenticated. */
  accessToken: string | null;
  /** Updates the access token in memory. Pass null to clear (logout). */
  setAccessToken: (token: string | null) => void;
  /** Derived boolean: true if accessToken is present and valid. */
  isAuthenticated: boolean;
  /** True while attempting to restore session from refresh token on app init. */
  isLoading: boolean;
  /** Updates loading state. Used by useAuthInit hook. */
  setIsLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that wraps the app and provides auth state.
 * 
 * IMPORTANT: Access token is stored in React state (memory only).
 * This is intentional for XSS protection - DO NOT move to localStorage.
 * 
 * On app initialization, consider calling /api/auth/refresh to restore
 * the session if a valid refresh token cookie exists.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Access token stored in memory only - NOT localStorage (XSS protection)
  // See module-level JSDoc for detailed security rationale
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Loading state tracks session restoration on app init
  // True from app mount until refresh attempt completes (success or failure)
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const value: AuthContextType = {
    accessToken,
    setAccessToken,
    isAuthenticated: !!accessToken,
    isLoading,
    setIsLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth context.
 * Must be used within AuthProvider.
 * 
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType with accessToken, setAccessToken, and isAuthenticated
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};