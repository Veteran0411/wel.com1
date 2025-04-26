import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, orderBy, where, getDocs, limit, startAfter } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { 
  Box,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SearchIcon from '@mui/icons-material/Search';

const JobsListContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const JobCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
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

const SearchForm = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const JobsList = () => {
  const { currentUser, userProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  
  const jobsPerPage = 10;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (loadMore = false) => {
    if (loadMore && !hasMore) return;
    
    try {
      setLoadingMore(loadMore);
      if (!loadMore) setLoading(true);
      
      let jobsQuery;
      
      if (loadMore && lastVisible) {
        jobsQuery = query(
          collection(db, "jobs"),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(jobsPerPage)
        );
      } else {
        jobsQuery = query(
          collection(db, "jobs"),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          limit(jobsPerPage)
        );
      }
      
      const querySnapshot = await getDocs(jobsQuery);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        if (!loadMore) setJobs([]);
        return;
      }
      
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      
      setHasMore(querySnapshot.docs.length >= jobsPerPage);
      
      const newJobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (loadMore) {
        setJobs(prevJobs => [...prevJobs, ...newJobs]);
      } else {
        setJobs(newJobs);
      }
      
    } catch (error) {
      setError("Error fetching jobs: " + error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    let filteredJobs = jobs;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(term) || 
        job.company.toLowerCase().includes(term) || 
        job.description.toLowerCase().includes(term)
      );
    }
    
    if (location) {
      const locationTerm = location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locationTerm)
      );
    }
    
    if (jobType) {
      filteredJobs = filteredJobs.filter(job => job.jobType === jobType);
    }
    
    setJobs(filteredJobs);
  };

  const handleLoadMore = () => {
    fetchJobs(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const isRecruiter = userProfile?.role === 'recruiter';

  return (
    <JobsListContainer maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h3" component="h1">
          Welding Jobs
        </Typography>
        {isRecruiter && (
          <Button 
            component={Link} 
            to="/jobs/create" 
            variant="contained" 
            color="primary"
            startIcon={<WorkIcon />}
          >
            Post New Job
          </Button>
        )}
      </Box>
      
      <SearchForm elevation={3}>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Search job title or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  label="Job Type"
                >
                  <MenuItem value="">All Job Types</MenuItem>
                  <MenuItem value="full-time">Full-time</MenuItem>
                  <MenuItem value="part-time">Part-time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="temporary">Temporary</MenuItem>
                  <MenuItem value="apprenticeship">Apprenticeship</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button 
                fullWidth 
                type="submit" 
                variant="contained" 
                color="primary"
                sx={{ height: '100%' }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>
      </SearchForm>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : jobs.length > 0 ? (
        <>
          <Grid container spacing={2}>
            {jobs.map(job => (
              <Grid item xs={12} key={job.id}>
                <JobCard>
                  <Button 
                    component={Link} 
                    to={`/jobs/${job.id}`} 
                    fullWidth 
                    sx={{ textAlign: 'left', p: 0 }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        {job.companyLogo ? (
                          <Avatar 
                            src={job.companyLogo} 
                            alt={job.company} 
                            sx={{ width: 56, height: 56, mr: 2 }}
                          />
                        ) : (
                          <Avatar 
                            sx={{ 
                              width: 56, 
                              height: 56, 
                              mr: 2,
                              bgcolor: 'primary.main',
                              color: 'white',
                              fontSize: '1.5rem'
                            }}
                          >
                            {job.company.charAt(0)}
                          </Avatar>
                        )}
                        
                        <Box flexGrow={1}>
                          <Typography variant="h6" component="h3">
                            {job.title}
                          </Typography>
                          <Typography variant="subtitle1" color="text.secondary">
                            {job.company}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
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
                            icon={<AttachMoneyIcon fontSize="small" />}
                            label={job.salary}
                            size="small"
                          />
                        )}
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          <ScheduleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          Posted {formatDate(job.createdAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <PeopleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {job.applicants?.length || 0} applicants
                        </Typography>
                      </Box>
                    </CardContent>
                  </Button>
                </JobCard>
              </Grid>
            ))}
          </Grid>
          
          {hasMore && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Button 
                variant="outlined" 
                onClick={handleLoadMore}
                disabled={loadingMore}
                startIcon={loadingMore ? <CircularProgress size={20} /> : null}
              >
                {loadingMore ? 'Loading...' : 'Load More Jobs'}
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No job listings found. Check back later for new opportunities.
          </Typography>
        </Paper>
      )}
    </JobsListContainer>
  );
};

export default JobsList;