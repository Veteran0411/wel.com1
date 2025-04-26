import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';
import { 
  Box,
  Button,
  Typography,
  Avatar,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { styled } from '@mui/material/styles';

const PostCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  }
}));

const PostHeader = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(2),
  alignItems: 'flex-start',
  '& .MuiCardHeader-avatar': {
    marginRight: theme.spacing(1.5)
  }
}));

const PostContent = styled(CardContent)(({ theme }) => ({
  paddingTop: 0,
  paddingBottom: theme.spacing(1),
  '& p': {
    marginBottom: theme.spacing(1.5),
    fontSize: '0.95rem',
    lineHeight: 1.5
  }
}));

const PostImage = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: 400,
  objectFit: 'cover',
  borderRadius: 8,
  marginTop: theme.spacing(1.5)
}));

const PostStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(0, 2),
  '& > *': {
    marginRight: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontSize: '0.8rem'
  }
}));

const PostActions = styled(CardActions)(({ theme }) => ({
  padding: theme.spacing(0, 1, 1),
  justifyContent: 'space-around',
  borderTop: `1px solid ${theme.palette.divider}`
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(0.5, 1.5),
  textTransform: 'none',
  fontWeight: 500,
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(0.5)
  }
}));

const PostItem = ({ post }) => {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authorProfile, setAuthorProfile] = useState(null);

  useEffect(() => {
    // Check if post is liked by current user
    if (post.likes && currentUser) {
      setLiked(post.likes.includes(currentUser.uid));
    }
    
    // Set like count
    setLikeCount(post.likes?.length || 0);
    
    // Fetch author info if not available
    const fetchAuthorProfile = async () => {
      if (!post.authorName && post.authorId) {
        try {
          const authorDoc = await getDoc(doc(db, "users", post.authorId));
          if (authorDoc.exists()) {
            setAuthorProfile(authorDoc.data());
          }
        } catch (error) {
          console.error("Error fetching author profile:", error);
        }
      }
    };
    
    fetchAuthorProfile();
  }, [post, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    const postRef = doc(db, "posts", post.id);
    
    try {
      if (liked) {
        // Unlike post
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        // Like post
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error updating likes:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

   const displayName = post.authorName || authorProfile?.fullName || 'Anonymous User';
  const profilePhoto = post.authorPhotoURL || authorProfile?.profilePhotoURL || '/default-avatar.png';

  return (
    <PostCard>
      <PostHeader
        avatar={
          <Avatar 
            src={profilePhoto} 
            alt={displayName}
            sx={{ width: 40, height: 40 }}
          />
        }
        title={
          <Typography variant="subtitle1" fontWeight="600">
            {displayName}
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {formatTimestamp(post.createdAt)}
          </Typography>
        }
      />
      
      <PostContent>
        <Typography>{post.content}</Typography>
        
        {post.imageURL && (
          <PostImage src={post.imageURL} alt="Post attachment" />
        )}
      </PostContent>
      
      <PostStats>
        <Typography>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</Typography>
        <Typography>{post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}</Typography>
      </PostStats>
      
      <Divider />
      
      <PostActions disableSpacing>
        <ActionButton
          startIcon={liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          onClick={handleLike}
          disabled={loading || !currentUser}
          sx={{ color: liked ? 'error.main' : 'text.secondary' }}
        >
          {liked ? 'Liked' : 'Like'}
          {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </ActionButton>
        
        <ActionButton
          startIcon={<ChatBubbleOutlineIcon />}
          onClick={toggleComments}
        >
          Comment
        </ActionButton>
      </PostActions>
      
      {showComments && (
        <Box sx={{ p: 2 }}>
          <CommentSection postId={post.id} comments={post.comments} />
        </Box>
      )}
    </PostCard>
  );
};

export default PostItem;