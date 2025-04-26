import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Alert,
  CircularProgress
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

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('welder');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous errors
    setError('');
    
    // Form validation
    if (!fullName.trim()) {
      return setError('Please enter your full name');
    }
    
    if (!email.trim()) {
      return setError('Please enter your email');
    }
    
    if (!password || !confirmPassword) {
      return setError('Please enter and confirm your password');
    }
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (password.length < 6) {
      return setError('Password should be at least 6 characters');
    }
    
    try {
      setLoading(true);
      await signup(email, password, role, fullName);
      setVerificationSent(true);
    } catch (error) {
      let errorMessage = 'Failed to create an account';
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already in use. Please use a different email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        default:
          errorMessage = error.message || 'An unknown error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <AuthCard>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Verification Email Sent
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Please check your email and verify your account before logging in.
          </Typography>
          <Box textAlign="center" mt={3}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </Box>
        </CardContent>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <CardContent>
        <Typography variant="h4" align="center" gutterBottom>
          Create Your Welder's Connect Account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                error={error.includes('name')}
              />
            </Grid>
            
            <Grid item xs={12}>
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
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                helperText="At least 6 characters"
                error={error.includes('Password')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                error={error.includes('Passwords do not match')}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">I am a:</FormLabel>
                <RadioGroup 
                  row 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                >
                  <FormControlLabel 
                    value="welder" 
                    control={<Radio />} 
                    label="Welder" 
                  />
                  <FormControlLabel 
                    value="recruiter" 
                    control={<Radio />} 
                    label="Recruiter" 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
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
                  'Sign Up'
                )}
              </SubmitButton>
            </Grid>
          </Grid>
        </form>
        
        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Button 
              color="primary" 
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none' }}
            >
              Log In
            </Button>
          </Typography>
        </Box>
      </CardContent>
    </AuthCard>
  );
};

export default SignUp;