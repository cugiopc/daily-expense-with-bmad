import { Typography, Box, Container } from '@mui/material'

export function HomePage(): JSX.Element {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Daily Expenses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to Daily Expenses - Your personal expense tracking PWA
        </Typography>
      </Box>
    </Container>
  )
}
