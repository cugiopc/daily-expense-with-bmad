import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'

// Helper to render App with Router
const renderApp = (initialRoute = '/') => {
  window.history.pushState({}, 'Test page', initialRoute)
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

describe('App', () => {
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

  it('displays welcome message on HomePage', () => {
    renderApp('/')
    expect(screen.getByText(/Welcome to Daily Expenses/i)).toBeInTheDocument()
  })

  it('renders Go Home button on NotFoundPage', () => {
    renderApp('/invalid')
    const homeButton = screen.getByRole('button', { name: /Go Home/i })
    expect(homeButton).toBeInTheDocument()
  })
})
