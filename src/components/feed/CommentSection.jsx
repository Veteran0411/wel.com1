import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { 
  Box,
  TextField,
  Avatar,
  Typography,
  Divider,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

const CommentContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const CommentItem = styled(ListItem)(({ theme }) => ({
  alignItems: 'flex-start',
  padding: theme.spacing(1, 0),
}));

const CommentContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: theme.spacing(1),
}));

const CommentTime = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  marginLeft: theme.spacing(1),
}));

const CommentForm = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  marginTop: theme.spacing(2),
  borderRadius: 24,
}));

const CommentInput = styled(TextField)(({ theme }) => ({
  flex: 1,
  marginLeft: theme.spacing(1),
  '& .MuiOutlinedInput-root': {
    borderRadius: 24,
    '& fieldset': {
      border: 'none',
    },
  },
}));


const CommentSection = ({ postId, comments = [] }) => {
  const { currentUser, userProfile } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayComments, setDisplayComments] = useState([]);

  useEffect(() => {
    const fetchCommentData = async () => {
      const enrichedComments = await Promise.all(
        comments.map(async (comment) => {
          // If comment already has author details, return as is
          if (comment.authorName) return comment;
          
          try {
            const userDoc = await getDoc(doc(db, "users", comment.authorId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                ...comment,
                authorName: userData.fullName || 'Anonymous',
                authorPhotoURL: userData.profilePhotoURL || null
              };
            }
            return comment;
          } catch (error) {
            console.error("Error fetching comment author:", error);
            return comment;
          }
        })
      );
      
      setDisplayComments(enrichedComments);
    };
    
    fetchCommentData();
  }, [comments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!currentUser) return;
    if (!newComment.trim()) return;
    
    setLoading(true);
    
    try {
      const postRef = doc(db, "posts", postId);
      
      const commentData = {
        authorId: currentUser.uid,
        authorName: userProfile?.fullName || 'Anonymous',
        authorPhotoURL: userProfile?.profilePhotoURL || null,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      };
      
      await updateDoc(postRef, {
        comments: arrayUnion(commentData)
      });
      
      // Add comment to local state
      setDisplayComments([...displayComments, commentData]);
      setNewComment('');
      
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp.toDate();
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <CommentContainer>
      {displayComments.length > 0 ? (
        <List>
          {displayComments.map((comment, index) => (
            <React.Fragment key={index}>
              <CommentItem>
                <ListItemAvatar>
                  <Avatar 
                    src={comment.authorPhotoURL || '/default-avatar.png'} 
                    alt={comment.authorName}
                  />
                </ListItemAvatar>
                <CommentContent>
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle2" fontWeight="500">
                      {comment.authorName}
                    </Typography>
                    <CommentTime variant="caption">
                      {formatTimestamp(comment.createdAt)}
                    </CommentTime>
                  </Box>
                  <Typography variant="body2" paragraph>
                    {comment.content}
                  </Typography>
                </CommentContent>
              </CommentItem>
              {index < displayComments.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          textAlign="center" 
          py={2}
        >
          No comments yet. Be the first to comment!
        </Typography>
      )}
      
      {currentUser && (
        <CommentForm elevation={1}>
          <Avatar 
            src={userProfile?.profilePhotoURL || '/default-avatar.png'} 
            alt="Your profile"
            sx={{ width: 40, height: 40 }}
          />
          
          <CommentInput
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            disabled={loading}
            fullWidth
          />
          
          <Button
            type="submit"
            onClick={handleSubmitComment}
            disabled={loading || !newComment.trim()}
            color="primary"
            sx={{ minWidth: 40 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <SendIcon />
            )}
          </Button>
        </CommentForm>
      )}
    </CommentContainer>
  );
};

export default CommentSection;