import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import { App } from './App.tsx'
import { theme, THEME_COLORS, APP_TEXT } from './theme/theme.ts'
import { ErrorBoundary } from './shared/components/index.ts'

// Create TanStack Query client with project-context configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  // User-friendly error handling for missing root element using safe DOM APIs
  const errorMessage = 'Unable to start the application: Root element "#root" not found in HTML. Please ensure index.html contains <div id="root"></div>'
  console.error(errorMessage)
  
  // Create error UI using safe DOM API (no innerHTML injection)
  const errorContainer = document.createElement('div')
  errorContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
    padding: 2rem;
    text-align: center;
    background-color: ${THEME_COLORS.errorBackground};
    color: ${THEME_COLORS.errorText};
  `
  
  const heading = document.createElement('h1')
  heading.style.cssText = 'font-size: 2rem; margin-bottom: 1rem;'
  heading.textContent = `⚠️ ${APP_TEXT.errorTitle}`
  
  const messagePara = document.createElement('p')
  messagePara.style.cssText = 'font-size: 1.125rem; max-width: 600px; line-height: 1.6;'
  messagePara.textContent = APP_TEXT.errorMessage
  
  const hintPara = document.createElement('p')
  hintPara.style.cssText = `margin-top: 1rem; font-size: 0.875rem; color: ${THEME_COLORS.errorTextDark};`
  hintPara.textContent = APP_TEXT.errorDevHint
  
  errorContainer.appendChild(heading)
  errorContainer.appendChild(messagePara)
  errorContainer.appendChild(hintPara)
  
  document.body.appendChild(errorContainer)
  throw new Error(errorMessage)
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
