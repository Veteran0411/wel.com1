import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Box,
  Button,
  TextField,
  Avatar,
  Typography,
  Paper,
  IconButton,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';

const CreatePostContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.shadows[1],
  marginBottom: theme.spacing(3),
}));

const PostForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const PostHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const PostTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5),
    fontSize: '0.95rem',
  }
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 12,
  overflow: 'hidden',
  marginTop: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const RemoveImageButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
  }
}));

const PostActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const AttachmentButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  color: theme.palette.text.secondary,
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  textTransform: 'none',
}));

const CreatePost = ({ onPostCreated }) => {
  const { currentUser, userProfile } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a post');
      return;
    }
    
    if (!content.trim() && !image) {
      setError('Post cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      let imageURL = null;
      
      // Upload image if one was selected
      if (image) {
        const imageRef = ref(storage, `postImages/${currentUser.uid}/${Date.now()}-${image.name}`);
        await uploadBytes(imageRef, image);
        imageURL = await getDownloadURL(imageRef);
      }
      
      // Create post in Firestore
      const postData = {
        authorId: currentUser.uid,
        authorName: userProfile?.fullName || 'Anonymous User',
        authorPhotoURL: userProfile?.profilePhotoURL || null,
        content: content.trim(),
        imageURL,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, "posts"), postData);
      
      // Reset form
      setContent('');
      setImage(null);
      setImagePreview(null);
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated(docRef.id);
      }
      
    } catch (error) {
      setError('Failed to create post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };
  return (
    <CreatePostContainer elevation={0}>
      <PostForm onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <PostHeader>
          <Avatar 
            src={userProfile?.profilePhotoURL || '/default-avatar.png'} 
            alt="Profile"
            sx={{ width: 48, height: 48 }}
          />
          <Typography variant="h6" fontWeight="500">
            Share an update
          </Typography>
        </PostHeader>
        
        <PostTextField
          multiline
          rows={4}
          placeholder={`What's on your mind, ${userProfile?.fullName?.split(' ')[0] || 'there'}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          fullWidth
        />
        
        {imagePreview && (
          <ImagePreviewContainer>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} 
            />
            <RemoveImageButton onClick={handleRemoveImage}>
              <CloseIcon />
            </RemoveImageButton>
          </ImagePreviewContainer>
        )}
        
        <Divider />
        
        <PostActions>
          <div>
            <input 
              accept="image/*" 
              id="post-image-upload" 
              type="file" 
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="post-image-upload">
              <AttachmentButton 
                component="span"
                startIcon={<AddPhotoAlternateIcon />}
              >
                Photo
              </AttachmentButton>
            </label>
          </div>
          
          <SubmitButton
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || (!content.trim() && !image)}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Post'
            )}
          </SubmitButton>
        </PostActions>
      </PostForm>
    </CreatePostContainer>
  );
};

export default CreatePost;