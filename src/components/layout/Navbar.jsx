import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      handleMobileMenuClose();
    }
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchor}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
    >
      <MenuItem component={Link} to="/" onClick={handleMobileMenuClose}>
        Home
      </MenuItem>
      <MenuItem component={Link} to="/jobs" onClick={handleMobileMenuClose}>
        Jobs
      </MenuItem>
      
      {currentUser ? (
        <>
          <MenuItem component={Link} to="/dashboard" onClick={handleMobileMenuClose}>
            Feed
          </MenuItem>
          <MenuItem component={Link} to="/profile" onClick={handleMobileMenuClose}>
            Profile
          </MenuItem>
          {userProfile?.role === 'recruiter' && (
            <MenuItem component={Link} to="/jobs/create" onClick={handleMobileMenuClose}>
              Post Job
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>Log Out</MenuItem>
        </>
      ) : (
        <>
          <MenuItem component={Link} to="/login" onClick={handleMobileMenuClose}>
            Log In
          </MenuItem>
          <MenuItem component={Link} to="/signup" onClick={handleMobileMenuClose}>
            Sign Up
          </MenuItem>
        </>
      )}
    </Menu>
  );

  const renderDesktopMenu = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button component={Link} to="/" color="inherit">Home</Button>
      <Button component={Link} to="/jobs" color="inherit">Jobs</Button>
      
      {currentUser ? (
        <>
          <Button component={Link} to="/dashboard" color="inherit">Feed</Button>
          <Button component={Link} to="/profile" color="inherit">Profile</Button>
          {userProfile?.role === 'recruiter' && (
            <Button component={Link} to="/jobs/create" color="inherit">Post Job</Button>
          )}
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={handleLogout}
            sx={{ ml: 1 }}
          >
            Log Out
          </Button>
        </>
      ) : (
        <>
          <Button component={Link} to="/login" color="inherit">Log In</Button>
          <Button 
            component={Link} 
            to="/signup" 
            variant="contained" 
            color="secondary"
          >
            Sign Up
          </Button>
        </>
      )}
    </Box>
  );

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 700
          }}
        >
          Welder's Connect
        </Typography>
        
        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
            >
              {mobileMenuAnchor ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            {renderMobileMenu}
          </>
        ) : (
          renderDesktopMenu
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;