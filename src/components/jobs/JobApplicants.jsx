import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { 
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import BuildIcon from '@mui/icons-material/Build';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';

const ApplicantsContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const ApplicantCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  transition: 'box-shadow 0.3s',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ApplicantHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const SkillsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const JobApplicants = () => {
  const { jobId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobAndApplicants = async () => {
      if (!currentUser) {
        setError("You must be logged in to view applicants");
        setLoading(false);
        return;
      }
      
      try {
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        
        if (!jobDoc.exists()) {
          setError("Job listing not found");
          setLoading(false);
          return;
        }
        
        const jobData = jobDoc.data();
        
        if (jobData.recruiterId !== currentUser.uid) {
          setError("You don't have permission to view these applicants");
          setLoading(false);
          return;
        }
        
        setJob({ id: jobDoc.id, ...jobData });
        
        if (jobData.applicants && jobData.applicants.length > 0) {
          const enrichedApplicants = [];
          
          for (const applicant of jobData.applicants) {
            try {
              const userDoc = await getDoc(doc(db, "users", applicant.applicantId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                enrichedApplicants.push({
                  ...applicant,
                  userData
                });
              } else {
                enrichedApplicants.push(applicant);
              }
            } catch (error) {
              console.error("Error fetching applicant data:", error);
              enrichedApplicants.push(applicant);
            }
          }
          
          setApplicants(enrichedApplicants);
        }
        
      } catch (error) {
        setError("Error fetching job applicants: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobAndApplicants();
  }, [jobId, currentUser]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate();
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!job) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Job listing not found
      </Alert>
    );
  }

  return (
    <ApplicantsContainer maxWidth="lg">
      <Box mb={3}>
        <Button
          component={Link}
          to={`/jobs/${jobId}`}
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Job Listing
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom>
          Applicants for {job.title}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {job.company} • {job.location} • {applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
      </Box>
      
      {applicants.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No applicants yet. Check back later.
          </Typography>
        </Paper>
      ) : (
        <List>
          {applicants.map((applicant, index) => (
            <ApplicantCard key={index} elevation={2}>
              <ApplicantHeader>
                <ListItemAvatar>
                  <Avatar 
                    src={applicant.applicantPhoto || applicant.userData?.profilePhotoURL || '/default-avatar.png'} 
                    alt={applicant.applicantName}
                    sx={{ width: 64, height: 64 }}
                  >
                    <PersonIcon fontSize="large" />
                  </Avatar>
                </ListItemAvatar>
                
                <Box ml={2}>
                  <Typography variant="h5" component="h3">
                    {applicant.applicantName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Applied {formatDate(applicant.appliedAt)}
                  </Typography>
                </Box>
              </ApplicantHeader>
              
              {applicant.message && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Message from applicant:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {applicant.message}
                  </Typography>
                </Box>
              )}
              
              {applicant.userData && (
                <Box>
                  {applicant.userData.title && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <WorkIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {applicant.userData.title}
                      </Typography>
                    </Box>
                  )}
                  
                  {applicant.userData.location && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOnIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {applicant.userData.location}
                      </Typography>
                    </Box>
                  )}
                  
                  {applicant.userData.yearsExperience && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <Typography variant="body1">
                        {applicant.userData.yearsExperience} years of experience
                      </Typography>
                    </Box>
                  )}
                  
                  {applicant.userData.skills && applicant.userData.skills.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        <BuildIcon color="action" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Skills:
                      </Typography>
                      <SkillsContainer>
                        {applicant.userData.skills.map((skill, i) => (
                          <Chip key={i} label={skill} color="primary" size="small" />
                        ))}
                      </SkillsContainer>
                    </Box>
                  )}
                  
                  {applicant.userData.certifications && applicant.userData.certifications.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        <SchoolIcon color="action" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Certifications:
                      </Typography>
                      <SkillsContainer>
                        {applicant.userData.certifications.map((cert, i) => (
                          <Chip key={i} label={cert} color="secondary" size="small" />
                        ))}
                      </SkillsContainer>
                    </Box>
                  )}
                </Box>
              )}
              
              <Box display="flex" gap={2} mt={3}>
                <Button
                  component={Link}
                  to={`/profile/${applicant.applicantId}`}
                  variant="outlined"
                  color="primary"
                >
                  View Full Profile
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EmailIcon />}
                >
                  Contact
                </Button>
              </Box>
            </ApplicantCard>
          ))}
        </List>
      )}
    </ApplicantsContainer>
  );
};

export default JobApplicants;