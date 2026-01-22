import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { AuthProvider } from './contexts/AuthContext'
import * as expensesApi from './features/expenses/api/expensesApi'

// Mock the expenses API
vi.mock('./features/expenses/api/expensesApi')

// Helper to render App with Router and AuthProvider
const renderApp = (initialRoute = '/') => {
  window.history.pushState({}, 'Test page', initialRoute)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  )
}

describe('App', () => {
  beforeEach(() => {
    // Mock getExpenses to return empty array by default
    vi.mocked(expensesApi.getExpenses).mockResolvedValue([]);
  });

  it('renders HomePage at root route', () => {
    renderApp('/')
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toBe('Daily Expenses')
  })

  it('renders NotFoundPage for unknown routes', () => {
    renderApp('/some-unknown-route')
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toBe('404')
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument()
  })

  it('displays welcome message on HomePage', async () => {
    renderApp('/');
    // Wait for component to render completely
    const homeButton = screen.getByRole('button', { name: /Đăng nhập/i })
    expect(homeButton).toBeInTheDocument()
  });

  it('renders Go Home button on NotFoundPage', () => {
    renderApp('/invalid')
    const homeButton = screen.getByRole('button', { name: /Go Home/i })
    expect(homeButton).toBeInTheDocument()
  })
})
