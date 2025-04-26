import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, orderBy, limit, getDocs, where, startAfter } from 'firebase/firestore';
import CreatePost from './CreatePost';
import PostItem from './PostItem';
import { 
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Typography,
  Alert,
  Paper,
  Avatar,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';

const FeedContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const FeedHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const LoadMoreButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  borderRadius: 20,
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

const EmptyFeedPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: 12,
  backgroundColor: theme.palette.background.default,
}));

const NewsFeed = () => {
  const { currentUser, userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  const postsPerPage = 10;

  // Initial posts fetch
  useEffect(() => {
    fetchPosts();
  }, [currentUser]);

  const fetchPosts = async (loadMore = false) => {
    if (loadMore && !hasMore) return;
    
    try {
      setLoadingMore(loadMore);
      if (!loadMore) setLoading(true);
      
      let postsQuery;
      
      if (userProfile?.connections?.length > 0) {
        // If user has connections, show posts from connections and own posts
        const connectionIds = [...userProfile.connections];
        if (currentUser) connectionIds.push(currentUser.uid);
        
        if (loadMore && lastVisible) {
          postsQuery = query(
            collection(db, "posts"),
            where("authorId", "in", connectionIds),
            orderBy("createdAt", "desc"),
            startAfter(lastVisible),
            limit(postsPerPage)
          );
        } else {
          postsQuery = query(
            collection(db, "posts"),
            where("authorId", "in", connectionIds),
            orderBy("createdAt", "desc"),
            limit(postsPerPage)
          );
        }
      } else {
        // If no connections, show all posts
        if (loadMore && lastVisible) {
          postsQuery = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc"),
            startAfter(lastVisible),
            limit(postsPerPage)
          );
        } else {
          postsQuery = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc"),
            limit(postsPerPage)
          );
        }
      }
      
      const querySnapshot = await getDocs(postsQuery);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        if (!loadMore) setPosts([]);
        return;
      }
      
      // Set the last visible document for pagination
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      
      // Check if we have fewer docs than the limit
      setHasMore(querySnapshot.docs.length >= postsPerPage);
      
      const newPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (loadMore) {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
    } catch (error) {
      setError("Error fetching posts: " + error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchPosts(true);
  };

  const handlePostCreated = () => {
    // Refresh posts after a new one is created
    setLastVisible(null);
    fetchPosts();
  };

  return (
    <FeedContainer maxWidth="md">
      {currentUser && (
        <Paper elevation={0} sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CreatePost onPostCreated={handlePostCreated} />
        </Paper>
      )}
      
      <Box>
        <FeedHeader>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            mr: 2,
            width: 40,
            height: 40
          }}>
            <Typography variant="h6">WC</Typography>
          </Avatar>
          <Typography variant="h5" fontWeight="600">
            Welder's Community Feed
          </Typography>
        </FeedHeader>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box>
            {[...Array(3)].map((_, index) => (
              <Paper key={index} elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box ml={2}>
                    <Skeleton variant="text" width={120} height={24} />
                    <Skeleton variant="text" width={80} height={20} />
                  </Box>
                </Box>
                <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
              </Paper>
            ))}
          </Box>
        ) : posts.length > 0 ? (
          <>
            {posts.map(post => (
              <Paper 
                key={post.id} 
                elevation={1} 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'box-shadow 0.3s',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              >
                <PostItem post={post} />
              </Paper>
            ))}
            
            {hasMore && (
              <Box display="flex" justifyContent="center" mt={4}>
                <LoadMoreButton
                  variant="contained"
                  color="primary"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Show More Updates'
                  )}
                </LoadMoreButton>
              </Box>
            )}
          </>
        ) : (
          <EmptyFeedPaper elevation={0}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {currentUser ? 'Your feed is empty' : 'Welcome to Welder\'s Connect'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {currentUser 
                ? 'Connect with others or be the first to share something!' 
                : 'Sign in to see updates from your network.'}
            </Typography>
          </EmptyFeedPaper>
        )}
      </Box>
    </FeedContainer>
  );
};

export default NewsFeed;