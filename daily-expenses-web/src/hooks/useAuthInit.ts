import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../services/api/apiClient'

/**
 * Session restoration hook - automatically attempts to restore access token 
 * from refresh token cookie when app initializes.
 * 
 * This is critical for UX - when user refreshes page, access token is lost from memory
 * but refresh token cookie still exists. This hook restores seamless session.
 * 
 * FIXED: Removed accessToken from dependency array to prevent infinite re-render cycle.
 * Effect runs once on mount, checks if token exists, and restores if needed.
 */
export const useAuthInit = () => {
  const { accessToken, setAccessToken } = useAuth()
  const hasAttemptedRestore = useRef(false)

  useEffect(() => {
    const restoreSession = async () => {
      // Only attempt restore once per session
      if (hasAttemptedRestore.current) {
        return
      }
      hasAttemptedRestore.current = true

      // Only attempt restore if no token in memory (fresh page load/refresh)
      if (accessToken) {
        return // Already authenticated
      }

      try {
        // Attempt to refresh token using existing cookie
        const response = await apiClient.post('/api/auth/refresh')
        
        if (response.data?.success && response.data?.data?.accessToken) {
          // Successfully restored session
          setAccessToken(response.data.data.accessToken)
          // Removed console.log - production code should not spam console
        }
      } catch (error: any) {
        // Refresh failed - cookie expired/invalid or network error
        // Silent failure is acceptable - user will be prompted to login when accessing protected routes
        // No console.log spam in production
      }
    }

    restoreSession()
  }, [setAccessToken]) // Only depend on setAccessToken, which is stable
}