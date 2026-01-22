import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HomePage, LoginPage, NotFoundPage } from './pages/index.ts'
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

  // Setup axios interceptors when app mounts
  useEffect(() => {
    setupInterceptors(apiClient, authContext)
  }, [authContext])

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
