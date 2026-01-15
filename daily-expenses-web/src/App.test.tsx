import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders Vite + React heading', () => {
    render(<App />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toBe('Vite + React')
  })

  it('renders counter button with initial count of 0', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is 0/i })
    expect(button).toBeTruthy()
    expect(button.textContent).toContain('count is 0')
  })

  it('increments counter when button is clicked', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is/i })
    
    fireEvent.click(button)
    expect(button.textContent).toContain('count is 1')
    
    fireEvent.click(button)
    expect(button.textContent).toContain('count is 2')
  })

  it('renders Vite and React logos with correct links', () => {
    render(<App />)
    const links = screen.getAllByRole('link')
    
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveProperty('href', 'https://vite.dev/')
    expect(links[1]).toHaveProperty('href', 'https://react.dev/')
  })

  it('displays HMR instruction text', () => {
    render(<App />)
    const hmrText = screen.getByText((_content, element) => {
      return element?.tagName.toLowerCase() === 'p' && /Edit.*and save to test HMR/.test(element.textContent || '')
    })
    expect(hmrText).toBeTruthy()
  })

  it('renders all expected images with alt text', () => {
    render(<App />)
    const viteLogo = screen.getByAltText('Vite logo')
    const reactLogo = screen.getByAltText('React logo')
    
    expect(viteLogo).toBeTruthy()
    expect(reactLogo).toBeTruthy()
  })
})
