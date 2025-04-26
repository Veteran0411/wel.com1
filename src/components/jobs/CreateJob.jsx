import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Button,
  Typography,
  Container,
  Paper,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LinkIcon from '@mui/icons-material/Link';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';

const FormContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
}));

const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const CreateJob = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'full-time',
    description: '',
    requirements: '',
    salary: '',
    applicationUrl: '',
    contactEmail: userProfile?.email || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to post a job');
      return;
    }
    
    if (userProfile?.role !== 'recruiter') {
      setError('Only recruiters can post job listings');
      return;
    }
    
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      setError('Please fill out all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const jobData = {
        ...formData,
        recruiterId: currentUser.uid,
        recruiterName: userProfile?.fullName || 'Anonymous Recruiter',
        companyLogo: userProfile?.profilePhotoURL || null,
        createdAt: serverTimestamp(),
        applicants: [],
        isActive: true,
      };
      
      const docRef = await addDoc(collection(db, "jobs"), jobData);
      
      setSuccess('Job listing created successfully!');
      
      setTimeout(() => {
        navigate(`/jobs/${docRef.id}`);
      }, 2000);
      
    } catch (error) {
      setError('Failed to create job listing: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer maxWidth="md">
      <FormTitle variant="h4" component="h2">
        <WorkOutlineIcon fontSize="large" />
        Post a New Job
      </FormTitle>
      
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
      
      <FormPaper elevation={3}>
        <Box component="form" onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            label="Job Title*"
            name="title"
            placeholder="e.g., Senior TIG Welder"
            value={formData.title}
            onChange={handleInputChange}
            required
            InputProps={{
              startAdornment: <WorkOutlineIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <StyledTextField
            fullWidth
            label="Company Name*"
            name="company"
            placeholder="e.g., Steel Solutions Inc."
            value={formData.company}
            onChange={handleInputChange}
            required
            InputProps={{
              startAdornment: <BusinessIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <StyledTextField
            fullWidth
            label="Location*"
            name="location"
            placeholder="e.g., Houston, TX or Remote"
            value={formData.location}
            onChange={handleInputChange}
            required
            InputProps={{
              startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Job Type</InputLabel>
            <StyledSelect
              name="jobType"
              value={formData.jobType}
              onChange={handleInputChange}
              label="Job Type"
            >
              <MenuItem value="full-time">Full-time</MenuItem>
              <MenuItem value="part-time">Part-time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="temporary">Temporary</MenuItem>
              <MenuItem value="apprenticeship">Apprenticeship</MenuItem>
            </StyledSelect>
          </FormControl>
          
          <StyledTextField
            fullWidth
            label="Salary Range (Optional)"
            name="salary"
            placeholder="e.g., $60,000 - $80,000 per year"
            value={formData.salary}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <AttachMoneyIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <StyledTextField
            fullWidth
            label="Job Description*"
            name="description"
            placeholder="Describe the job role, responsibilities, and company..."
            value={formData.description}
            onChange={handleInputChange}
            multiline
            rows={5}
            required
            InputProps={{
              startAdornment: <DescriptionIcon color="action" sx={{ mr: 1, mt: 1, alignSelf: 'flex-start' }} />,
            }}
          />
          
          <StyledTextField
            fullWidth
            label="Requirements"
            name="requirements"
            placeholder="List qualifications, experience, and skills needed..."
            value={formData.requirements}
            onChange={handleInputChange}
            multiline
            rows={4}
            InputProps={{
              startAdornment: <ListAltIcon color="action" sx={{ mr: 1, mt: 1, alignSelf: 'flex-start' }} />,
            }}
          />
          
          <StyledTextField
            fullWidth
            label="Application URL (Optional)"
            name="applicationUrl"
            placeholder="https://yourcompany.com/careers/apply"
            value={formData.applicationUrl}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <StyledTextField
            fullWidth
            label="Contact Email*"
            name="contactEmail"
            placeholder="hiring@yourcompany.com"
            value={formData.contactEmail}
            onChange={handleInputChange}
            required
            InputProps={{
              startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <Divider sx={{ my: 3 }} />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            {loading ? 'Posting...' : 'Post Job'}
          </Button>
        </Box>
      </FormPaper>
    </FormContainer>
  );
};

export default CreateJob;