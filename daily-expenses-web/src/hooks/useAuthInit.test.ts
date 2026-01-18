import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthInit } from './useAuthInit'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../services/api/apiClient'

// Mock dependencies
vi.mock('../contexts/AuthContext')
vi.mock('../services/api/apiClient')

const mockUseAuth = vi.mocked(useAuth)
const mockApiClient = vi.mocked(apiClient)

describe('useAuthInit', () => {
  const mockSetAccessToken = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    console.log = vi.fn() // Mock console.log
    console.warn = vi.fn() // Mock console.warn
  })

  it('should not attempt restore if access token already exists', async () => {
    // Mock already authenticated state
    mockUseAuth.mockReturnValue({
      accessToken: 'existing-token',
      setAccessToken: mockSetAccessToken,
      isAuthenticated: true,
    })

    renderHook(() => useAuthInit())

    await waitFor(() => {
      // Should not make any API calls
      expect(mockApiClient.post).not.toHaveBeenCalled()
      expect(mockSetAccessToken).not.toHaveBeenCalled()
    })
  })

  it('should attempt restore with valid refresh token cookie and set access token', async () => {
    // Mock unauthenticated state
    mockUseAuth.mockReturnValue({
      accessToken: null,
      setAccessToken: mockSetAccessToken,
      isAuthenticated: false,
    })

    // Mock successful refresh response
    const mockResponse = {
      data: {
        success: true,
        data: {
          accessToken: 'new-access-token'
        }
      }
    }
    mockApiClient.post.mockResolvedValueOnce(mockResponse)

    renderHook(() => useAuthInit())

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/refresh')
      expect(mockSetAccessToken).toHaveBeenCalledWith('new-access-token')
      // Removed console.log assertion - production code should not spam console
    })
  })

  it('should handle expired refresh token (401) gracefully without redirect', async () => {
    mockUseAuth.mockReturnValue({
      accessToken: null,
      setAccessToken: mockSetAccessToken,
      isAuthenticated: false,
    })

    // Mock 401 Unauthorized response (expired refresh token)
    const mockError = {
      response: { status: 401 },
      message: 'Unauthorized'
    }
    mockApiClient.post.mockRejectedValueOnce(mockError)

    renderHook(() => useAuthInit())

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/refresh')
      expect(mockSetAccessToken).not.toHaveBeenCalled()
      // Silent failure is expected - no console spam in production
    })
  })

  it('should handle network errors without affecting user experience', async () => {
    mockUseAuth.mockReturnValue({
      accessToken: null,
      setAccessToken: mockSetAccessToken,
      isAuthenticated: false,
    })

    // Mock network error
    const mockError = {
      response: null,
      message: 'Network Error'
    }
    mockApiClient.post.mockRejectedValueOnce(mockError)

    renderHook(() => useAuthInit())

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/refresh')
      expect(mockSetAccessToken).not.toHaveBeenCalled()
      // Silent failure is expected - no console spam in production
    })
  })

  it('should handle malformed response gracefully', async () => {
    mockUseAuth.mockReturnValue({
      accessToken: null,
      setAccessToken: mockSetAccessToken,
      isAuthenticated: false,
    })

    // Mock malformed response (missing required fields)
    const mockResponse = {
      data: {
        success: false // Missing data.accessToken
      }
    }
    mockApiClient.post.mockResolvedValueOnce(mockResponse)

    renderHook(() => useAuthInit())

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/refresh')
      expect(mockSetAccessToken).not.toHaveBeenCalled()
      // Should not crash or throw error - graceful handling
    })
  })

  it('should only run once on mount, not on every accessToken change', async () => {
    const { rerender } = renderHook(() => useAuthInit())

    // Mock initial unauthenticated state
    mockUseAuth.mockReturnValue({
      accessToken: null,
      setAccessToken: mockSetAccessToken,
      isAuthenticated: false,
    })

    mockApiClient.post.mockResolvedValueOnce({
      data: { success: true, data: { accessToken: 'token' } }
    })

    // Wait for initial effect
    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledTimes(1)
    })

    // Mock state after token is set (simulating successful restoration)
    mockUseAuth.mockReturnValue({
      accessToken: 'token',
      setAccessToken: mockSetAccessToken,
      isAuthenticated: true,
    })

    // Rerender hook - should not trigger another restore attempt
    rerender()

    await waitFor(() => {
      // Should still only be called once
      expect(mockApiClient.post).toHaveBeenCalledTimes(1)
    })
  })
})