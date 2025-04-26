import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Typography,
  Container,
  Paper,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import BuildIcon from '@mui/icons-material/Build';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';

const ProfileSetupContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const FormSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const AddItemContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const ItemsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const ProfileSetup = () => {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    location: '',
    yearsExperience: '',
    certifications: [],
    newCertification: '',
    skills: [],
    newSkill: '',
    profilePhotoURL: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        title: userProfile.title || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        yearsExperience: userProfile.yearsExperience || '',
        certifications: userProfile.certifications || [],
        newCertification: '',
        skills: userProfile.skills || [],
        newSkill: '',
        profilePhotoURL: userProfile.profilePhotoURL || '',
      });
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddCertification = () => {
    if (formData.newCertification.trim() !== '') {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, formData.newCertification.trim()],
        newCertification: '',
      });
    }
  };

  const handleAddSkill = () => {
    if (formData.newSkill.trim() !== '') {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.newSkill.trim()],
        newSkill: '',
      });
    }
  };

  const handleRemoveCertification = (index) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications.splice(index, 1);
    setFormData({
      ...formData,
      certifications: updatedCertifications,
    });
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = [...formData.skills];
    updatedSkills.splice(index, 1);
    setFormData({
      ...formData,
      skills: updatedSkills,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImage) return formData.profilePhotoURL;

    const fileRef = ref(storage, `profileImages/${currentUser.uid}/${profileImage.name}`);
    await uploadBytes(fileRef, profileImage);
    return await getDownloadURL(fileRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('No user logged in');
      return;
    }

    try {
      setError('');
      setUploading(true);

      let profilePhotoURL = formData.profilePhotoURL;
      
      if (profileImage) {
        profilePhotoURL = await uploadProfileImage();
      }

      const userRef = doc(db, "users", currentUser.uid);
      const profileData = {
        title: formData.title,
        bio: formData.bio,
        location: formData.location,
        yearsExperience: formData.yearsExperience,
        certifications: formData.certifications,
        skills: formData.skills,
        profilePhotoURL,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userRef, profileData);
      await fetchUserProfile(currentUser.uid);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProfileSetupContainer maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Set Up Your Professional Profile
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <FormSection elevation={3}>
          <FormTitle variant="h5">
            <AccountCircleIcon />
            Basic Information
          </FormTitle>
          <Divider sx={{ mb: 3 }} />
          
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Professional Title"
              name="title"
              placeholder="e.g., Certified TIG Welder"
              value={formData.title}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <WorkIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Profile Photo
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={formData.profilePhotoURL || undefined}
                  sx={{ width: 80, height: 80 }}
                >
                  {!formData.profilePhotoURL && <AccountCircleIcon sx={{ fontSize: 60 }} />}
                </Avatar>
                <Button
                  variant="outlined"
                  component="label"
                >
                  Upload New Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </Button>
              </Box>
            </Box>
            
            <TextField
              fullWidth
              label="Years of Experience"
              name="yearsExperience"
              type="number"
              min="0"
              value={formData.yearsExperience}
              onChange={handleInputChange}
            />
            
            <TextField
              fullWidth
              label="Location"
              name="location"
              placeholder="City, State/Province"
              value={formData.location}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
            
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              placeholder="Tell us about your experience, specialties, and career aspirations..."
              value={formData.bio}
              onChange={handleInputChange}
              multiline
              rows={4}
            />
          </Stack>
        </FormSection>
        
        <FormSection elevation={3}>
          <FormTitle variant="h5">
            <BuildIcon />
            Skills & Certifications
          </FormTitle>
          <Divider sx={{ mb: 3 }} />
          
          <Box mb={4}>
            <Typography variant="subtitle2" gutterBottom>
              <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Certifications
            </Typography>
            <AddItemContainer>
              <TextField
                fullWidth
                label="Add Certification"
                name="newCertification"
                placeholder="e.g., AWS D1.1 Certified"
                value={formData.newCertification}
                onChange={handleInputChange}
              />
              <Button
                variant="contained"
                onClick={handleAddCertification}
                startIcon={<AddIcon />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add
              </Button>
            </AddItemContainer>
            
            <ItemsContainer>
              {formData.certifications.map((cert, index) => (
                <Chip
                  key={index}
                  label={cert}
                  color="primary"
                  onDelete={() => handleRemoveCertification(index)}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </ItemsContainer>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              <BuildIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Skills
            </Typography>
            <AddItemContainer>
              <TextField
                fullWidth
                label="Add Skill"
                name="newSkill"
                placeholder="e.g., TIG Welding"
                value={formData.newSkill}
                onChange={handleInputChange}
              />
              <Button
                variant="contained"
                onClick={handleAddSkill}
                startIcon={<AddIcon />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add
              </Button>
            </AddItemContainer>
            
            <ItemsContainer>
              {formData.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  color="secondary"
                  onDelete={() => handleRemoveSkill(index)}
                  deleteIcon={<CloseIcon />}
                />
              ))}
            </ItemsContainer>
          </Box>
        </FormSection>
        
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={24} /> : <SaveIcon />}
            sx={{ px: 6, py: 1.5 }}
          >
            {uploading ? 'Updating...' : 'Save Profile'}
          </Button>
        </Box>
      </Box>
    </ProfileSetupContainer>
  );
};

export default ProfileSetup;