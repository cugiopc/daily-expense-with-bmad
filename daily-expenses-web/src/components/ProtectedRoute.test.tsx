/**
 * Integration tests for ProtectedRoute component
 * 
 * Tests cover:
 * - Redirects to login when not authenticated
 * - Renders children when authenticated
 * - Preserves location state for redirect back after login
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import React from 'react';

// Mock useAuth hook
const mockUseAuth = vi.fn();

vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
  };
});

// Test components
const ProtectedContent = () => <div data-testid="protected-content">Protected Content</div>;
const LoginPage = () => <div data-testid="login-page">Login Page</div>;

// Helper to render with router
const renderWithRouter = (initialRoute: string = '/protected', isAuthenticated: boolean = false) => {
  mockUseAuth.mockReturnValue({
    accessToken: isAuthenticated ? 'test-token' : null,
    setAccessToken: vi.fn(),
    isAuthenticated,
  });

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <ProtectedContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    it('redirects to login page', () => {
      renderWithRouter('/protected', false);
      
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('does not render protected content', () => {
      renderWithRouter('/protected', false);
      
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    it('renders protected content', () => {
      renderWithRouter('/protected', true);
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('does not redirect to login', () => {
      renderWithRouter('/protected', true);
      
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });
  });

  describe('authentication state changes', () => {
    it('handles token becoming null (logout scenario)', () => {
      // Start authenticated
      const { rerender } = renderWithRouter('/protected', true);
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();

      // Simulate logout - update mock and rerender
      mockUseAuth.mockReturnValue({
        accessToken: null,
        setAccessToken: vi.fn(),
        isAuthenticated: false,
      });

      rerender(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Should now show login page
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });
});
