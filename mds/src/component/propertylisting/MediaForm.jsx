'use client'
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, Grid, Card, CardMedia, CardContent,
  IconButton, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Checkbox, Alert, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, Badge, Divider, Paper,
  ImageList, ImageListItem, ImageListItemBar
} from '@mui/material';
import {
  CloudUpload, Delete, Edit, Star, StarBorder,
  Image as ImageIcon, VideoFile, Close, Warning, Search,
  ArrowBack, ArrowForward
} from '@mui/icons-material';
import {
  uploadPropertyMedia, updateMediaItem, deleteMediaItem,
  getMediaByTags, completeMediaStep, validatePropertyMedia
} from '@/redux/features/property/propertySlice';

const MediaForm = ({ propertyId, onComplete, onBack }) => {
  const dispatch = useDispatch();
  const { currentProperty, isLoading, error } = useSelector(state => state.property);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingMedia, setEditingMedia] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [tagGroupDialog, setTagGroupDialog] = useState(false);
  const [selectedTagGroup, setSelectedTagGroup] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mediaFilter, setMediaFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [validationError, setValidationError] = useState('');
  const [validationDetails, setValidationDetails] = useState(null);

  const fileInputRef = useRef(null);

  const images = currentProperty?.media?.images || [];
  const videos = currentProperty?.media?.videos || [];
  const allMedia = [...images, ...videos];

  // Check which media items are missing tags
  const itemsWithoutTags = allMedia.filter(item => !item.tags || item.tags.length === 0);
  const coverPhoto = allMedia.find(item => item.isCover && item.type === 'image');


  console.log(error,"Media Form Error")

  // All available tags in one flat list
  const availableTags = [
    'Activities and Experiences',
    'Bhojnalay',
    'Bonfire',
    'Entrance',
    'Food',
    'Food Menu',
    'Kitchen',
    'Living area',
    'Lobby/ Common Area',
    'Lounge',
    'Others',
    'OutsideView',
    'Room',
    'Washroom',
    'Bed',
  ];

  // Group media by tags - each media item can appear in multiple groups
  const getMediaByTag = () => {
    const groupedMedia = {};
    
    allMedia.forEach(item => {
      if (item.tags && item.tags.length > 0) {
        item.tags.forEach(tag => {
          if (!groupedMedia[tag]) {
            groupedMedia[tag] = [];
          }
          groupedMedia[tag].push(item);
        });
      }
    });
    
    return groupedMedia;
  };

  const groupedMedia = getMediaByTag();

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    setValidationError('');

    if (files.length > 20) {
      setValidationError('You can upload maximum 20 files at once');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('media', file);
    });

    try {
      await dispatch(uploadPropertyMedia({ propertyId, formData })).unwrap();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      try {
        await dispatch(deleteMediaItem({ propertyId, mediaId })).unwrap();
        // setEditDialog(false)
        setTagGroupDialog(false)
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleEditMedia = (mediaItem) => {
    setEditingMedia({
      ...mediaItem,
      tags: mediaItem.tags || []
    });
    setEditDialog(true);
  };

  const handleTagGroupClick = (tag, mediaItems) => {
    setSelectedTagGroup({ tag, mediaItems });
    setSelectedImageIndex(0);
    setTagGroupDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;

    if (!editingMedia.tags || editingMedia.tags.length === 0) {
      alert('Please select at least one tag before saving.');
      return;
    }

    try {
      await dispatch(updateMediaItem({
        propertyId,
        mediaId: editingMedia._id,
        data: {
          tags: editingMedia.tags,
          isCover: editingMedia.isCover,
          displayOrder: editingMedia.displayOrder
        }
      })).unwrap();
      setEditDialog(false);
      setEditingMedia(null);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleCompleteStep = async () => {
    if (itemsWithoutTags.length > 0) {
      setValidationDetails(itemsWithoutTags);
      setValidationError(`${itemsWithoutTags.length} media item(s) are missing tags. Please add tags to all media items before proceeding.`);
      return;
    }

    try {
      const Result = await dispatch(completeMediaStep(propertyId)).unwrap();
      onComplete?.();
    } catch (error) {
      console.error('Complete step failed:', error);
    }
  };

  const handleTagToggle = (tag) => {
    if (!editingMedia) return;

    const currentTags = editingMedia.tags || [];
    const isSelected = currentTags.includes(tag);

    if (isSelected) {
      setEditingMedia(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }));
    } else {
      setEditingMedia(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setEditingMedia(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !editingMedia.tags.includes(customTag.trim())) {
      setEditingMedia(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
    }
  };

  const nextImage = () => {
    if (selectedTagGroup && selectedImageIndex < selectedTagGroup.mediaItems.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const previousImage = () => {
    if (selectedTagGroup && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleSetCoverFromGroup = async (mediaItem) => {
    if (mediaItem.type !== 'image') return;
    
    try {
      await dispatch(updateMediaItem({
        propertyId,
        mediaId: mediaItem._id,
        data: {
          ...mediaItem,
          isCover: true
        }
      })).unwrap();
    } catch (error) {
      console.error('Set cover failed:', error);
    }
  };

  // Tag Group Card Component
  const TagGroupCard = ({ tag, mediaItems }) => {
    const firstImage = mediaItems[0];
    const imageCount = mediaItems.filter(item => item.type === 'image').length;
    const videoCount = mediaItems.filter(item => item.type === 'video').length;

    return (
      <Card 
        sx={{
          width: 280,
          height: 200,
          position: 'relative',
          cursor: 'pointer',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
          '&:hover': {
            transform: 'scale(1.02)',
            transition: 'transform 0.2s ease-in-out',
            boxShadow: 3
          }
        }}
        onClick={() => handleTagGroupClick(tag, mediaItems)}
      >
        {firstImage.type === 'image' ? (
          <CardMedia
            component="img"
            image={`${firstImage.url}`}
            alt={firstImage.filename}
            sx={{
              width: '100%',
              height: '70%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <video
            src={`${firstImage.url}`}
            style={{
              width: '100%',
              height: '70%',
              objectFit: 'cover'
            }}
            muted
            loop
            autoPlay
            preload="metadata"
          />
        )}

        <CardContent sx={{ height: '30%', p: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {tag}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {imageCount > 0 && (
              <Chip 
                label={`${imageCount} Images`} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
            {videoCount > 0 && (
              <Chip 
                label={`${videoCount} Videos`} 
                size="small" 
                color="secondary" 
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </CardContent>

        {/* Total count badge */}
        <Badge 
          badgeContent={mediaItems.length} 
          color="primary"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              minWidth: 20,
              height: 20
            }
          }}
        />
      </Card>
    );
  };

  return (
    <Box>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <Typography variant="h5" gutterBottom>
          Photos and Videos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </Box>
      </div>

      {/* Alerts */}
      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Uploading files...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* Tagged Media Groups */}
      {Object.keys(groupedMedia).length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Media by Tags
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(groupedMedia).map(([tag, mediaItems]) => (
              <Grid item key={tag}>
                <TagGroupCard tag={tag} mediaItems={mediaItems} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Untagged Media */}
      {itemsWithoutTags.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="error">
            Untagged Media ({itemsWithoutTags.length})
          </Typography>
          <Grid container spacing={2}>
            {itemsWithoutTags.map((mediaItem) => (
              <Grid item key={mediaItem._id}>
                <Card 
                  sx={{
                    width: 200,
                    height: 150,
                    position: 'relative',
                    cursor: 'pointer',
                    border: '2px solid #f44336',
                    borderRadius: 2,
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s ease-in-out',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleEditMedia(mediaItem)}
                >
                  {mediaItem.type === 'image' ? (
                    <CardMedia
                      component="img"
                      image={`${mediaItem.url}`}
                      alt={mediaItem.filename}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <video
                      src={`${mediaItem.url}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      muted
                      loop
                      autoPlay
                      preload="metadata"
                    />
                  )}
                  <Chip
                    label="Needs Tags"
                    color="error"
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      left: 8,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Status Alerts */}
      <Alert
        severity={allMedia.length >= 3 ? "success" : "info"}
        sx={{ mb: 2 }}
      >
        {allMedia.length >= 3
          ? `Great! You have ${allMedia.length} media items uploaded.`
          : `You need at least 3 media items. Currently have ${allMedia.length}.`
        }
      </Alert>

      {itemsWithoutTags.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {itemsWithoutTags.length} media item(s) need tags before you can proceed.
          Click on items with red borders to add tags.
        </Alert>
      )}

      {/* Tag Group Dialog */}
      <Dialog open={tagGroupDialog} onClose={() => setTagGroupDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedTagGroup?.tag} ({selectedTagGroup?.mediaItems.length} items)
          </Typography>
          <IconButton onClick={() => setTagGroupDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedTagGroup && (
            <Grid container spacing={3}>
              {/* Main Image Display */}
              <Grid item size={{xs:12,md:8}}>
                <Box sx={{ position: 'relative' }}>
                  {selectedTagGroup.mediaItems[selectedImageIndex]?.type === 'image' ? (
                    <img
                      src={`${selectedTagGroup.mediaItems[selectedImageIndex].url}`}
                      alt={selectedTagGroup.mediaItems[selectedImageIndex].filename}
                      style={{
                        width: '100%',
                        height: '500px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <video
                      src={`${selectedTagGroup.mediaItems[selectedImageIndex].url}`}
                      style={{
                        width: '100%',
                        height: '500px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      controls
                    />
                  )}
                  
                  {/* Navigation arrows */}
                  {selectedImageIndex > 0 && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                      onClick={previousImage}
                    >
                      <ArrowBack />
                    </IconButton>
                  )}
                  
                  {selectedImageIndex < selectedTagGroup.mediaItems.length - 1 && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                      onClick={nextImage}
                    >
                      <ArrowForward />
                    </IconButton>
                  )}

                  {/* Image counter */}
                  <Chip
                    label={`${selectedImageIndex + 1} / ${selectedTagGroup.mediaItems.length}`}
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white'
                    }}
                  />
                </Box>

                {/* Action buttons for current image */}
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  {selectedTagGroup.mediaItems[selectedImageIndex]?.type === 'image' && (
                    <Button
                      variant="outlined"
                      startIcon={<Star />}
                      onClick={() => handleSetCoverFromGroup(selectedTagGroup.mediaItems[selectedImageIndex])}
                      disabled={selectedTagGroup.mediaItems[selectedImageIndex]?.isCover}
                    >
                      {selectedTagGroup.mediaItems[selectedImageIndex]?.isCover ? 'Cover Photo' : 'Set as Cover'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => handleEditMedia(selectedTagGroup.mediaItems[selectedImageIndex])}
                  >
                    Edit Tags
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteMedia(selectedTagGroup.mediaItems[selectedImageIndex]._id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Grid>

            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (existing) */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {editingMedia?.tags?.length > 0 ? editingMedia.tags[0] : 'Untitled'} 
          ({editingMedia ? '1' : '0'})
        </DialogTitle>
        <DialogContent>
          {editingMedia && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative' }}>
                  {editingMedia.type === 'image' ? (
                    <img
                      src={`${editingMedia.url}`}
                      alt={editingMedia.filename}
                      style={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <video
                      src={`${editingMedia.url}`}
                      style={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      controls
                    />
                  )}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255,255,255,0.8)'
                    }}
                    onClick={() => handleDeleteMedia(editingMedia._id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                {editingMedia.type === 'image' && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingMedia.isCover || false}
                        onChange={(e) => setEditingMedia(prev => ({
                          ...prev,
                          isCover: e.target.checked
                        }))}
                      />
                    }
                    label="Set as cover photo"
                    sx={{ mt: 2 }}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Tags Added
                </Typography>

                <Box sx={{
                  mb: 2,
                  minHeight: 60,
                  border: `1px solid ${(!editingMedia.tags || editingMedia.tags.length === 0) ? '#f44336' : '#e0e0e0'}`,
                  borderRadius: 1,
                  p: 2,
                  bgcolor: '#f9f9f9',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  {editingMedia.tags.length > 0 ? (
                    editingMedia.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        deleteIcon={<Close />}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No tags selected
                    </Typography>
                  )}
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add Tags"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCustomTag();
                    }
                  }}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />

                <Box sx={{
                  maxHeight: 300,
                  overflow: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1
                }}>
                  <List dense>
                    {availableTags.map((tag) => (
                      <ListItem key={tag} dense button onClick={() => handleTagToggle(tag)}>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={editingMedia.tags.includes(tag)}
                            onChange={() => handleTagToggle(tag)}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={tag}
                          primaryTypographyProps={{ fontSize: '0.875rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editingMedia?.tags || editingMedia.tags.length === 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          Previous
        </Button>
        <Button
          variant="contained"
          onClick={handleCompleteStep}
          disabled={isLoading || allMedia.length < 3 || itemsWithoutTags.length > 0}
        >
          Save & Continue
        </Button>
      </Box>
    </Box>
  );
};

export default MediaForm;