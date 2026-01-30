import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HomePage, LoginPage, BudgetPage, NotFoundPage } from './pages/index.ts'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'
import { useAuth } from './contexts/AuthContext.tsx'
import { apiClient } from './services/api/apiClient.ts'
import { setupInterceptors } from './services/api/axiosInterceptor.ts'
import { useAuthInit } from './hooks/useAuthInit.ts'
import './App.css'

export function App(): JSX.Element {
  const authContext = useAuth()

  // Initialize session restoration on app mount
  useAuthInit()

  // Setup axios interceptors ONCE when app mounts
  // CRITICAL FIX: Use empty deps to prevent re-initialization on every auth state change
  // Pass getter function instead of authContext object to always read latest state
  useEffect(() => {
    setupInterceptors(apiClient, () => authContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <BudgetPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Toast notifications for user feedback (Vietnamese language) */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#4caf50',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#f44336',
              secondary: 'white',
            },
          },
        }}
      />
    </>
  )
}
