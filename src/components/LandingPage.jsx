import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Container,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';

const HeroSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(8, 2),
  textAlign: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: 0,
  marginBottom: theme.spacing(4)
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  marginBottom: theme.spacing(2)
}));

const LandingPage = () => {
  const { currentUser } = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <HeroSection elevation={0}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Connect With Welding Professionals & Opportunities
          </Typography>
          <Typography variant="h5" component="p" gutterBottom sx={{ mb: 4 }}>
            Welder's Connect is the professional network exclusively for welders and industry employers.
          </Typography>
          
          {!currentUser ? (
            <Box sx={{ '& > *': { m: 1 } }}>
              <Button 
                component={Link} 
                to="/signup" 
                variant="contained" 
                color="secondary" 
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Join Now
              </Button>
              <Button 
                component={Link} 
                to="/login" 
                variant="outlined" 
                color="inherit" 
                size="large"
                sx={{ px: 4, py: 1.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Log In
              </Button>
            </Box>
          ) : (
            <Button 
              component={Link} 
              to="/dashboard" 
              variant="contained" 
              color="secondary" 
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              Go to Dashboard
            </Button>
          )}
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ fontWeight: 600, mb: 6 }}>
          Why Join Welder's Connect?
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <FeatureIcon>👷</FeatureIcon>
                <Typography gutterBottom variant="h5" component="h3">
                  Professional Network
                </Typography>
                <Typography>
                  Build connections with other welders and industry professionals to expand your opportunities.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <FeatureIcon>📝</FeatureIcon>
                <Typography gutterBottom variant="h5" component="h3">
                  Showcase Your Work
                </Typography>
                <Typography>
                  Create a professional profile highlighting your skills, certifications, and project portfolio.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <FeatureIcon>💼</FeatureIcon>
                <Typography gutterBottom variant="h5" component="h3">
                  Exclusive Job Listings
                </Typography>
                <Typography>
                  Access welding job opportunities posted directly by industry recruiters and employers.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <FeatureIcon>🔍</FeatureIcon>
                <Typography gutterBottom variant="h5" component="h3">
                  Get Discovered
                </Typography>
                <Typography>
                  Make yourself visible to recruiters looking for your specific welding skills and certifications.
                </Typography>
              </CardContent>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="md" align="center">
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Connect With Welding Professionals?
          </Typography>
          <Typography variant="h5" component="p" gutterBottom sx={{ mb: 4 }}>
            Join thousands of welders and employers on the fastest growing welding professional network.
          </Typography>
          
          {!currentUser ? (
            <Button 
              component={Link} 
              to="/signup" 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
            >
              Create Your Profile
            </Button>
          ) : (
            <Button 
              component={Link} 
              to="/dashboard" 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
            >
              Explore Your Network
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;