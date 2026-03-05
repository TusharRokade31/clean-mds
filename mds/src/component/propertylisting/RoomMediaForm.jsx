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
  Image as ImageIcon, VideoFile, Close, Warning, ExpandMore,
  ArrowBack, ArrowForward, Search
} from '@mui/icons-material';
import {
  uploadRoomMedia, updateRoomMediaItem, deleteRoomMediaItem,
  getRoomMedia
} from '@/redux/features/property/propertySlice';
import toast from 'react-hot-toast';
import { useConfirm } from '@/hooks/useConfirm';

const RoomMediaForm = ({ 
  propertyId, 
  onSave, 
  onBack,
  // Single-room mode props (used by RoomsForm)
  singleRoom = null,           // pass currentRoomData directly
  singleRoomId = null,         // pass currentRoomId directly
  onMediaUploaded = null,      // callback after upload: (updatedRoom) => void
  isFileSubmitting = false,    // external loading state
  hideCompleteButton = false,  // hide the final Save & Continue button
}) => {
  const dispatch = useDispatch();
  const { currentProperty, isLoading, error } = useSelector(state => state.property);
  const { confirm, ConfirmDialog } = useConfirm();


  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingMedia, setEditingMedia] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [tagGroupDialog, setTagGroupDialog] = useState(false);
  const [selectedTagGroup, setSelectedTagGroup] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [customTag, setCustomTag] = useState('');
  const [validationError, setValidationError] = useState('');
  const [expandedRoom, setExpandedRoom] = useState(null);
  
  const fileInputRefs = useRef({});

    const isSingleRoomMode = !!singleRoom;
  const rooms = isSingleRoomMode ? [] : (currentProperty?.rooms || []);

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

  // Group media by tags for a specific room
  const getRoomMediaByTag = (room) => {
    const allMedia = getRoomMediaItems(room);
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
  

  // Check which media items are missing tags for a room
  const getRoomItemsWithoutTags = (room) => {
    const allMedia = getRoomMediaItems(room);
    return allMedia.filter(item => !item.tags || item.tags.length === 0);
  };

  const handleFileSelect = async (event, roomId) => {
    const files = Array.from(event.target.files);
    setValidationError('');
    
    if (files.length > 20) {
      setValidationError('You can upload maximum 20 files at once');
      if (fileInputRefs.current[roomId]) fileInputRefs.current[roomId].value = '';
      return;
    }
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append('media', file));

    try {
      const result = await dispatch(uploadRoomMedia({ 
        propertyId, 
        roomId: isSingleRoomMode ? singleRoomId : roomId, 
        formData 
      })).unwrap();
      
      // In single-room mode, notify parent with updated room data
      if (isSingleRoomMode && onMediaUploaded) {
        onMediaUploaded(result.room);
      }
      
      if (fileInputRefs.current[roomId]) fileInputRefs.current[roomId].value = '';
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

 const handleDeleteMedia = async (roomId, mediaId) => {
    const ok = await confirm({
    title: 'Delete Media?',
    description: 'This media item will be permanently removedddd.',
    confirmText: 'Delete',
    confirmColor: 'error',
  });
  if (!ok) return;
    try {
      const result = await dispatch(deleteRoomMediaItem({ 
        propertyId, 
        roomId: isSingleRoomMode ? singleRoomId : roomId, 
        mediaId 
      })).unwrap();
      
      if (isSingleRoomMode && onMediaUploaded) onMediaUploaded(result.room);
      setTagGroupDialog(false);
      setEditDialog(false);
    } catch (error) {
      console.error('Delete failed:', error);
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

  const handleTagGroupClick = (tag, mediaItems, roomId) => {
    setSelectedTagGroup({ tag, mediaItems, roomId });
    setSelectedImageIndex(0);
    setTagGroupDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;

    if (!editingMedia.tags || editingMedia.tags.length === 0) {
      toast.error('Please select at least one tag before saving.');
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

// Tag Group Card Component - Replace existing TagGroupCard in RoomMediaForm
const TagGroupCard = ({ tag, mediaItems, roomId }) => {
  const firstImage = mediaItems[0];
  const imageCount = mediaItems.filter(item => item.type === 'image').length;
  const videoCount = mediaItems.filter(item => item.type === 'video').length;

  return (
    <Card
      sx={{
        width: 260,
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'visible',       // For the stacked effect
        background: 'transparent',
        boxShadow: 'none',
        '&:hover': {
          transform: 'translateY(-4px)',
          '& .image-container': { boxShadow: 6 }
        }
      }}
      onClick={() => handleTagGroupClick(tag, mediaItems, roomId)}
    >
      {/* Decorative Stacked Layer */}
      <Box sx={{
        position: 'absolute', top: -6, left: 10, right: 10, height: '10px',
        bgcolor: '#e0e0e0', borderRadius: '8px 8px 0 0', zIndex: 0
      }} />

      <Box
        className="image-container"
        sx={{
          height: 180,
          width: '100%',
          bgcolor: '#f5f5f5',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          border: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {firstImage.type === 'image' ? (
          <CardMedia
            component="img"
            image={firstImage.url}
            alt={firstImage.filename}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'   // Prevents cutting
            }}
          />
        ) : (
          <video
            src={firstImage.url}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            muted
          />
        )}

        <Badge
          badgeContent={mediaItems.length}
          color="primary"
          sx={{ position: 'absolute', top: 12, right: 12 }}
        />
      </Box>

      <Box sx={{ p: 1.5, textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', mb: 0.5 }}>
          {tag}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {imageCount} {imageCount === 1 ? 'Photo' : 'Photos'}
          {videoCount > 0 && ` • ${videoCount} Videos`}
        </Typography>
      </Box>
    </Card>
  );
};

  const renderDialogs = () => (
    <>
      {/* Tag Group Dialog */}
      <Dialog open={tagGroupDialog} onClose={() => setTagGroupDialog(false)} 
        maxWidth="lg" fullWidth
        PaperProps={{ sx: { borderRadius: 4, bgcolor: '#fafafa' } }}>
        <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
             <ConfirmDialog />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedTagGroup?.tag}</Typography>
            <Typography variant="body2" color="text.secondary">
              Viewing {selectedImageIndex + 1} of {selectedTagGroup?.mediaItems.length}
            </Typography>
          </Box>
          <IconButton onClick={() => setTagGroupDialog(false)} sx={{ bgcolor: '#eee' }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedTagGroup && (
            <Box sx={{ position: 'relative', height: '70vh', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {selectedTagGroup.mediaItems[selectedImageIndex]?.type === 'image' ? (
                <img src={selectedTagGroup.mediaItems[selectedImageIndex].url}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <video src={selectedTagGroup.mediaItems[selectedImageIndex].url}
                  style={{ maxWidth: '100%', maxHeight: '100%' }} controls />
              )}
              <IconButton onClick={previousImage} disabled={selectedImageIndex === 0}
                sx={{ position: 'absolute', left: 20, color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <ArrowBack />
              </IconButton>
              <IconButton onClick={nextImage} 
                disabled={selectedImageIndex === selectedTagGroup.mediaItems.length - 1}
                sx={{ position: 'absolute', right: 20, color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <ArrowForward />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'white' }}>
          <Button startIcon={<Edit />}
            onClick={() => handleEditMedia(
              selectedTagGroup.mediaItems[selectedImageIndex], 
              selectedTagGroup.roomId
            )}>Edit Media</Button>
          <Button startIcon={<Delete />} color="error"
            onClick={() => handleDeleteMedia(
              selectedTagGroup.roomId,
              selectedTagGroup.mediaItems[selectedImageIndex]._id
            )}>Delete</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={() => setTagGroupDialog(false)}>Close Gallery</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {editingMedia?.tags?.length > 0 ? editingMedia.tags[0] : 'Untitled'} (1)
        </DialogTitle>
        <DialogContent>
          {editingMedia && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative' }}>
                  {editingMedia.type === 'image' ? (
                    <img src={editingMedia.url} alt={editingMedia.filename}
                      style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <video src={editingMedia.url}
                      style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px' }} controls />
                  )}
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
                    onClick={() => handleDeleteMedia(
                      isSingleRoomMode ? singleRoomId : editingMedia.roomId, 
                      editingMedia._id
                    )}>
                    <Delete />
                  </IconButton>
                {/* {editingMedia.tags.length !== 0 && <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}
                    onClick={() => handleDeleteMedia(
                      isSingleRoomMode ? singleRoomId : editingMedia.roomId, 
                      editingMedia._id
                    )}>
                    <Delete />
                  </IconButton>}   */}
                </Box>
                {editingMedia.type === 'image' && (
                  <FormControlLabel
                    control={<Checkbox checked={editingMedia.isCover || false}
                      onChange={(e) => setEditingMedia(prev => ({ ...prev, isCover: e.target.checked }))} />}
                    label="Set as cover photo" sx={{ mt: 2 }} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <ConfirmDialog />
                <Typography variant="h6" gutterBottom>Tags Added</Typography>
                <Box sx={{
                  mb: 2, minHeight: 60, borderRadius: 1, p: 2, bgcolor: '#f9f9f9',
                  border: `1px solid ${(!editingMedia.tags || editingMedia.tags.length === 0) ? '#f44336' : '#e0e0e0'}`,
                  display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1
                }}>
                  {editingMedia.tags.length > 0 ? (
                    editingMedia.tags.map(tag => (
                      <Chip key={tag} label={tag} onDelete={() => removeTag(tag)}
                        deleteIcon={<Close />} color="primary" variant="outlined" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No tags selected</Typography>
                  )}
                </Box>
                <TextField fullWidth size="small" placeholder="Add Tags" value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') addCustomTag(); }}
                  sx={{ mb: 2 }}
                  InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <List dense>
                    {availableRoomTags.map(tag => (
                      <ListItem key={tag} dense button onClick={() => handleTagToggle(tag)}>
                        <ListItemIcon>
                          <Checkbox edge="start" checked={editingMedia.tags.includes(tag)} size="small" />
                        </ListItemIcon>
                        <ListItemText primary={tag} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained"
            disabled={!editingMedia?.tags || editingMedia.tags.length === 0}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );

// ─── Single-room mode (used inside RoomsForm) ───────────────────────────────
  if (isSingleRoomMode) {
    const groupedMedia = getRoomMediaByTag(singleRoom);
    const untaggedItems = getRoomItemsWithoutTags(singleRoom);
    const totalMedia = getRoomMediaItems(singleRoom);
    const roomId = singleRoomId; // alias for clarity

    return (
      <Box>
        <div id="media-upload-anchor" style={{ marginTop: '-100px', paddingTop: '100px' }}>
          <Typography variant="h5" gutterBottom>
            Upload Media for {singleRoom.roomName}
          </Typography>
        </div>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Upload photos and videos for this room. Each media item must have at least one tag.
        </Typography>

        {validationError && <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Upload Button */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <input
            ref={el => fileInputRefs.current[roomId] = el}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleFileSelect(e, roomId)}
            style={{ display: 'none' }}
          />
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRefs.current[roomId]?.click()}
            disabled={!roomId || isLoading || isFileSubmitting}
          >
            {isFileSubmitting ? 'Uploading...' : !roomId ? 'Save Room First' : 'Upload Files'}
          </Button>
        </Box>

        {(isLoading || isFileSubmitting) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Uploading files...</Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Tagged Media Groups */}
        {Object.keys(groupedMedia).length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Media by Tags</Typography>
            <Grid container spacing={2}>
              {Object.entries(groupedMedia).map(([tag, mediaItems]) => (
                <Grid item key={tag}>
                  <TagGroupCard tag={tag} mediaItems={mediaItems} roomId={roomId} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Untagged Media */}
        {untaggedItems.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="error">
              Untagged Media ({untaggedItems.length})
            </Typography>
            <Grid container spacing={2}>
              {untaggedItems.map((mediaItem) => (
                <Grid item key={mediaItem._id}>
                  <Card
                    sx={{
                      width: 200, height: 150, position: 'relative', cursor: 'pointer',
                      border: '2px solid #f44336', borderRadius: 2, overflow: 'hidden',
                      '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s', boxShadow: 3 }
                    }}
                    onClick={() => handleEditMedia(mediaItem, roomId)}
                  >
                    {mediaItem.type === 'image' ? (
                      <CardMedia component="img" image={mediaItem.url} alt={mediaItem.filename}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={mediaItem.url}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        muted loop autoPlay preload="metadata" />
                    )}
                    <Chip label="Needs Tags" color="error" size="small"
                      sx={{ position: 'absolute', top: 8, left: 8, fontSize: '0.7rem', height: 20 }} />
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {totalMedia.length === 0 && (
          <Alert severity="info">No media uploaded yet. Upload photos and videos to showcase this room.</Alert>
        )}
        {untaggedItems.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {untaggedItems.length} item(s) need tags. Click red-bordered items to add tags.
          </Alert>
        )}

        {/* Dialogs are shared — they live below in the normal return, 
            but we need them here too so extract them as a fragment */}
        {renderDialogs()}
      </Box>
    );
  }
  // ─── End single-room mode ────────────────────────────────────────────────────

  return (
    <Box>
      
      <Typography variant="h5" gutterBottom>
        Upload Room Photos and Videos
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
      

      {/* Rooms Accordion */}
      {rooms.map((room) => {
        const groupedMedia = getRoomMediaByTag(room);
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
              {/* Upload Section */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div></div>
                <Box>
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
                  >
                    {isLoading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                </Box>
              </Box>

              {isLoading && (
                <Box sx={{ mb: 3 }}>
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
                        <TagGroupCard tag={tag} mediaItems={mediaItems} roomId={room._id} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Untagged Media */}
              {untaggedItems.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom color="error">
                    Untagged Media ({untaggedItems.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {untaggedItems.map((mediaItem) => (
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
                          onClick={() => handleEditMedia(mediaItem, room._id)}
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

              {/* Status Alert for this room */}
              {totalRoomMedia.length === 0 && (
                <Alert severity="info">
                  No media uploaded for this room yet. Upload some photos and videos to showcase this room.
                </Alert>
              )}

              {untaggedItems.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {untaggedItems.length} media item(s) in this room need tags.
                  Click on items with red borders to add tags.
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      

      {/* Tag Group Dialog */}
     <Dialog
  open={tagGroupDialog}
  onClose={() => setTagGroupDialog(false)}
  maxWidth="lg"
  fullWidth
  PaperProps={{ sx: { borderRadius: 4, bgcolor: '#fafafa' } }}
>
  <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <ConfirmDialog />
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedTagGroup?.tag}</Typography>
      <Typography variant="body2" color="text.secondary">
        Viewing {selectedImageIndex + 1} of {selectedTagGroup?.mediaItems.length}
      </Typography>
    </Box>
    <IconButton onClick={() => setTagGroupDialog(false)} sx={{ bgcolor: '#eee' }}>
      <Close />
    </IconButton>
  </DialogTitle>

  <DialogContent sx={{ p: 0 }}>
    {selectedTagGroup && (
      <Box sx={{
        position: 'relative',
        height: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {selectedTagGroup.mediaItems[selectedImageIndex]?.type === 'image' ? (
          <img
            src={selectedTagGroup.mediaItems[selectedImageIndex].url}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'   // No cutting
            }}
          />
        ) : (
          <video
            src={selectedTagGroup.mediaItems[selectedImageIndex].url}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            controls
          />
        )}

        {/* Navigation */}
        <IconButton
          onClick={previousImage}
          disabled={selectedImageIndex === 0}
          sx={{
            position: 'absolute', left: 20,
            color: 'white', bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
          }}
        >
          <ArrowBack />
        </IconButton>

        <IconButton
          onClick={nextImage}
          disabled={selectedImageIndex === selectedTagGroup.mediaItems.length - 1}
          sx={{
            position: 'absolute', right: 20,
            color: 'white', bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
          }}
        >
          <ArrowForward />
        </IconButton>
      </Box>
    )}
  </DialogContent>

  <DialogActions sx={{ p: 2, bgcolor: 'white' }}>
    <Button
      startIcon={<Edit />}
      onClick={() => handleEditMedia(
        selectedTagGroup.mediaItems[selectedImageIndex],
        selectedTagGroup.roomId
      )}
    >
      Edit Media
    </Button>
    <Button
      startIcon={<Delete />}
      color="error"
      onClick={() => handleDeleteMedia(
        selectedTagGroup.roomId,
        selectedTagGroup.mediaItems[selectedImageIndex]._id
      )}
    >
      Delete
    </Button>
    <Box sx={{ flexGrow: 1 }} />
    <Button onClick={() => setTagGroupDialog(false)}>Close Gallery</Button>
  </DialogActions>
</Dialog>

      {/* Edit Dialog */}
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
                <ConfirmDialog />
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
                    {availableRoomTags.map((tag) => (
                      <ListItem key={tag} dense button onClick={() => handleTagToggle(tag)}>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={editingMedia.tags.includes(tag)}
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
  
    </Box>
  );
};

export default RoomMediaForm;