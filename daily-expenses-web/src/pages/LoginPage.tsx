/**
 * Temporary Login Page - For Development/Demo Only
 * 
 * This is a simple login form to test authentication and optimistic UI functionality.
 * In production, this would be replaced with proper login UI with validation.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api/apiClient';

export function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('SecurePass123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      if (response.data?.success && response.data?.data?.accessToken) {
        setAccessToken(response.data.data.accessToken);
        navigate('/');
      } else {
        setError('Đăng nhập thất bại');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  // Demo bypass button for testing optimistic UI
  const handleDemoBypass = () => {
    // Set a mock token to bypass auth for demo
    // Payload: {"userId":"test-user-id","email":"test@example.com","iat":1673976000,"exp":9999999999}
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2NzM5NzYwMDAsImV4cCI6OTk5OTk5OTk5OX0.mock-signature';
    setAccessToken(mockToken);
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Daily Expenses
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
          Đăng nhập
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleDemoBypass}
            sx={{ mb: 2 }}
          >
            🎯 Demo Mode (Skip Auth)
          </Button>

          <Typography variant="body2" color="text.secondary" align="center">
            Demo credentials: test@example.com / SecurePass123
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}