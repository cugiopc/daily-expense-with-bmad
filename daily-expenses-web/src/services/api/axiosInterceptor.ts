/**
 * Axios Interceptor for Automatic Token Refresh
 * 
 * This module handles automatic JWT token refresh when access tokens expire.
 * 
 * Flow:
 * 1. When any API request returns 401 Unauthorized (except login/refresh endpoints)
 * 2. The interceptor attempts to refresh the access token via POST /api/auth/refresh
 * 3. If refresh succeeds, the original request is retried with the new token
 * 4. If refresh fails, user is redirected to login page
 * 
 * Race Condition Prevention:
 * - Multiple simultaneous 401 errors don't trigger multiple refresh calls
 * - Failed requests are queued while refresh is in progress
 * - Once refresh completes, all queued requests are retried with new token
 * - Queued requests are marked with _retry flag to prevent infinite loops
 */

import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Auth context interface for token management.
 * Tokens are stored in React state (memory) for XSS protection - NOT localStorage.
 */
interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

/**
 * Strongly typed callback for successful token refresh.
 * Called with the new access token when refresh completes successfully.
 */
type TokenResolveCallback = (token: string) => void;

/**
 * Strongly typed callback for failed token refresh.
 * Called with the error when refresh fails.
 */
type TokenRejectCallback = (error: Error) => void;

/**
 * Queue entry for requests waiting on token refresh.
 * Uses proper TypeScript types instead of generic Function type.
 */
interface QueueEntry {
  resolve: TokenResolveCallback;
  reject: TokenRejectCallback;
}

// Module-level state for refresh coordination
let isRefreshing = false;
let failedQueue: QueueEntry[] = [];

/**
 * Processes the queue of failed requests after token refresh attempt.
 * 
 * When refresh succeeds:
 *   - All queued requests are resolved with the new token
 *   - Each request will be retried with the new Authorization header
 * 
 * When refresh fails:
 *   - All queued requests are rejected with the error
 *   - This prevents stale requests from hanging indefinitely
 * 
 * @param error - The error if refresh failed, null if succeeded
 * @param token - The new access token if refresh succeeded, null if failed
 */
const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  // Clear the queue after processing to prevent memory leaks
  failedQueue = [];
};

/**
 * Sets up request and response interceptors on an axios instance.
 * 
 * Request Interceptor:
 *   - Automatically adds Authorization header if access token exists
 * 
 * Response Interceptor:
 *   - Catches 401 errors and attempts token refresh
 *   - Queues concurrent requests during refresh to prevent race conditions
 *   - Retries failed requests with new token after successful refresh
 * 
 * @param axiosInstance - The axios instance to configure
 * @param authContext - The auth context containing token state and setters
 */
export const setupInterceptors = (axiosInstance: AxiosInstance, authContext: AuthContextType): void => {
  // Request interceptor - add Authorization header to all requests
  axiosInstance.interceptors.request.use(
    (config) => {
      if (authContext.accessToken) {
        config.headers.Authorization = `Bearer ${authContext.accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for automatic token refresh on 401 errors
  axiosInstance.interceptors.response.use(
    // Success handler - pass through unchanged
    (response) => response,
    // Error handler - check for 401 and attempt refresh
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Only handle 401 errors that aren't from auth endpoints (prevent infinite loops)
      // Also check that we haven't already retried this request
      const is401Error = error.response?.status === 401;
      const isAuthEndpoint = 
        originalRequest.url === '/api/auth/login' || 
        originalRequest.url === '/api/auth/refresh';
      const hasAlreadyRetried = originalRequest._retry === true;

      if (is401Error && !isAuthEndpoint && !hasAlreadyRetried) {
        // If another request is already refreshing the token, queue this request
        // This prevents multiple simultaneous refresh calls (race condition)
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            // Mark queued request as retried to prevent infinite refresh loops
            // This is critical - without this flag, queued requests could trigger
            // their own refresh attempts if they fail again
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }).catch((err) => {
            // If queue processing failed (refresh failed), reject this request
            return Promise.reject(err);
          });
        }

        // Mark this request as being retried and start refresh process
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt token refresh - refresh token is sent automatically via httpOnly cookie
          const response = await axiosInstance.post('/api/auth/refresh');
          const newAccessToken = response.data.data.accessToken;

          // Update access token in auth context (stored in memory)
          authContext.setAccessToken(newAccessToken);

          // Process all queued requests with the new token
          processQueue(null, newAccessToken);

          // Retry the original failed request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed - token is invalid/expired, user must log in again
          // Reject all queued requests since they can't succeed without valid token
          processQueue(refreshError as Error, null);
          
          // Clear auth state
          authContext.setAccessToken(null);
          
          // Redirect to login page
          window.location.href = '/login';
          
          return Promise.reject(refreshError);
        } finally {
          // Always reset the refreshing flag, whether success or failure
          isRefreshing = false;
        }
      }

      // For non-401 errors or auth endpoint errors, just reject as-is
      return Promise.reject(error);
    }
  );
};