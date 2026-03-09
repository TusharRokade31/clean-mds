'use client'
import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, Grid, Card, CardMedia, CardContent,
  IconButton, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Checkbox, Alert, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, Badge, Accordion,
  AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  CloudUpload, Delete, Edit, Star,
  Close, Warning, ExpandMore,
  ArrowBack, ArrowForward, Search
} from '@mui/icons-material';
import {
  uploadRoomMedia, updateRoomMediaItem, deleteRoomMediaItem,
} from '@/redux/features/property/propertySlice';
import toast from 'react-hot-toast';
import { useConfirm } from '@/hooks/useConfirm';

const RoomMediaForm = ({ propertyId, onSave, onBack }) => {
  const dispatch = useDispatch();
  const { currentProperty, isLoading, error } = useSelector(state => state.property);
  const { confirm, ConfirmDialog } = useConfirm();

  const [editingMedia, setEditingMedia] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [tagGroupDialog, setTagGroupDialog] = useState(false);
  const [selectedTagGroup, setSelectedTagGroup] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [customTag, setCustomTag] = useState('');
  const [validationError, setValidationError] = useState('');
  const [expandedRoom, setExpandedRoom] = useState(null);

  const fileInputRefs = useRef({});

  // ── Directly from Redux, no props needed ──────────────────────────────────
  const rooms = currentProperty?.rooms || [];

  const availableRoomTags = [
    'Bed', 'Bathroom/Washroom', 'Room View', 'Balcony', 'Furniture',
    'Amenities', 'Decor', 'Lighting', 'Storage', 'Window View', 'Others'
  ];

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getRoomMediaItems = (room) => {
    if (!room?.media) return [];
    return [...(room.media.images || []), ...(room.media.videos || [])];
  };

  const getRoomMediaByTag = (room) => {
    const grouped = {};
    getRoomMediaItems(room).forEach(item => {
      (item.tags || []).forEach(tag => {
        if (!grouped[tag]) grouped[tag] = [];
        grouped[tag].push(item);
      });
    });
    return grouped;
  };

  const getRoomItemsWithoutTags = (room) =>
    getRoomMediaItems(room).filter(item => !item.tags || item.tags.length === 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
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
      await dispatch(uploadRoomMedia({ propertyId, roomId, formData })).unwrap();
      if (fileInputRefs.current[roomId]) fileInputRefs.current[roomId].value = '';
    } catch (err) {
      console.error('Upload failed:', err);
      setValidationError(err.message || 'Upload failed. Please try again.');
    }
  };

  const handleDeleteMedia = async (roomId, mediaId) => {
    const ok = await confirm({
      title: 'Delete Media?',
      description: 'This media item will be permanently removed.',
      confirmText: 'Delete',
      confirmColor: 'error',
    });
    if (!ok) return;

    try {
      await dispatch(deleteRoomMediaItem({ propertyId, roomId, mediaId })).unwrap();
      setTagGroupDialog(false);
      setEditDialog(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleEditMedia = (mediaItem, roomId) => {
    setEditingMedia({ ...mediaItem, roomId, tags: mediaItem.tags || [] });
    setEditDialog(true);
  };

  const handleTagGroupClick = (tag, mediaItems, roomId) => {
    setSelectedTagGroup({ tag, mediaItems, roomId });
    setSelectedImageIndex(0);
    setTagGroupDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia?.tags?.length) {
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
          displayOrder: editingMedia.displayOrder,
        }
      })).unwrap();
      setEditDialog(false);
      setEditingMedia(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleSetCover = async (mediaItem, roomId) => {
    if (mediaItem.type !== 'image') return;
    try {
      await dispatch(updateRoomMediaItem({
        propertyId, roomId,
        mediaId: mediaItem._id,
        data: { isCover: !mediaItem.isCover }
      })).unwrap();
    } catch (err) {
      console.error('Set cover failed:', err);
    }
  };

  const handleTagToggle = (tag) => {
    if (!editingMedia) return;
    setEditingMedia(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const removeTag = (tag) =>
    setEditingMedia(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const addCustomTag = () => {
    if (customTag.trim() && !editingMedia.tags.includes(customTag.trim())) {
      setEditingMedia(prev => ({ ...prev, tags: [...prev.tags, customTag.trim()] }));
      setCustomTag('');
    }
  };

  const nextImage = () => {
    if (selectedTagGroup && selectedImageIndex < selectedTagGroup.mediaItems.length - 1)
      setSelectedImageIndex(i => i + 1);
  };

  const previousImage = () => {
    if (selectedTagGroup && selectedImageIndex > 0)
      setSelectedImageIndex(i => i - 1);
  };

  const handleCompleteStep = () => {
    const roomsWithUntagged = rooms.filter(r => getRoomItemsWithoutTags(r).length > 0);
    if (roomsWithUntagged.length > 0) {
      const total = roomsWithUntagged.reduce((acc, r) => acc + getRoomItemsWithoutTags(r).length, 0);
      setValidationError(
        `${total} media item(s) across ${roomsWithUntagged.length} room(s) are missing tags.`
      );
      return;
    }
    onSave?.();
  };

  // ── Tag Group Card ─────────────────────────────────────────────────────────
  const TagGroupCard = ({ tag, mediaItems, roomId }) => {
    const first = mediaItems[0];
    const imageCount = mediaItems.filter(i => i.type === 'image').length;
    const videoCount = mediaItems.filter(i => i.type === 'video').length;

    return (
      <Card
        sx={{
          width: 280, height: 200, position: 'relative', cursor: 'pointer',
          border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden',
          '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s', boxShadow: 3 }
        }}
        onClick={() => handleTagGroupClick(tag, mediaItems, roomId)}
      >
        {first.type === 'image' ? (
          <CardMedia component="img" image={first.url} alt={first.filename}
            sx={{ width: '100%', height: '70%', objectFit: 'cover' }} />
        ) : (
          <video src={first.url} style={{ width: '100%', height: '70%', objectFit: 'cover' }}
            muted loop autoPlay preload="metadata" />
        )}
        <CardContent sx={{ height: '30%', p: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{tag}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {imageCount > 0 && <Chip label={`${imageCount} Images`} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem' }} />}
            {videoCount > 0 && <Chip label={`${videoCount} Videos`} size="small" color="secondary" variant="outlined" sx={{ fontSize: '0.7rem' }} />}
          </Box>
        </CardContent>
        <Badge badgeContent={mediaItems.length} color="primary"
          sx={{ position: 'absolute', top: 8, right: 8 }} />
      </Card>
    );
  };

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <Box>
      <ConfirmDialog />

      <Typography variant="h5" gutterBottom>Upload Room Photos and Videos</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Upload photos and videos for each room. Each media item must have at least one tag.
      </Typography>

      {validationError && <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Rooms Accordion ─────────────────────────────────────────────── */}
      {rooms.length === 0 && (
        <Alert severity="info">No rooms found. Please add rooms first.</Alert>
      )}

      {rooms.map((room) => {
        const groupedMedia = getRoomMediaByTag(room);
        const untaggedItems = getRoomItemsWithoutTags(room);
        const totalMedia = getRoomMediaItems(room);

        return (
          <Accordion
            key={room._id}
            expanded={expandedRoom === room._id}
            onChange={(_, isExpanded) => setExpandedRoom(isExpanded ? room._id : null)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6">{room.roomName}</Typography>
                <Chip label={`${totalMedia.length} media`} size="small" color="primary" />
                {untaggedItems.length > 0 && (
                  <Badge badgeContent={untaggedItems.length} color="error">
                    <Chip label="Untagged" size="small" color="error" icon={<Warning />} />
                  </Badge>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              {/* Upload Button */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <input
                  ref={el => fileInputRefs.current[room._id] = el}
                  type="file" multiple accept="image/*,video/*"
                  onChange={(e) => handleFileSelect(e, room._id)}
                  style={{ display: 'none' }}
                />
                <Button variant="contained" startIcon={<CloudUpload />}
                  onClick={() => fileInputRefs.current[room._id]?.click()}
                  disabled={isLoading}>
                  {isLoading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </Box>

              {isLoading && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Uploading files...</Typography>
                  <LinearProgress />
                </Box>
              )}

              {/* Tagged Groups */}
              {Object.keys(groupedMedia).length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>Media by Tags</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(groupedMedia).map(([tag, items]) => (
                      <Grid item key={tag}>
                        <TagGroupCard tag={tag} mediaItems={items} roomId={room._id} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Untagged */}
              {untaggedItems.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom color="error">
                    Untagged Media ({untaggedItems.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {untaggedItems.map((item) => (
                      <Grid item key={item._id}>
                        <Card
                          sx={{
                            width: 200, height: 150, position: 'relative', cursor: 'pointer',
                            border: '2px solid #f44336', borderRadius: 2, overflow: 'hidden',
                            '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s', boxShadow: 3 }
                          }}
                          onClick={() => handleEditMedia(item, room._id)}
                        >
                          {item.type === 'image' ? (
                            <CardMedia component="img" image={item.url} alt={item.filename}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <video src={item.url}
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
                <Alert severity="info">No media uploaded yet for this room.</Alert>
              )}
              {untaggedItems.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {untaggedItems.length} item(s) need tags. Click red-bordered items to add tags.
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Save & Continue */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>Previous</Button>
        <Button variant="contained" onClick={handleCompleteStep}>Save & Continue</Button>
      </Box>

      {/* ── Tag Group Dialog ─────────────────────────────────────────────── */}
      <Dialog open={tagGroupDialog} onClose={() => setTagGroupDialog(false)}
        maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedTagGroup?.tag} ({selectedTagGroup?.mediaItems.length} items)
          </Typography>
          <IconButton onClick={() => setTagGroupDialog(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedTagGroup && (
            <Box sx={{ position: 'relative' }}>
              {selectedTagGroup.mediaItems[selectedImageIndex]?.type === 'image' ? (
                <img src={selectedTagGroup.mediaItems[selectedImageIndex].url}
                  style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: 8 }} />
              ) : (
                <video src={selectedTagGroup.mediaItems[selectedImageIndex].url}
                  style={{ width: '100%', height: '500px', borderRadius: 8 }} controls />
              )}

              {selectedImageIndex > 0 && (
                <IconButton onClick={previousImage}
                  sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  <ArrowBack />
                </IconButton>
              )}
              {selectedImageIndex < selectedTagGroup.mediaItems.length - 1 && (
                <IconButton onClick={nextImage}
                  sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  <ArrowForward />
                </IconButton>
              )}
              <Chip
                label={`${selectedImageIndex + 1} / ${selectedTagGroup.mediaItems.length}`}
                sx={{ position: 'absolute', bottom: 16, right: 16,
                  bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedTagGroup?.mediaItems[selectedImageIndex]?.type === 'image' && (
            <Button startIcon={<Star />}
              onClick={() => handleSetCover(
                selectedTagGroup.mediaItems[selectedImageIndex],
                selectedTagGroup.roomId
              )}
              disabled={selectedTagGroup.mediaItems[selectedImageIndex]?.isCover}>
              {selectedTagGroup?.mediaItems[selectedImageIndex]?.isCover ? 'Cover Photo' : 'Set as Cover'}
            </Button>
          )}
          <Button startIcon={<Edit />}
            onClick={() => handleEditMedia(
              selectedTagGroup.mediaItems[selectedImageIndex],
              selectedTagGroup.roomId
            )}>
            Edit Tags
          </Button>
          <Button startIcon={<Delete />} color="error"
            onClick={() => handleDeleteMedia(
              selectedTagGroup.roomId,
              selectedTagGroup.mediaItems[selectedImageIndex]._id
            )}>
            Delete
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={() => setTagGroupDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Tags Dialog ─────────────────────────────────────────────── */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingMedia?.tags?.length > 0 ? editingMedia.tags[0] : 'Add Tags'}
        </DialogTitle>
        <DialogContent>
          {editingMedia && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {editingMedia.type === 'image' ? (
                  <img src={editingMedia.url} alt={editingMedia.filename}
                    style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <video src={editingMedia.url}
                    style={{ width: '100%', height: '400px', borderRadius: 8 }} controls />
                )}
                {editingMedia.type === 'image' && (
                  <FormControlLabel
                    control={
                      <Checkbox checked={editingMedia.isCover || false}
                        onChange={(e) => setEditingMedia(prev => ({ ...prev, isCover: e.target.checked }))} />
                    }
                    label="Set as cover photo" sx={{ mt: 2 }} />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Tags Added</Typography>
                <Box sx={{
                  mb: 2, minHeight: 60, borderRadius: 1, p: 2, bgcolor: '#f9f9f9',
                  border: `1px solid ${editingMedia.tags.length === 0 ? '#f44336' : '#e0e0e0'}`,
                  display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center'
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

                <TextField fullWidth size="small" placeholder="Add custom tag"
                  value={customTag} onChange={(e) => setCustomTag(e.target.value)}
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
            disabled={!editingMedia?.tags?.length}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomMediaForm;