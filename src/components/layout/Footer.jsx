import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Link as MuiLink
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(6, 0),
  marginTop: 'auto'
}));

const FooterLink = styled(MuiLink)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
    color: theme.palette.secondary.main
  }
}));

const Footer = () => {
  return (
    <StyledFooter component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Welder's Connect
            </Typography>
            <Typography variant="body2">
              Connecting welding professionals and recruiters in one specialized platform.
            </Typography>
          </Grid>
          
          {/* Quick Links Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <List dense>
              {[
                { text: 'Home', to: '/' },
                { text: 'Find Jobs', to: '/jobs' },
                { text: 'News Feed', to: '/dashboard' },
                { text: 'Profile', to: '/profile' }
              ].map((item) => (
                <ListItem key={item.text} disableGutters>
                  <FooterLink component={Link} to={item.to}>
                    <ListItemText primary={item.text} />
                  </FooterLink>
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Support Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <List dense>
              {[
                { text: 'Help Center', to: '/help' },
                { text: 'Contact Us', to: '/contact' },
                { text: 'Privacy Policy', to: '/privacy' },
                { text: 'Terms of Service', to: '/terms' }
              ].map((item) => (
                <ListItem key={item.text} disableGutters>
                  <FooterLink component={Link} to={item.to}>
                    <ListItemText primary={item.text} />
                  </FooterLink>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
        
        <Typography variant="body2" align="center">
          &copy; {new Date().getFullYear()} Welder's Connect. All rights reserved.
        </Typography>
      </Container>
    </StyledFooter>
  );
};

export default Footer;