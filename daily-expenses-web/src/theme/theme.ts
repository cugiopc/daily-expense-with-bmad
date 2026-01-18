/**
 * Centralized Material-UI theme configuration
 * Single source of truth for colors, typography, and spacing
 */
import { createTheme, Theme } from '@mui/material/styles'

// Centralized color constants for consistent theming across the app
export const THEME_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  success: '#2e7d32',
  errorBackground: '#fef2f2',
  errorText: '#991b1b',
  errorTextDark: '#7f1d1d',
} as const

// Application-wide text constants for i18n preparation
export const APP_TEXT = {
  muiButtonText: 'MUI Button Works',
  errorTitle: 'Application Error',
  errorMessage: 'Unable to initialize the application. The root HTML element was not found.',
  errorDevHint: "If you're a developer, check the console for details.",
  errorResetButton: 'Try Again',
  muiIntegrationTitle: 'Material-UI Integration',
  muiIntegrationDescription: 'This card validates that Material-UI components are working correctly with Vite and React.',
} as const

/**
 * Material-UI theme instance
 * Extends default theme with custom color palette
 */
export const theme: Theme = createTheme({
  palette: {
    primary: {
      main: THEME_COLORS.primary,
    },
    secondary: {
      main: THEME_COLORS.secondary,
    },
    error: {
      main: THEME_COLORS.error,
    },
    warning: {
      main: THEME_COLORS.warning,
    },
    info: {
      main: THEME_COLORS.info,
    },
    success: {
      main: THEME_COLORS.success,
    },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
})
