'use client'
import { useState, useEffect, useRef } from 'react';
import {
  Button, Typography, Divider, TextField, FormControl,
  InputLabel, Select, MenuItem, FormHelperText, Grid,
  Paper, IconButton, Chip, Box, Checkbox, FormControlLabel,
  Card, CardContent, Tabs, Tab, RadioGroup, Radio, FormLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  LinearProgress, Badge, Accordion, AccordionSummary, AccordionDetails,
  CardMedia, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';

import {
  Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon,
  CloudUpload, Star, StarBorder, Image as ImageIcon, VideoFile,
  Close, Warning, ExpandMore, ArrowBack, ArrowForward, Search,
  ContentCopy,
  Delete
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import {
  addRooms, deleteRoom, updateRoom,
  uploadRoomMedia, updateRoomMediaItem, deleteRoomMediaItem,
  getProperty,
  completeRoomsStep
} from '@/redux/features/property/propertySlice';
import RoomsAmenities from './RoomsAmenities';


export default function RoomsForm({  rooms = [], propertyId, onAddRoom, errors, onComplete, onSave, onBack }) {
  
  const dispatch = useDispatch();
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [isCompleted, setIsComplete] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState(-1);
  const [currentRoomData, setCurrentRoomData] = useState(getInitialRoomData());
  const [localRooms, setLocalRooms] = useState(rooms);
  const [selectedAmenityTab, setSelectedAmenityTab] = useState(0);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [editingMedia, setEditingMedia] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const roomID = localStorage.getItem('roomID')
    if (roomID) {
      setCurrentRoomId(roomID)
    }
  }, [])

  // Refs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFileSubmiting, setIsFileSubmiting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // All available tags for room media
  const availableRoomTags = [
    'Bed', 'Bathroom/Washroom', 'Room View', 'Balcony', 'Furniture',
    'Amenities', 'Decor', 'Lighting', 'Storage', 'Window View', 'Others'
  ];


      // Your existing room amenity categories and other constants remain the same...
      const roomAmenityCategories = {
          mandatory: {
              title: 'Mandatory',
              items: [
                  {
                      name: 'Air Conditioning',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Wifi',
                      options: [],
                      Suboptions: []
                  },
  
                  {
                      name: 'TV',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Hairdryer',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Hot Water',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Toiletries',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Mineral Water',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Telephone',
                      options: [],
                      Suboptions: []
                  },
              ]
          },
          basicFacilities: {
              title: 'Basic Facilities',
              items: [
                  {
                      name: 'Refrigerator',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Kitchen',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Safe',
                      options: ['Digital', 'Key lock'],
                      Suboptions: []
                  },
                  {
                      name: 'Closet',
                      options: [],
                      Suboptions: []
                  }
              ]
          },
          bathroom: {
              title: 'Bathroom',
              items: [
                  {
                      name: 'Dental Kit',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Toiletries',
                      options: [],
                      Suboptions: ['Shampoo', 'Soap', 'Towels',]
                  },
                  {
                      name: 'Western Toilet Seat',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Jetspray',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Geyser/Water Heater',
                      options: ['24 Hours', 'Limited duration'],
                      Suboptions: []
                  }
              ]
          },
          roomFeatures: {
              title: 'Room Features',
              items: [
  
  
                  {
                      name: 'Wardrobe',
                      options: [],
                      Suboptions: ['Hangers', 'Safe inside']
                  },
                  {
                      name: 'Charging points',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Dining Table',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Sofa',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Seating Area',
                      options: [],
                      Suboptions: []
                  },
  
              ]
          },
          kitchenAppliances: {
              title: 'Kitchen and Appliances',
              items: [
                  {
                      name: 'Induction',
                      options: [],
                      Suboptions: []
                  },
  
                  {
                      name: 'Kitchenette',
                      options: ['Private', 'Shared'],
                      Suboptions: []
                  },
                  {
                      name: 'Refrigerator',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Cook/Chef',
                      options: ['Free', 'Paid'],
                      Suboptions: []
                  },
                  {
                      name: 'Dishes and Silverware',
                      options: [],
                      Suboptions: []
                  },
                  {
                      name: 'Microwave',
                      options: [],
                      Suboptions: []
                  },
  
  
              ]
          },
          otherFacilities: {
              title: 'Other Facilities',
              items: [
                  {
                      name: 'Mosquito Net',
                      options: [],
                      Suboptions: []
                  },
  
                  {
                      name: 'Newspaper',
                      options: [],
                      Suboptions: []
                  },
  
                  {
                      name: 'Fan',
                      options: [],
                      Suboptions: []
                  },
  
  
  
              ]
          }
      };


  const validateMandatoryAmenities = () => {
  const mandatoryItems = roomAmenityCategories.mandatory.items;
  const mandatoryData = currentRoomData?.amenities?.mandatory || {}; // Ensure the data is being passed correctly

  const unselectedMandatory = mandatoryItems.filter(amenity => {
    const key = amenity.name.replace(/[^a-zA-Z0-9]/g, ''); // Clean the name to match the key
    const amenityValue = mandatoryData[key];
    return !amenityValue || amenityValue.available === undefined || amenityValue.available === null;
  });

  return unselectedMandatory.length === 0; // True if all mandatory items are selected
};




  // Update local rooms when props change
  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  function getInitialRoomData() {
    return {
      numberRoom: '',
      roomName: '',
      roomSize: '',
      sizeUnit: 'sqft',
      description: '',
      beds: [{ bedType: '', count: 1, accommodates: 1 }],
      FloorBedding: {
        available: false,
        count: ''
      },
      alternativeBeds: [],
      occupancy: {
        baseAdults: 1,
        maximumAdults: 1,
        maximumChildren: 0,
        maximumOccupancy: 1
      },
      bathrooms: {
        count: 1,
        private: true,
        shared: false,
      },
      mealPlan: {
        available: false,
        planType: ''
      },
      pricing: {
        baseAdultsCharge: '',
        extraAdultsCharge: '',
        childCharge: ''
      },
      availability: [{
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        availableUnits: 1
      }],
      amenities: {
        mandatory: {},
        basicFacilities: {},
        generalServices: {},
        commonArea: {},
        foodBeverages: {},
        healthWellness: {},
        security: {},
        mediaTechnology: {}
      }
    };
  }

  // Media helper functions
  const getRoomMediaItems = (room) => {
    if (!room || !room.media) return [];
    const images = room.media.images || [];
    const videos = room.media.videos || [];
    return [...images, ...videos];
  };

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

  const getRoomItemsWithoutTags = (room) => {
    const allMedia = getRoomMediaItems(room);
    return allMedia.filter(item => !item.tags || item.tags.length === 0);
  };


  // Room creation/editing functions (keeping your original logic)
  const validateRoomData = () => {
    const errors = {};
    if (!currentRoomData.roomName) errors.roomName = 'Room name is required';
    if (!currentRoomData.roomSize || currentRoomData.roomSize <= 0) errors.roomSize = 'Valid room size is required';
    if (!currentRoomData.numberRoom || currentRoomData.numberRoom <= 0) errors.numberRoom = 'Valid number of rooms is required';

    // Add other validations as needed...

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRoom = async () => {
    if (!validateRoomData()) return;

    setIsSubmitting(true);
    console.log(propertyId)
    try {
      console.log(propertyId)
      const result = await dispatch(addRooms({
        id: propertyId,
        data: currentRoomData
      })).unwrap();

      console.log(result.room)
      setIsComplete(true);

      if (result.room) {
        const roomID = result.room._id
        // localStorage.setItem('roomID', roomID)
        // Room created successfully, now move to media upload step
        setCurrentRoomId(roomID);

        // Update local rooms
        const updatedRooms = [...localRooms, result.room];
        setLocalRooms(updatedRooms);
        onAddRoom(updatedRooms);

      }
      
    } catch (error) {
      console.error('Failed to add room:', error);
      setValidationError('Failed to create room. Please try again.');
    } finally {
      // setIsSubmitting(false);
    }
  };

  // Media upload functions
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

    setIsFileSubmiting(true)
    try {
      const result = await dispatch(uploadRoomMedia({
        propertyId,
        roomId: currentRoomId,
        formData
      })).unwrap();

      setCurrentRoomData(result.room)

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.log(error.message)
      console.error('Upload failed:', error);
      
      // Handle validation errors from the response
      if (error.invalidFiles && error.invalidFiles.length > 0) {
        // Create a user-friendly error message from invalidFiles
        const fileErrors = error.invalidFiles.map(file => 
          `${file.filename}: ${file.error}`
        ).join('\n');
        
        setValidationError(`Upload failed:\n${fileErrors}`);
      } else {
        // Fallback error message
        setValidationError(error.message || 'Failed to upload media. Please try again.');
      }
    } finally {
      setIsFileSubmiting(false)
    }
};
  const handleDeleteMedia = async (mediaId) => {
    if (!currentRoomId || !window.confirm('Are you sure you want to delete this media item?')) return;

    try {
      await dispatch(deleteRoomMediaItem({
        propertyId,
        roomId: currentRoomId,
        mediaId
      })).unwrap();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleEditMedia = (mediaItem) => {
    setEditingMedia({
      ...mediaItem,
      roomId: currentRoomId,
      tags: mediaItem.tags || []
    });
    setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia || !editingMedia.tags || editingMedia.tags.length === 0) {
      alert('Please select at least one tag before saving.');
      return;
    }

    try {
      const result = await dispatch(updateRoomMediaItem({
        propertyId,
        roomId: currentRoomId,
        mediaId: editingMedia._id,
        data: {
          tags: editingMedia.tags,
          isCover: editingMedia.isCover,
          displayOrder: editingMedia.displayOrder
        }
      })).unwrap();

      setCurrentRoomData(result.room)

      setEditDialog(false);
      setEditingMedia(null);
    } catch (error) {
      console.error('Update failed:', error);
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


  const handleUpdateRoom = async () => {
    if (!validateRoomData()) return;

    try {
      const roomToUpdate = localRooms[editingRoomIndex];
      const roomId = roomToUpdate._id || roomToUpdate.id;

      const result = await dispatch(updateRoom({
        id: propertyId,
        roomId: roomId,
        data: currentRoomData
      })).unwrap();
       setIsComplete(true);
      if (result.type.endsWith('/fulfilled')) {
        console.log("in the condition....")
        const updatedRooms = [...localRooms];
        updatedRooms[editingRoomIndex] = currentRoomData;
        setLocalRooms(updatedRooms);
        onAddRoom(updatedRooms);

        setIsEditingRoom(false);
        setEditingRoomIndex(-1);
        setCurrentRoomData(getInitialRoomData());
        setFormErrors({});
        
      }
    } catch (error) {
      console.error('Failed to update room:', error);
    }
  };

  const handleDeleteRoom = async (index) => {
    const roomToDelete = localRooms[index];
    const roomId = roomToDelete._id || roomToDelete.id;

    if (roomId && propertyId) {
      try {
        const result = await dispatch(deleteRoom({
          propertyId,
          roomId
        })).unwrap();

        setLocalRooms(result.property.rooms);
        console.log(localRooms, "handle Room delete clicked ")
        onAddRoom(result.property.rooms);

      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    } else {
      const updatedRooms = localRooms.filter((_, i) => i !== index);
      setLocalRooms(updatedRooms);
      onAddRoom(updatedRooms);
    }
  };

  const handleEditRoom = (index) => {
    const roomToEdit = localRooms[index];
    const roomId = roomToEdit._id || roomToEdit.id;
    setCurrentRoomId(roomId)
    setCurrentRoomData(roomToEdit);
    setEditingRoomIndex(index);
    setIsEditingRoom(true);
    setIsAddingRoom(true);
    setIsComplete(false);
  };


  const handleCancelForm = () => {
    setIsAddingRoom(false);
    setIsEditingRoom(false);
    setIsComplete(false);
    setEditingRoomIndex(-1);
    setCurrentRoomData(getInitialRoomData());
    setFormErrors({});
    setSelectedAmenityTab(0);
    setCurrentRoomId(null);
    setValidationError('');
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
       
      >
        {firstImage.type === 'image' ? (
          <CardMedia
            component="img"
            image={`${firstImage.url}`}
            alt={firstImage.filename}
            sx={{ width: '100%', height: '70%', objectFit: 'cover' }}
          />
        ) : (
          <video
            src={`${firstImage.url}`}
            style={{ width: '100%', height: '70%', objectFit: 'cover' }}
            muted loop autoPlay preload="metadata"
          />
        )}

        <CardContent sx={{ height: '30%', p: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {tag}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {imageCount > 0 && (
              <Chip label={`${imageCount} Images`} size="small" color="primary" variant="outlined" />
            )}
            {videoCount > 0 && (
              <Chip label={`${videoCount} Videos`} size="small" color="secondary" variant="outlined" />
            )}
          </Box>
        </CardContent>

        <Badge
          badgeContent={mediaItems.length}
          color="primary"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            '& .MuiBadge-badge': { fontSize: '0.75rem', minWidth: 20, height: 20 }
          }}
        />
      </Card>
    );
  };

  // Render media upload step
  const renderMediaUploadStep = () => {
    const currentRoom = currentRoomData;
    if (!currentRoom) return null;

    const groupedMedia = getRoomMediaByTag(currentRoom);
    const untaggedItems = getRoomItemsWithoutTags(currentRoom);
    const totalMedia = getRoomMediaItems(currentRoom);

    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Upload Media for {currentRoom.roomName}
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Upload photos and videos for this room. Each media item must have at least one tag.
        </Typography>

        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}

        {/* Upload Section */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div></div>
          <Box>
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
              disabled={!isSubmitting && !isEditingRoom}
            >
              {console.log(isEditingRoom, "isEdting room")}
              {!isSubmitting ? (isEditingRoom ? 'Upload Files' : "Save Room to upload media") : (isEditingRoom ? 'Upload Files' : (isFileSubmiting ? 'Uploading...' : 'Upload Files'))}
            </Button>
          </Box>
        </Box>

        {isFileSubmiting && (
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
                  <TagGroupCard tag={tag} mediaItems={mediaItems} />
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
                    onClick={() => handleEditMedia(mediaItem)}
                  >
                    {mediaItem.type === 'image' ? (
                      <CardMedia
                        component="img"
                        image={`${mediaItem.url}`}
                        alt={mediaItem.filename}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <video
                        src={`${mediaItem.url}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        muted loop autoPlay preload="metadata"
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
        {totalMedia.length === 0 && (
          <Alert severity="info">
            No media uploaded for this room yet. Upload some photos and videos to showcase this room.
          </Alert>
        )}

        {untaggedItems.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {untaggedItems.length} media item(s) need tags. Click on items with red borders to add tags.
          </Alert>
        )}
      </Box>
    );
  };



  const bedTypes = [
    'Single Bed', 'Double Bed', 'Queen Bed', 'King Bed', 'Bunk Bed',
    'Sofa Bed', 'Couch', 'Floor Mattress', 'Air Mattress', 'Crib'
  ];

  const handleRoomChange = (field, value) => {
    setCurrentRoomData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBathroomTypeChange = (type, checked) => {
    if (checked) {
      // If checking one, uncheck the other
      setCurrentRoomData(prev => ({
        ...prev,
        bathrooms: {
          ...prev.bathrooms,
          private: type === 'private',
          shared: type === 'shared'
        }
      }));
    }
    // If unchecking, we don't allow it (at least one must be selected)
  };

  const handleNestedChange = (section, field, value) => {
    setCurrentRoomData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };




  const handleRoomAmenityChange = (category, amenityName, updates) => {
    const key = amenityName.replace(/[^a-zA-Z0-9]/g, '');

    setCurrentRoomData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [category]: {
          ...prev.amenities[category],
          [key]: updates
        }
      }
    }));
  };


  const handleBedChange = (index, field, value) => {
    const updatedBeds = [...currentRoomData.beds];
    updatedBeds[index] = { ...updatedBeds[index], [field]: value };

    // Update maximum occupancy based on beds
    let totalAccommodates = 0;
    updatedBeds.forEach(bed => {
      totalAccommodates += (bed.count * bed.accommodates);
    });

    const updatedOccupancy = {
      ...currentRoomData.occupancy,
      maximumOccupancy: totalAccommodates
    };

    setCurrentRoomData(prev => ({
      ...prev,
      beds: updatedBeds,
      occupancy: updatedOccupancy
    }));
  };

  const addBed = () => {
    setCurrentRoomData(prev => ({
      ...prev,
      beds: [...prev.beds, { bedType: '', count: 1, accommodates: 1 }]
    }));
  };

  const removeBed = (index) => {
    if (currentRoomData.beds.length <= 1) return;

    const updatedBeds = currentRoomData.beds.filter((_, i) => i !== index);

    // Recalculate maximum occupancy
    let totalAccommodates = 0;
    updatedBeds.forEach(bed => {
      totalAccommodates += (bed.count * bed.accommodates);
    });

    const updatedOccupancy = {
      ...currentRoomData.occupancy,
      maximumOccupancy: totalAccommodates
    };

    setCurrentRoomData(prev => ({
      ...prev,
      beds: updatedBeds,
      occupancy: updatedOccupancy
    }));
  };


  const handleDuplicateRoom = async (index) => {
    if (!window.confirm('Do you want to duplicate this room? Media will not be copied.')) {
    return;
  }
  const roomToDuplicate = localRooms[index];
  
  // Create a deep copy of the room data, excluding the _id and media
  const duplicatedRoomData = {
    ...roomToDuplicate,
    roomName: `${roomToDuplicate.roomName} (Copy)`,
    numberRoom: roomToDuplicate.numberRoom,
    roomSize: roomToDuplicate.roomSize,
    sizeUnit: roomToDuplicate.sizeUnit,
    description: roomToDuplicate.description,
    beds: [...roomToDuplicate.beds],
    FloorBedding: { ...roomToDuplicate.FloorBedding },
    alternativeBeds: [...(roomToDuplicate.alternativeBeds || [])],
    occupancy: { ...roomToDuplicate.occupancy },
    bathrooms: { ...roomToDuplicate.bathrooms },
    mealPlan: { ...roomToDuplicate.mealPlan },
    pricing: { ...roomToDuplicate.pricing },
    availability: roomToDuplicate.availability.map(avail => ({ ...avail })),
    amenities: JSON.parse(JSON.stringify(roomToDuplicate.amenities)) // Deep copy
  };

  // Remove fields that shouldn't be duplicated
  delete duplicatedRoomData._id;
  delete duplicatedRoomData.id;
  delete duplicatedRoomData.media;
  delete duplicatedRoomData.createdAt;
  delete duplicatedRoomData.updatedAt;

  setIsSubmitting(true);
  
  try {
    const result = await dispatch(addRooms({
      id: propertyId,
      data: duplicatedRoomData
    })).unwrap();

    if (result.room) {
      // Update local rooms
      const updatedRooms = [...localRooms, result.room];
      setLocalRooms(updatedRooms);
      onAddRoom(updatedRooms);
      
      // Optionally show success message
      setValidationError('');
    }
  } catch (error) {
    console.error('Failed to duplicate room:', error);
    setValidationError('Failed to duplicate room. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};


  // Main render logic
  if (isAddingRoom) {



    // Room details step - render your existing room form here
    return (
      <Paper className="p-4 mb-4">
        <Typography variant="h6" gutterBottom>
          {isEditingRoom ? 'Edit Room' : 'Add New Room'}
        </Typography>



        {/* Edit Media Dialog */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            Edit Media Tags
          </DialogTitle>
          <DialogContent>
            {editingMedia && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
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
                   <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => handleDeleteMedia(editingMedia._id)}
                                      >
                                        Delete
                                      </Button>
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
                          onDelete={() => {
                            setEditingMedia(prev => ({
                              ...prev,
                              tags: prev.tags.filter(t => t !== tag)
                            }));
                          }}
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
                    placeholder="Add Custom Tag"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && customTag.trim() && !editingMedia.tags.includes(customTag.trim())) {
                        setEditingMedia(prev => ({
                          ...prev,
                          tags: [...prev.tags, customTag.trim()]
                        }));
                        setCustomTag('');
                      }
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{
                    maxHeight: 300,
                    overflow: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1
                  }}>
                    <List>
                      {availableRoomTags.map((tag) => (
                        <ListItem key={tag} dense button onClick={() => handleTagToggle(tag)}>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={editingMedia.tags.includes(tag)}
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText primary={tag} />
                        </ListItem>
                      ))}
                    </List>
                    
                  </Box>
                </Grid>
                
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setEditDialog(false);
             
            }}>Back</Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              disabled={!editingMedia?.tags || editingMedia.tags.length === 0}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Tag Group Dialog - Add your existing tag group dialog here */}

        <Grid container spacing={3}>
          {/* Basic Room Details - Same as before */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField
              sx={{
                "& .MuiOutlinedInput-root": {

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2e2e2e",
                  },
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                  },
                  "& .MuiInputLabel-outlined": {
                    color: "#2e2e2e",
                    "&.Mui-focused": {
                      color: "secondary.main",

                    },
                  },
                },
              }}
              fullWidth
              label="Room Name *"
              value={currentRoomData.roomName}
              onChange={(e) => handleRoomChange('roomName', e.target.value)}
              error={!!formErrors.roomName}
              helperText={formErrors.roomName}
              className="mb-4"
            />

            <Grid container spacing={2}>
              <Grid item size={{ xs: 8 }}>
                <TextField
                  sx={{
                    "& .MuiOutlinedInput-root": {

                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#2e2e2e",
                      },
                      "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      },
                      "& .MuiInputLabel-outlined": {
                        color: "#2e2e2e",
                        "&.Mui-focused": {
                          color: "secondary.main",

                        },
                      },
                    }, marginTop: '10px'
                  }}
                  fullWidth
                  label="Room Size *"
                  type="number"
                  value={currentRoomData.roomSize}
                  onChange={(e) => handleRoomChange('roomSize', e.target.value)}
                  error={!!formErrors.roomSize}
                  helperText={formErrors.roomSize}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl sx={{
                  "& .MuiOutlinedInput-root": {

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",

                      },
                    },
                  }, marginTop: '10px'
                }} fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={currentRoomData.sizeUnit}
                    onChange={(e) => handleRoomChange('sizeUnit', e.target.value)}
                    label="Unit"
                  >
                    <MenuItem value="sqft">sq ft</MenuItem>
                    <MenuItem value="sqm">sq m</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item size={{ xs: 12, md: 6 }}>
            <TextField
              sx={{
                "& .MuiOutlinedInput-root": {

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2e2e2e",
                  },
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                  },
                  "& .MuiInputLabel-outlined": {
                    color: "#2e2e2e",
                    "&.Mui-focused": {
                      color: "secondary.main",

                    },
                  },
                },
              }}
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={currentRoomData.description}
              onChange={(e) => handleRoomChange('description', e.target.value)}
              className="mb-4"
            />
          </Grid>

          {/* Bed Configuration - Same as before */}
          <Grid item size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>Bed Configuration *</Typography>

            {currentRoomData.beds.map((bed, index) => (
              <Grid container spacing={2} key={index} className="mb-3 items-end">
                <Grid item size={{ xs: 12 }} sm={4}>
                  <FormControl sx={{
                    "& .MuiOutlinedInput-root": {

                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#2e2e2e",
                      },
                      "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      },
                      "& .MuiInputLabel-outlined": {
                        color: "#2e2e2e",
                        "&.Mui-focused": {
                          color: "secondary.main",

                        },
                      },
                    },
                  }} fullWidth error={!!formErrors.beds?.[index]?.bedType}>
                    <InputLabel>Bed Type *</InputLabel>
                    <Select
                      value={bed.bedType}
                      onChange={(e) => handleBedChange(index, 'bedType', e.target.value)}
                      label="Bed Type *"
                    >
                      {bedTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                    {formErrors.beds?.[index]?.bedType && (
                      <FormHelperText>{formErrors.beds[index].bedType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item size={{ xs: 12, md: 3 }}>
                  <TextField sx={{
                    "& .MuiOutlinedInput-root": {

                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#2e2e2e",
                      },
                      "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      },
                      "& .MuiInputLabel-outlined": {
                        color: "#2e2e2e",
                        "&.Mui-focused": {
                          color: "secondary.main",

                        },
                      },
                    },
                  }}
                    fullWidth
                    label="Number of Beds(of this type) *"
                    type="number"
                    value={bed.count}
                    onChange={(e) => handleBedChange(index, 'count', parseInt(e.target.value))}
                    error={!!formErrors.beds?.[index]?.count}
                    helperText={formErrors.beds?.[index]?.count}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>

                <Grid item size={{ xs: 12, md: 3 }}>
                  <TextField sx={{
                    "& .MuiOutlinedInput-root": {

                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#2e2e2e",
                      },
                      "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      },
                      "& .MuiInputLabel-outlined": {
                        color: "#2e2e2e",
                        "&.Mui-focused": {
                          color: "secondary.main",

                        },
                      },
                    },
                  }}
                    fullWidth
                    label="Accommodates *"
                    type="number"
                    value={bed.accommodates}
                    onChange={(e) => handleBedChange(index, 'accommodates', parseInt(e.target.value))}
                    error={!!formErrors.beds?.[index]?.accommodates}
                    helperText={formErrors.beds?.[index]?.accommodates}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>

                <Grid item size={{ xs: 12 }} sm={2} className="flex justify-end">
                  <IconButton
                    color="error"
                    onClick={() => removeBed(index)}
                    disabled={currentRoomData.beds.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={addBed}
              className="mt-2"
            >
              Add Another Bed
            </Button>
          </Grid>

          {/* Bed Configuration - Same as before */}
          <Grid item size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>Number of rooms (of this type) *</Typography>

            <Grid item size={{ xs: 4 }}>
              <TextField
                sx={{
                  "& .MuiOutlinedInput-root": {

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",

                      },
                    },
                  }, marginTop: '10px'
                }}
                fullWidth
                label="Number of rooms (of this type) *"
                type="number"
                value={currentRoomData.numberRoom}
                onChange={(e) => handleRoomChange('numberRoom', e.target.value)}
                error={!!formErrors.numberRoom}
                helperText={formErrors.numberRoom}
              />
            </Grid>

          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                checked={currentRoomData.FloorBedding.available}
                onChange={(e) => handleNestedChange('FloorBedding', 'available', e.target.checked)}
              />
            }
            label="Floor Bedding (Gaddi)"
          />

          {currentRoomData.FloorBedding.available && (<Grid item size={{ xs: 12, md: 6 }}>
            <TextField sx={{
              "& .MuiOutlinedInput-root": {

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}
              fullWidth
              label="How many?"
              type="number"
              value={currentRoomData.FloorBedding.count}
              onChange={(e) => handleNestedChange('FloorBedding', 'count', parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>)}

          {/* Occupancy, Bathroom, Meal Plan sections - Same as before */}
          <Grid item size={{ xs: 12 }}>
            <Divider className="my-3" />
            <Typography sx={{ marginTop: "5px" }} variant="subtitle1" gutterBottom>Occupancy</Typography>

            <Grid container spacing={3}>
              <Grid sx={{ marginTop: "10px" }} item size={{ xs: 12, md: 6 }}>
                <TextField sx={{
                  "& .MuiOutlinedInput-root": {

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",

                      },
                    },
                  },
                }}
                  fullWidth
                  label="Base Adults *"
                  type="number"
                  value={currentRoomData.occupancy?.baseAdults}
                  onChange={(e) => handleNestedChange('occupancy', 'baseAdults', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField sx={{
                  "& .MuiOutlinedInput-root": {

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",

                      },
                    },
                  },
                }}
                  fullWidth
                  label="Maximum Adults *"
                  type="number"
                  value={currentRoomData.occupancy.maximumAdults}
                  onChange={(e) => handleNestedChange('occupancy', 'maximumAdults', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField sx={{
                  "& .MuiOutlinedInput-root": {

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",

                      },
                    },
                  },
                }}
                  fullWidth
                  label="Maximum Children"
                  type="number"
                  value={currentRoomData.occupancy?.maximumChildren}
                  onChange={(e) => handleNestedChange('occupancy', 'maximumChildren', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>

              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField sx={{
                  "& .MuiOutlinedInput-root": {

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",

                      },
                    },
                  },
                }}
                  fullWidth
                  label="Maximum Occupancy"
                  type="number"
                  value={currentRoomData.occupancy?.maximumOccupancy}
                  InputProps={{ readOnly: true }}
                  helperText="Calculated from beds"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Bathroom */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>Bathroom</Typography>

            <Grid container spacing={2}>
              <Grid sx={{ marginTop: "10px" }} item xs={6}>
                <TextField
                  sx={{
                    "& .MuiOutlinedInput-root": {

                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#2e2e2e",
                      },
                      "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                        },
                      },
                      "& .MuiInputLabel-outlined": {
                        color: "#2e2e2e",
                        "&.Mui-focused": {
                          color: "secondary.main",

                        },
                      },
                    },
                  }}
                  fullWidth
                  label="Bathroom Count *"
                  type="number"
                  value={currentRoomData.bathrooms.count}
                  onChange={(e) => handleNestedChange('bathrooms', 'count', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" gap={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentRoomData.bathrooms.private}
                        onChange={(e) => handleBathroomTypeChange('private', e.target.checked)}
                      />
                    }
                    label="Private Bathroom"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentRoomData.bathrooms.shared}
                        onChange={(e) => handleBathroomTypeChange('shared', e.target.checked)}
                      />
                    }
                    label="Shared Bathroom"
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Meal Plan */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>Meal Plan</Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={currentRoomData.mealPlan.available}
                  onChange={(e) => handleNestedChange('mealPlan', 'available', e.target.checked)}
                />
              }
              label="Meal Plan Available"
            />

            {currentRoomData.mealPlan.available && (
              <FormControl sx={{
                "& .MuiOutlinedInput-root": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2e2e2e",
                  },
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                  },
                  "& .MuiInputLabel-outlined": {
                    color: "#2e2e2e",
                    "&.Mui-focused": {
                      color: "secondary.main",

                    },
                  },
                },
              }} fullWidth>
                <InputLabel>Meal</InputLabel>
                <Select
                  value={currentRoomData.mealPlan.planType}
                  onChange={(e) => handleNestedChange('mealPlan', 'planType', e.target.value)}
                  label="Plan Type"
                >
                  <MenuItem value="Accommodation only">Accommodation only</MenuItem>
                  <MenuItem value="Free Breakfast">Free Breakfast</MenuItem>
                  <MenuItem value="Free Breakfast and Lunch/Dinner">Free Breakfast and Lunch/Dinner</MenuItem>
                  <MenuItem value="Free Breakfast Lunch And Dinner">Free Breakfast Lunch And Dinner </MenuItem>
                  <MenuItem value="Free Cooked Breakfast">Free Cooked Breakfast </MenuItem>
                  <MenuItem value="Free Breakfast, Lunch, Dinner">Free Breakfast, Lunch, Dinner And Custom Inclusion</MenuItem>
                  <MenuItem value="Free Breakfast And Lunch">Free Breakfast And Lunch </MenuItem>
                  <MenuItem value="Free Breakfast And Dinner">Free Breakfast And Dinner </MenuItem>
                  <MenuItem value="Free Lunch">Free Lunch </MenuItem>
                  <MenuItem value="Free Dinner">Free Dinner </MenuItem>
                  <MenuItem value="Free  Lunch and Dinner">Free  Lunch and Dinner </MenuItem>

                </Select>
              </FormControl>
            )}
          </Grid>

          {/* Pricing */}
          <Grid item size={{ xs: 12 }}>
            <Divider className="my-3" />
            <Typography sx={{ marginTop: "10px" }} variant="subtitle1" gutterBottom>Pricing</Typography>

            <Grid container spacing={3}>
              <Grid sx={{ marginTop: "10px" }} item size={{ xs: 12 }} md={4}>
                <TextField sx={{
                  "& .MuiOutlinedInput-root": {

                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",

                      },
                    },
                  },
                }}
                  fullWidth
                  label="Base Price (per night) *"
                  type="number"
                  value={currentRoomData.pricing?.baseAdultsCharge}
                  onChange={(e) => handleNestedChange('pricing', 'baseAdultsCharge', parseFloat(e.target.value))}
                  error={!!formErrors.baseAdultsCharge}
                  helperText={formErrors.baseAdultsCharge}
                  InputProps={{ startAdornment: '₹' }}
                />
              </Grid>

              <Grid item size={{ xs: 12 }} md={4}>
                <TextField sx={{
                  "& .MuiOutlinedInput-root": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",

                      },
                    },
                  },
                }}
                  fullWidth
                  label="Extra Adult Charge"
                  type="number"
                  value={currentRoomData.pricing?.extraAdultsCharge}
                  onChange={(e) => handleNestedChange('pricing', 'extraAdultsCharge', parseFloat(e.target.value))}
                  InputProps={{ startAdornment: '₹' }}
                />
              </Grid>

              <Grid item size={{ xs: 12 }} md={4}>
                <TextField sx={{
                  "& .MuiOutlinedInput-root": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e2e2e",
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    },
                    "& .MuiInputLabel-outlined": {
                      color: "#2e2e2e",
                      "&.Mui-focused": {
                        color: "secondary.main",

                      },
                    },
                  },
                }}
                  fullWidth
                  label="Child Charge"
                  type="number"
                  value={currentRoomData.pricing?.childCharge}
                  onChange={(e) => handleNestedChange('pricing', 'childCharge', parseFloat(e.target.value))}
                  InputProps={{ startAdornment: '₹' }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>


        {/* Room Amenities */}
        <RoomsAmenities roomAmenityCategories={roomAmenityCategories} currentRoomData={currentRoomData} selectedAmenityTab={selectedAmenityTab} setSelectedAmenityTab={setSelectedAmenityTab} handleRoomAmenityChange={handleRoomAmenityChange} />
        <div className='my-5'>{renderMediaUploadStep()}</div>

        <div className="flex justify-end mt-4 gap-2">
          <Button
            variant="outlined"
            onClick={()=>{
              handleCancelForm()
            }}
          >
            Back
          </Button>
          
          {/* <Button
            variant="contained"
            color="primary"
            disabled={Object.keys(currentRoomData.amenities.mandatory).length > 0 || isSubmitting || isCompleted}
            onClick={isEditingRoom ? handleUpdateRoom : handleAddRoom}
          >
            {isEditingRoom ? 'Update Room' : 'Save Room'}
          </Button> */}

          <Button
          variant="contained"
          color="primary"
          disabled={ !validateMandatoryAmenities() || isSubmitting }
          onClick={isEditingRoom ? handleUpdateRoom : handleAddRoom}
        >
          {isEditingRoom ? 'Update Room' : 'Save Room'}
        </Button>
        </div>
      </Paper>
    );
  }



  // Room list view - your existing room list JSX
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Property Rooms
      </Typography>

      <div className="mb-6">

        <Grid container spacing={3}>
          {localRooms.map((room, index) => (
            <Grid item size={{ xs: 12, md: 6 }} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="h6">{room.roomName}</Typography>
                    <div className="flex gap-1">
                       <IconButton
            size="small"
            color="primary"
            onClick={() => handleEditRoom(index)}
            title="Edit Room"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleDuplicateRoom(index)}
            disabled={isSubmitting}
            title="Duplicate Room"
          >
            <ContentCopy />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteRoom(index)}
            title="Delete Room"
          >
            <DeleteIcon />
          </IconButton>
                    </div>
                  </div>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {room.roomSize} {room.sizeUnit}
                  </Typography>

                  {room.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {room.description}
                    </Typography>
                  )}

                  <Divider className="my-2" />

                  <div className="space-y-1">
                    <Typography variant="body2">
                      <strong>Beds:</strong> {room.beds?.map(bed =>
                        `${bed.count}x ${bed.bedType} (${bed.accommodates} guests)`
                      ).join(', ')}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Occupancy:</strong> {room.occupancy?.baseAdults}-{room.occupancy?.maximumAdults} adults
                      {room.occupancy?.maximumChildren > 0 && `, up to ${room.occupancy.maximumChildren} children`}
                      {` (max ${room.occupancy?.maximumOccupancy} total)`}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Bathroom:</strong> {room.bathrooms.count}
                      {room.bathrooms.private ? ' private' : ' shared'}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Price:</strong> ₹{room.pricing?.baseAdultsCharge} per night
                    </Typography>

                    <Typography variant="body2">
                      <strong>Availability:</strong> {room.availability?.length || 0} period(s)
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>

      <div className='flex justify-between'>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddingRoom(true)}
          sx={{ mt: 2 }}
        >
          Add Room
        </Button>
        <Button
          disabled={localRooms.length == 0}
          variant="contained"
          onClick={() => {
            dispatch(completeRoomsStep(propertyId))
            onComplete?.()
          }}
          sx={{ mt: 2 }}
        >
          Complete Room
        </Button>
      </div>
    </Box>
  );
}