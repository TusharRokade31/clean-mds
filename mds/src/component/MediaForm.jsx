'use client'
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, Grid, Card, CardMedia, CardContent,
  IconButton, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Checkbox, Alert, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  CloudUpload, Delete, Edit, Star, StarBorder, 
  Image as ImageIcon, VideoFile, Close
} from '@mui/icons-material';
import {
  uploadPropertyMedia, updateMediaItem, deleteMediaItem,
  getMediaByTags, completeMediaStep
} from '@/redux/features/property/propertySlice';

const MediaForm = ({ propertyId, onSave, onBack }) => {
  const dispatch = useDispatch();
  const { currentProperty, isLoading, error } = useSelector(state => state.property);
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingMedia, setEditingMedia] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [mediaFilter, setMediaFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [customTag, setCustomTag] = useState('');
  
  const fileInputRef = useRef(null);

  const images = currentProperty?.media?.images || [];
  const videos = currentProperty?.media?.videos || [];
  const allMedia = [...images, ...videos];

  // All available tags in one flat list
  const availableTags = [
    'Activities & Experiences',
    'Banquet',
    'Bar',
    'Barbeque',
    'Beach Access',
    'Bike Rental',
    'Board Games',
    'Bowling',
    'Business Center',
    'Casino',
    'Cooking Classes',
    'Dance Floor',
    'Entertainment',
    'Fitness Center',
    'Game Room',
    'Golf Course',
    'Gym',
    'Hot Tub',
    'Jacuzzi',
    'Karaoke',
    'Kids Club',
    'Library',
    'Live Music',
    'Massage',
    'Movie Theater',
    'Night Club',
    'Outdoor Activities',
    'Pool',
    'Restaurant',
    'Sauna',
    'Spa',
    'Sports Bar',
    'Swimming Pool',
    'Tennis Court',
    'Water Sports',
    'Wine Tasting',
    'Yoga Studio',
    'Bedroom',
    'Bathroom',
    'Kitchen',
    'Living Room',
    'Dining Room',
    'Balcony',
    'Terrace',
    'Garden View',
    'Ocean View',
    'Mountain View',
    'City View',
    'WiFi',
    'Air Conditioning',
    'Heating',
    'TV',
    'Refrigerator',
    'Microwave',
    'Coffee Maker',
    'Washer',
    'Dryer',
    'Iron',
    'Hair Dryer',
    'Safe',
    'Mini Bar'
  ];

  // Filter media based on type and tags
  const filteredMedia = allMedia.filter(item => {
    const typeMatch = mediaFilter === 'all' || 
      (mediaFilter === 'image' && item.type === 'image') ||
      (mediaFilter === 'video' && item.type === 'video');
    
    const tagMatch = !tagFilter || 
      item.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()));
    
    return typeMatch && tagMatch;
  });

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    
    // Create preview URLs for selected files
    const previews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name,
      isPreview: true
    }));
    setPreviewFiles(previews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('media', file);
    });

    try {
      await dispatch(uploadPropertyMedia({ propertyId, formData })).unwrap();
      
      setSelectedFiles([]);
      setPreviewFiles([]);
      
      previewFiles.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  useEffect(() => {
    return () => {
      previewFiles.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previewFiles]);

  const handleDeleteMedia = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      try {
        await dispatch(deleteMediaItem({ propertyId, mediaId })).unwrap();
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

  const handleSaveEdit = async () => {
    if (!editingMedia) return;

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

  const handleSetCover = async (mediaItem) => {
    if (mediaItem.type !== 'image') return;

    try {
      await dispatch(updateMediaItem({
        propertyId,
        mediaId: mediaItem._id,
        data: { isCover: !mediaItem.isCover }
      })).unwrap();
    } catch (error) {
      console.error('Set cover failed:', error);
    }
  };

  const handleCompleteStep = async () => {
    try {
      await dispatch(completeMediaStep(propertyId)).unwrap();
      onSave();
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Photos and Videos
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Upload at least 10 media items to showcase your property. 
        Include high-quality photos and videos that highlight your property's best features.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Upload Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload Media
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mr: 2 }}
            >
              Select Files
            </Button>
            
            {selectedFiles.length > 0 && (
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={isLoading}
              >
                Upload {selectedFiles.length} file(s)
              </Button>
            )}
          </Box>

          {/* Preview Section */}
          {previewFiles.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Files Preview:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {previewFiles.map((preview, index) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                    <Card sx={{ aspectRatio: '1/1' }}>
                      <Box sx={{ 
                        position: 'relative', 
                        width: '100%',
                        paddingBottom: '100%',
                        overflow: 'hidden'
                      }}>
                        {preview.type === 'image' ? (
                            <CardMedia
                                component="img"
                                image={preview.url}
                                alt={preview.name}
                                sx={{ 
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                                }}
                            />
                            ) : (
                            <video
                                src={preview.url}
                                style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                                }}
                                // controls
                                muted
                                autoPlay
                                loop
                                preload="metadata"
                            />
                            )}
                        <Chip
                          label="Preview"
                          size="small"
                          color="secondary"
                          sx={{ position: 'absolute', top: 4, left: 4 }}
                        />
                      </Box>
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="caption" noWrap>
                          {preview.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {isLoading && <LinearProgress sx={{ mt: 2 }} />}
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant={mediaFilter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setMediaFilter('all')}
        >
          All ({allMedia.length})
        </Button>
        <Button
          variant={mediaFilter === 'image' ? 'contained' : 'outlined'}
          onClick={() => setMediaFilter('image')}
        >
          Images ({images.length})
        </Button>
        <Button
          variant={mediaFilter === 'video' ? 'contained' : 'outlined'}
          onClick={() => setMediaFilter('video')}
        >
          Videos ({videos.length})
        </Button>
        
        <TextField
          size="small"
          placeholder="Filter by tags..."
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          sx={{ ml: 'auto', width: 200 }}
        />
      </Box>

      {/* Media Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {filteredMedia.map((mediaItem) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={mediaItem._id}>
            <Card sx={{ aspectRatio: '1/1' }}>
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                paddingBottom: '75%',
                overflow: 'hidden'
              }}>
                {mediaItem.type === 'image' ? (
                  <CardMedia
                    component="img"
                    image={`http://localhost:5000/${mediaItem.url}`}
                    alt={mediaItem.filename}
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.200'
                    }}
                  >
                <video
                src={`http://localhost:5000/${mediaItem.url}`}
                style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
                }}
                // controls
                muted
                loop
                autoPlay
                preload="metadata"
            />
                  </Box>
                )}
                
                {mediaItem.isCover && (
                  <Chip
                    label="Cover"
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 4, left: 4 }}
                  />
                )}
                
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5
                  }}
                >
                  {mediaItem.type === 'image' && (
                    <IconButton
                      size="small"
                      onClick={() => handleSetCover(mediaItem)}
                      sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                    >
                      {mediaItem.isCover ? <Star color="primary" /> : <StarBorder />}
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleEditMedia(mediaItem)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteMedia(mediaItem._id)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
              
              <CardContent sx={{ p: 1, height: 60 }}>
                <Typography variant="caption" noWrap sx={{ display: 'block' }}>
                  {mediaItem.filename}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {mediaItem.tags.slice(0, 2).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ 
                        mr: 0.5, 
                        mb: 0.5, 
                        fontSize: '0.6rem',
                        height: 16
                      }}
                    />
                  ))}
                  {mediaItem.tags.length > 2 && (
                    <Typography variant="caption" color="textSecondary">
                      +{mediaItem.tags.length - 2} more
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Alert 
        severity={allMedia.length >= 10 ? "success" : "info"} 
        sx={{ mb: 3 }}
      >
        {allMedia.length >= 10 
          ? `Great! You have ${allMedia.length} media items uploaded.`
          : `You need at least 10 media items. Currently have ${allMedia.length}.`
        }
      </Alert>

      {/* Edit Dialog with Simple Tag List */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Media Item</DialogTitle>
        <DialogContent>
          {editingMedia && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Filename: {editingMedia.filename}
              </Typography>
              
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
                  label="Set as cover image"
                />
              )}
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Selected Tags
              </Typography>
              
              <Box sx={{ 
                mb: 2, 
                minHeight: 40, 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                p: 1,
                bgcolor: '#f9f9f9'
              }}>
                {editingMedia.tags.length > 0 ? (
                  editingMedia.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      deleteIcon={<Close />}
                      sx={{ mr: 0.5, mb: 0.5 }}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No tags selected
                  </Typography>
                )}
              </Box>
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Add Tags
              </Typography>
              
              <Box sx={{ 
                maxHeight: 300, 
                overflow: 'auto', 
                border: '1px solid #e0e0e0', 
                borderRadius: 1,
                mb: 2
              }}>
                <List dense>
                  {availableTags.map((tag) => (
                    <ListItem key={tag} dense>
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
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Add Custom Tag
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Enter custom tag..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCustomTag();
                    }
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  onClick={addCustomTag}
                  variant="outlined"
                  size="small"
                  disabled={!customTag.trim()}
                >
                  Add Tag
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
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
          disabled={isLoading || allMedia.length < 10}
        >
          Save & Continue
        </Button>
      </Box>
    </Box>
  );
};

export default MediaForm;