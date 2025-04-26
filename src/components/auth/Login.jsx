import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';

const AuthCard = styled(Card)(({ theme }) => ({
  maxWidth: 500,
  margin: 'auto',
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  boxShadow: theme.shadows[4]
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5)
}));

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled');
      } else {
        setError('Failed to log in: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <CardContent>
        <Typography variant="h4" align="center" gutterBottom>
          Log In to Welder's Connect
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={error.includes('email')}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={error.includes('password')}
            />
          </Box>
          
          <SubmitButton
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Log In'
            )}
          </SubmitButton>
        </form>
        
        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link 
              component="button" 
              onClick={() => navigate('/signup')}
              sx={{ textTransform: 'none' }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </AuthCard>
  );
};

export default Login;