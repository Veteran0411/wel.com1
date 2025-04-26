import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { 
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Avatar,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';

const JobHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'center', md: 'flex-start' },
  gap: theme.spacing(3),
}));

const JobSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const JobTypeChip = styled(Chip)(({ theme, jobtype }) => ({
  backgroundColor: 
    jobtype === 'full-time' ? theme.palette.primary.light :
    jobtype === 'part-time' ? theme.palette.secondary.light :
    jobtype === 'contract' ? theme.palette.info.light :
    jobtype === 'temporary' ? theme.palette.warning.light :
    theme.palette.success.light,
  color: theme.palette.getContrastText(
    jobtype === 'full-time' ? theme.palette.primary.light :
    jobtype === 'part-time' ? theme.palette.secondary.light :
    jobtype === 'contract' ? theme.palette.info.light :
    jobtype === 'temporary' ? theme.palette.warning.light :
    theme.palette.success.light
  ),
}));

const JobListing = () => {
  const { jobId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        
        if (jobDoc.exists()) {
          const jobData = jobDoc.data();
          setJob({ id: jobDoc.id, ...jobData });
          
          // Check if user has already applied
          if (currentUser && jobData.applicants) {
            const userApplied = jobData.applicants.some(app => app.applicantId === currentUser.uid);
            setApplied(userApplied);
          }
        } else {
          setError("Job listing not found");
        }
      } catch (error) {
        setError("Error fetching job: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [jobId, currentUser]);

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("You must be logged in to apply for jobs");
      return;
    }
    
    if (userProfile?.role !== 'welder') {
      setError("Only welders can apply for jobs");
      return;
    }
    
    try {
      setApplying(true);
      
      const applicationData = {
        applicantId: currentUser.uid,
        applicantName: userProfile?.fullName || 'Anonymous Applicant',
        applicantPhoto: userProfile?.profilePhotoURL || null,
        message: applyMessage,
        appliedAt: new Date().toISOString(),
      };
      
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        applicants: arrayUnion(applicationData)
      });
      
      setApplied(true);
      setApplyMessage('');
      
    } catch (error) {
      setError("Failed to submit application: " + error.message);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error || "Job listing not found"}
      </Alert>
    );
  }

  const isRecruiter = currentUser && userProfile?.role === 'recruiter';
  const isOwner = currentUser && job.recruiterId === currentUser.uid;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <JobHeader elevation={3}>
        <Box flexGrow={1}>
          <Typography variant="h3" component="h1" gutterBottom>
            {job.title}
          </Typography>
          
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
            <Typography variant="h6" color="text.secondary">
              {job.company}
            </Typography>
            <Chip 
              icon={<LocationOnIcon fontSize="small" />}
              label={job.location}
              size="small"
            />
            <JobTypeChip 
              jobtype={job.jobType}
              label={job.jobType.replace('-', ' ')}
              size="small"
            />
            {job.salary && (
              <Chip 
                label={job.salary}
                size="small"
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            <ScheduleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            Posted {formatDate(job.createdAt)}
          </Typography>
        </Box>
        
        {job.companyLogo && (
          <Avatar 
            src={job.companyLogo} 
            alt={job.company}
            sx={{ width: 100, height: 100 }}
          />
        )}
      </JobHeader>
      
      <Box display="flex" gap={2} mb={3}>
        {!isRecruiter && currentUser ? (
          applied ? (
            <Button 
              variant="contained" 
              color="success"
              startIcon={<CheckCircleIcon />}
              disabled
            >
              Applied
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' })}
            >
              Apply Now
            </Button>
          )
        ) : !currentUser ? (
          <Button 
            component={Link} 
            to="/login" 
            variant="outlined" 
            color="primary"
          >
            Log in to Apply
          </Button>
        ) : null}
        
        {isOwner && (
          <Button 
            component={Link} 
            to={`/jobs/${jobId}/applicants`} 
            variant="outlined" 
            color="primary"
            startIcon={<PeopleIcon />}
          >
            View Applicants ({job.applicants?.length || 0})
          </Button>
        )}
      </Box>
      
      {job.salary && (
        <JobSection elevation={3}>
          <Typography variant="h5" gutterBottom>
            Salary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography>{job.salary}</Typography>
        </JobSection>
      )}
      
      <JobSection elevation={3}>
        <Typography variant="h5" gutterBottom>
          Job Description
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {job.description.split('\n').map((paragraph, index) => (
          <Typography key={index} paragraph>
            {paragraph}
          </Typography>
        ))}
      </JobSection>
      
      {job.requirements && (
        <JobSection elevation={3}>
          <Typography variant="h5" gutterBottom>
            Requirements
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {job.requirements.split('\n').map((requirement, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText primary={requirement} />
              </ListItem>
            ))}
          </List>
        </JobSection>
      )}
      
      <JobSection elevation={3}>
        <Typography variant="h5" gutterBottom>
          About the Recruiter
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography paragraph>
          Posted by {job.recruiterName}
        </Typography>
        <Typography>
          Contact: {job.contactEmail}
        </Typography>
      </JobSection>
      
      {currentUser && userProfile?.role === 'welder' && !applied && (
        <JobSection id="apply-form" elevation={3}>
          <Typography variant="h5" gutterBottom>
            Apply for this Position
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleApply}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Add a message to your application (Optional)"
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="Share why you're a good fit for this position..."
              sx={{ mb: 2 }}
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={applying}
              startIcon={applying ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </Box>
        </JobSection>
      )}
    </Container>
  );
};

export default JobListing;