import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import DefaultProfileImage from '../../assets/default-profile.png';
import { 
  Box,
  Button,
  Typography,
  Avatar,
  Paper,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import MessageIcon from '@mui/icons-material/Message';
import EditIcon from '@mui/icons-material/Edit';

const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'center', md: 'flex-start' },
  gap: theme.spacing(3),
  borderRadius: 12,
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[4],
}));

const ProfileSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 12,
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: 8,
}));

const ConnectionRequestItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));


const ProfileView = () => {
  const { uid } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isPendingConnection, setIsPendingConnection] = useState(false);

  const isOwnProfile = currentUser && (!uid || uid === currentUser.uid);
  const profileId = isOwnProfile ? currentUser?.uid : uid;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }

      try {
        const profileDoc = await getDoc(doc(db, "users", profileId));
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setProfile(profileData);
          
          // Check connection status
          if (userProfile && profileData) {
            const isAlreadyConnected = userProfile.connections.includes(profileId);
            const hasPendingRequest = profileData.pendingConnections?.includes(currentUser.uid);
            
            setIsConnected(isAlreadyConnected);
            setIsPendingConnection(hasPendingRequest);
          }
        } else {
          setError("Profile not found");
        }
      } catch (error) {
        setError("Error fetching profile: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, currentUser, userProfile]);

  const handleConnectRequest = async () => {
    if (!currentUser || !profile) return;

    try {
      // Add connection request to the target user's pendingConnections
      const targetUserRef = doc(db, "users", profileId);
      await updateDoc(targetUserRef, {
        pendingConnections: arrayUnion(currentUser.uid)
      });
      
      setIsPendingConnection(true);
    } catch (error) {
      setError("Failed to send connection request: " + error.message);
    }
  };

  const handleAcceptConnection = async (senderUid) => {
    if (!currentUser) return;

    try {
      // Update both users' connections arrays
      const currentUserRef = doc(db, "users", currentUser.uid);
      const senderUserRef = doc(db, "users", senderUid);
      
      // Add to connections for both users
      await updateDoc(currentUserRef, {
        connections: arrayUnion(senderUid),
        pendingConnections: arrayRemove(senderUid)
      });
      
      await updateDoc(senderUserRef, {
        connections: arrayUnion(currentUser.uid)
      });
      
      // Update local state
      setProfile({
        ...profile,
        pendingConnections: profile.pendingConnections.filter(uid => uid !== senderUid)
      });
    } catch (error) {
      setError("Failed to accept connection: " + error.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile && !isOwnProfile) {
    return (
      <Box textAlign="center" py={4}>
        <Alert severity="error">{error || "Profile not found"}</Alert>
      </Box>
    );
  }

  if (!profile && isOwnProfile) {
    return (
      <ProfileSection elevation={3}>
        <Typography variant="h4" gutterBottom>
          Complete Your Profile
        </Typography>
        <Typography variant="body1" paragraph>
          You haven't set up your profile yet. Tell others about your welding skills and experience.
        </Typography>
        <Button 
          component={Link} 
          to="/profile/setup" 
          variant="contained" 
          color="primary"
          startIcon={<EditIcon />}
        >
          Set Up Profile
        </Button>
      </ProfileSection>
    );
  }

  return (
    <ProfileContainer maxWidth="md">
      <ProfileHeader elevation={3}>
        <ProfileAvatar 
          src={profile.profilePhotoURL || DefaultProfileImage} 
          alt={profile.fullName}
        />
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {profile.fullName}
          </Typography>
          {profile.title && (
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {profile.title}
            </Typography>
          )}
          {profile.location && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {profile.location}
            </Typography>
          )}
          
          {!isOwnProfile && currentUser && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              {isConnected ? (
                <Button 
                  variant="contained" 
                  color="success" 
                  startIcon={<CheckCircleIcon />}
                  disabled
                >
                  Connected
                </Button>
              ) : isPendingConnection ? (
                <Button 
                  variant="outlined" 
                  color="info" 
                  startIcon={<PendingIcon />}
                  disabled
                >
                  Request Sent
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleConnectRequest}
                >
                  Connect
                </Button>
              )}
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<MessageIcon />}
              >
                Message
              </Button>
            </Stack>
          )}
          
          {isOwnProfile && (
            <Button
              component={Link}
              to="/profile/setup"
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              sx={{ mt: 2 }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </ProfileHeader>
      
      <ProfileSection elevation={3}>
        <Typography variant="h5" gutterBottom>
          About
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1">
          {profile.bio || "No bio information provided."}
        </Typography>
      </ProfileSection>
      
      <ProfileSection elevation={3}>
        <Typography variant="h5" gutterBottom>
          Experience
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1">
          {profile.yearsExperience ? (
            `${profile.yearsExperience} years of welding experience`
          ) : (
            "No experience information provided."
          )}
        </Typography>
      </ProfileSection>
      
      <ProfileSection elevation={3}>
        <Typography variant="h5" gutterBottom>
          Certifications
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {profile.certifications && profile.certifications.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profile.certifications.map((cert, index) => (
              <SkillChip key={index} label={cert} color="primary" />
            ))}
          </Box>
        ) : (
          <Typography variant="body1">No certifications listed.</Typography>
        )}
      </ProfileSection>
      
      <ProfileSection elevation={3}>
        <Typography variant="h5" gutterBottom>
          Skills
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {profile.skills && profile.skills.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profile.skills.map((skill, index) => (
              <SkillChip key={index} label={skill} color="secondary" />
            ))}
          </Box>
        ) : (
          <Typography variant="body1">No skills listed.</Typography>
        )}
      </ProfileSection>
      
      {isOwnProfile && profile.pendingConnections && profile.pendingConnections.length > 0 && (
        <ProfileSection elevation={3}>
          <Typography variant="h5" gutterBottom>
            Connection Requests
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {profile.pendingConnections.map((senderUid) => (
              <ConnectionRequestItem key={senderUid}>
                <ListItemText 
                  primary={senderUid} // Replace with name once you fetch it
                  secondary="Wants to connect with you"
                />
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="contained" 
                    color="success"
                    size="small"
                    onClick={() => handleAcceptConnection(senderUid)}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error"
                    size="small"
                  >
                    Ignore
                  </Button>
                </Stack>
              </ConnectionRequestItem>
            ))}
          </List>
        </ProfileSection>
      )}
    </ProfileContainer>
  );
};

export default ProfileView;