'use client'
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, Grid, Card, CardMedia, CardContent,
  IconButton, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Checkbox, Alert, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, Badge, Accordion,
  AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import {
  CloudUpload, Delete, Edit, Star, StarBorder, 
  Image as ImageIcon, VideoFile, Close, Warning, ExpandMore
} from '@mui/icons-material';
import {
  uploadRoomMedia, updateRoomMediaItem, deleteRoomMediaItem,
  getRoomMedia
} from '@/redux/features/property/propertySlice';

const RoomMediaForm = ({ propertyId, onSave, onBack }) => {
  const dispatch = useDispatch();
  const { currentProperty, isLoading, error } = useSelector(state => state.property);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingMedia, setEditingMedia] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [mediaFilter, setMediaFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [validationError, setValidationError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [expandedRoom, setExpandedRoom] = useState(null);
  
  const fileInputRefs = useRef({});

  const rooms = currentProperty?.rooms || [];

  // All available tags for room media
  const availableRoomTags = [
    'Bed',
    'Bathroom/Washroom',
    'Room View',
    'Balcony',
    'Furniture',
    'Amenities',
    'Decor',
    'Lighting',
    'Storage',
    'Window View',
    'Others'
  ];

  // Get media for a specific room
  const getRoomMediaItems = (room) => {
    if (!room.media) return [];
    const images = room.media.images || [];
    const videos = room.media.videos || [];
    return [...images, ...videos];
  };

  // Check which media items are missing tags for a room
  const getRoomItemsWithoutTags = (room) => {
    const allMedia = getRoomMediaItems(room);
    return allMedia.filter(item => !item.tags || item.tags.length === 0);
  };

  // Filter media based on type and tags for a specific room
  const getFilteredRoomMedia = (room) => {
    const allMedia = getRoomMediaItems(room);
    return allMedia.filter(item => {
      const typeMatch = mediaFilter === 'all' || 
        (mediaFilter === 'image' && item.type === 'image') ||
        (mediaFilter === 'video' && item.type === 'video') ||
        (mediaFilter === 'untagged' && (!item.tags || item.tags.length === 0));
      
      const tagMatch = !tagFilter || 
        item.tags?.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()));
      
      return typeMatch && tagMatch;
    });
  };

  const handleFileSelect = async (event, roomId) => {
    const files = Array.from(event.target.files);
    setValidationError('');
    
    if (files.length > 20) {
      setValidationError('You can upload maximum 20 files at once');
      if (fileInputRefs.current[roomId]) {
        fileInputRefs.current[roomId].value = '';
      }
      return;
    }

    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('media', file);
    });

    try {
      await dispatch(uploadRoomMedia({ propertyId, roomId, formData })).unwrap();
      
      if (fileInputRefs.current[roomId]) {
        fileInputRefs.current[roomId].value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDeleteMedia = async (roomId, mediaId) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      try {
        await dispatch(deleteRoomMediaItem({ propertyId, roomId, mediaId })).unwrap();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleEditMedia = (mediaItem, roomId) => {
    setEditingMedia({
      ...mediaItem,
      roomId,
      tags: mediaItem.tags || []
    });
    setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;

    if (!editingMedia.tags || editingMedia.tags.length === 0) {
      alert('Please select at least one tag before saving.');
      return;
    }

    try {
      await dispatch(updateRoomMediaItem({
        propertyId,
        roomId: editingMedia.roomId,
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

  const handleSetCover = async (mediaItem, roomId) => {
    if (mediaItem.type !== 'image') return;

    try {
      await dispatch(updateRoomMediaItem({
        propertyId,
        roomId,
        mediaId: mediaItem._id,
        data: { isCover: !mediaItem.isCover }
      })).unwrap();
    } catch (error) {
      console.error('Set cover failed:', error);
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

  const hasNoTags = (mediaItem) => {
    return !mediaItem.tags || mediaItem.tags.length === 0;
  };

  const handleCompleteStep = async () => {
    // Check if all room media items have tags
    const roomsWithUntaggedMedia = rooms.filter(room => getRoomItemsWithoutTags(room).length > 0);
    
    if (roomsWithUntaggedMedia.length > 0) {
      const totalUntagged = roomsWithUntaggedMedia.reduce((acc, room) => 
        acc + getRoomItemsWithoutTags(room).length, 0
      );
      setValidationError(`${totalUntagged} media item(s) across ${roomsWithUntaggedMedia.length} room(s) are missing tags. Please add tags to all media items before proceeding.`);
      return;
    }

    onSave();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Room Photos and Videos
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Upload photos and videos for each room to showcase their unique features.
        Each media item must have at least one tag to help guests understand what they're viewing.
      </Typography>

      {/* Show validation error */}
      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}

      {/* Show API error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant={mediaFilter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setMediaFilter('all')}
        >
          All Media
        </Button>
        <Button
          variant={mediaFilter === 'image' ? 'contained' : 'outlined'}
          onClick={() => setMediaFilter('image')}
        >
          Images
        </Button>
        <Button
          variant={mediaFilter === 'video' ? 'contained' : 'outlined'}
          onClick={() => setMediaFilter('video')}
        >
          Videos
        </Button>
        <Button
          variant={mediaFilter === 'untagged' ? 'contained' : 'outlined'}
          onClick={() => setMediaFilter('untagged')}
          color="error"
        >
          Untagged
        </Button>
        
        <TextField
          size="small"
          placeholder="Filter by tags..."
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          sx={{ ml: 'auto', width: 200 }}
        />
      </Box>

      {/* Rooms Accordion */}
      {rooms.map((room) => {
        const roomMedia = getFilteredRoomMedia(room);
        const untaggedItems = getRoomItemsWithoutTags(room);
        const totalRoomMedia = getRoomMediaItems(room);
        
        return (
          <Accordion 
            key={room._id} 
            expanded={expandedRoom === room._id}
            onChange={(event, isExpanded) => setExpandedRoom(isExpanded ? room._id : null)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6">{room.roomName}</Typography>
                <Chip 
                  label={`${totalRoomMedia.length} media`} 
                  size="small" 
                  color="primary"
                />
                {untaggedItems.length > 0 && (
                  <Badge badgeContent={untaggedItems.length} color="error">
                    <Chip 
                      label="Untagged" 
                      size="small" 
                      color="error"
                      icon={<Warning />}
                    />
                  </Badge>
                )}
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              {/* Upload Section for this room */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upload Media for {room.roomName}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <input
                      ref={el => fileInputRefs.current[room._id] = el}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleFileSelect(e, room._id)}
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      onClick={() => fileInputRefs.current[room._id]?.click()}
                      disabled={isLoading}
                      sx={{ mr: 2 }}
                    >
                      {isLoading ? 'Uploading...' : 'Select & Upload Files'}
                    </Button>
                    
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                      Select up to 20 files. Files will be uploaded immediately after selection.
                    </Typography>
                  </Box>

                  {isLoading && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Uploading files...
                      </Typography>
                      <LinearProgress />
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Media Grid for this room */}
              <Grid container spacing={2}>
                {roomMedia.map((mediaItem) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={mediaItem._id}>
                    <Card sx={{ 
                      aspectRatio: '1/1',
                      border: hasNoTags(mediaItem) ? '2px solid #f44336' : 'none'
                    }}>
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
                        
                        {hasNoTags(mediaItem) && (
                          <Chip
                            label="No Tags"
                            color="error"
                            size="small"
                            icon={<Warning />}
                            sx={{ position: 'absolute', bottom: 4, left: 4 }}
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
                              onClick={() => handleSetCover(mediaItem, room._id)}
                              sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                            >
                              {mediaItem.isCover ? <Star color="primary" /> : <StarBorder />}
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => handleEditMedia(mediaItem, room._id)}
                            sx={{ 
                              bgcolor: hasNoTags(mediaItem) ? 'rgba(244,67,54,0.8)' : 'rgba(255,255,255,0.8)'
                            }}
                          >
                            <Edit color={hasNoTags(mediaItem) ? 'error' : 'inherit'} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteMedia(room._id, mediaItem._id)}
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
                          {mediaItem.tags && mediaItem.tags.length > 0 ? (
                            <>
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
                            </>
                          ) : (
                            <Typography variant="caption" color="error">
                              No tags assigned
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {roomMedia.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No media uploaded for this room yet. Upload some photos and videos to showcase this room.
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Room Media Item
          {editingMedia && (!editingMedia.tags || editingMedia.tags.length === 0) && (
            <Chip label="Tags Required" color="error" size="small" sx={{ ml: 2 }} />
          )}
        </DialogTitle>
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
                  label="Set as room cover image"
                />
              )}
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Selected Tags *
              </Typography>
              
              <Box sx={{ 
                mb: 2, 
                minHeight: 40, 
                border: `1px solid ${(!editingMedia.tags || editingMedia.tags.length === 0) ? '#f44336' : '#e0e0e0'}`, 
                borderRadius: 1, 
                p: 1,
                bgcolor: (!editingMedia.tags || editingMedia.tags.length === 0) ? '#ffebee' : '#f9f9f9'
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
                  <Typography variant="body2" color="error">
                    Please select at least one tag
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
                  {availableRoomTags.map((tag) => (
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
          disabled={isLoading}
        >
          Save & Continue
        </Button>
      </Box>
    </Box>
  );
};

export default RoomMediaForm;