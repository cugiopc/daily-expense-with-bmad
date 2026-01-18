import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage, NotFoundPage } from './pages/index.ts'
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
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
