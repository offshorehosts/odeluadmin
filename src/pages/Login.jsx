import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Container,
  CircularProgress,
  Alert
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsSubmitting(true);
    const success = await login(apiKey);
    setIsSubmitting(false);
    
    if (success) {
      navigate('/');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              borderRadius: '50%', 
              p: 1, 
              mb: 2,
              color: 'white'
            }}
          >
            <LockOutlined />
          </Box>
          <Typography component="h1" variant="h5" gutterBottom>
            Odelu Admin Panel
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Enter your admin API key to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="apiKey"
              label="Admin API Key"
              name="apiKey"
              autoFocus
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || !apiKey.trim()}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;