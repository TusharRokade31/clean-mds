'use client'
import { useState, useEffect } from 'react';
import { 
  Button, Typography, Divider, TextField, FormControl, 
  InputLabel, Select, MenuItem, FormHelperText, Grid, 
  Paper, IconButton, Chip, Box, Checkbox, FormControlLabel,
  Card, CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useDispatch } from 'react-redux';
import { addRooms, deleteRoom, updateRoom } from '@/redux/features/property/propertySlice';

export default function RoomsForm({ rooms = [], propertyId, onAddRoom, errors, onSave, onBack }) {
  const dispatch = useDispatch();
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState(-1);
  const [currentRoomData, setCurrentRoomData] = useState(getInitialRoomData());
  const [formErrors, setFormErrors] = useState({});
  const [localRooms, setLocalRooms] = useState(rooms);
  
  // Update local rooms when props change
  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  function getInitialRoomData() {
    return {
      roomType: '',
      roomName: '',
      roomSize: '',
      sizeUnit: 'sqft',
      description: '',
      beds: [{ bedType: '', count: 1, accommodates: 1 }],
      alternativeBeds: [],
      occupancy: {
        baseAdults: 1,
        maximumAdults: 1,
        maximumChildren: 0,
        maximumOccupancy: 1
      },
      bathrooms: {
        count: 1,
        private: true
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
        popularWithGuests: {},
        bathroom: {},
        roomFeatures: {},
        kitchenAppliances: {},
        bedsAndBlanket: {},
        safetyAndSecurity: {},
        otherFacilities: {}
      }
    };
  }
  
  const bedTypes = [
    'Single Bed', 'Double Bed', 'Queen Bed', 'King Bed', 'Bunk Bed', 
    'Sofa Bed', 'Couch', 'Floor Mattress', 'Air Mattress', 'Crib'
  ];
  
  const roomTypes = [
    'Standard Room', 'Deluxe Room', 'Suite', 'Executive Suite', 'Family Room',
    'Studio', 'Cottage', 'Villa', 'Apartment', 'Dormitory'
  ];
  
  const handleRoomChange = (field, value) => {
    setCurrentRoomData(prev => ({
      ...prev,
      [field]: value
    }));
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
  
  const validateRoomData = () => {
    const errors = {};
    
    if (!currentRoomData.roomType) errors.roomType = 'Room type is required';
    if (!currentRoomData.roomName) errors.roomName = 'Room name is required';
    if (!currentRoomData.roomSize || currentRoomData.roomSize <= 0) errors.roomSize = 'Valid room size is required';
    
    // Validate beds
    if (currentRoomData.beds.length === 0) {
      errors.beds = 'At least one bed is required';
    } else {
      const bedErrors = [];
      currentRoomData.beds.forEach((bed, index) => {
        if (!bed.bedType) bedErrors[index] = { ...bedErrors[index], bedType: 'Bed type is required' };
        if (!bed.count || bed.count <= 0) bedErrors[index] = { ...bedErrors[index], count: 'Count must be at least 1' };
        if (!bed.accommodates || bed.accommodates <= 0) bedErrors[index] = { ...bedErrors[index], accommodates: 'Accommodates must be at least 1' };
      });
      if (bedErrors.length > 0) errors.beds = bedErrors;
    }
    
    // Validate pricing
    if (!currentRoomData.pricing.baseAdultsCharge || currentRoomData.pricing.baseAdultsCharge <= 0) {
      errors.baseAdultsCharge = 'Base price is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAddRoom = async () => {
    if (!validateRoomData()) return;
    
    try {
      // Call the API to add the room
      const result = await dispatch(addRooms({
        id: propertyId,
        data: currentRoomData // Send single room object
      }));
      
      if (result.type.endsWith('/fulfilled')) {
        // Update local state
        const updatedRooms = [...localRooms, currentRoomData];
        setLocalRooms(updatedRooms);
        onAddRoom(updatedRooms); // Update parent component
        
        // Reset form
        setIsAddingRoom(false);
        setCurrentRoomData(getInitialRoomData());
        setFormErrors({});
      }
    } catch (error) {
      console.error('Failed to add room:', error);
    }
  };

  const handleUpdateRoom = async () => {
    if (!validateRoomData()) return;
    console.log(formErrors)
    console.log(currentRoomData)
    
    try {
      // Get the room ID if it exists (for existing rooms)
      const roomToUpdate = localRooms[editingRoomIndex];
      const roomId = roomToUpdate._id || roomToUpdate.id;
      
      const result = await dispatch(updateRoom({
        id: propertyId,
        data: {
          roomId,
          roomToUpdate
        }
      }));
      
      if (result.type.endsWith('/fulfilled')) {
        // Update local state
        const updatedRooms = [...localRooms];
        updatedRooms[editingRoomIndex] = currentRoomData;
        setLocalRooms(updatedRooms);
        onAddRoom(updatedRooms); // Update parent component
        
        // Reset form
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
  
  // If room has an ID, it's saved in backend, so we need to call delete API
  if (roomId && propertyId) {
    try {
      const result = await dispatch(deleteRoom({ 
        propertyId, 
        roomId 
      }));
      
      if (result.type.endsWith('/fulfilled')) {
        // Remove from local state after successful deletion
        const updatedRooms = localRooms.filter((_, i) => i !== index);
        setLocalRooms(updatedRooms);
        onAddRoom(updatedRooms);
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
      // You might want to show an error message to the user
    }
  } else {
    // Room not saved yet, just remove locally
    const updatedRooms = localRooms.filter((_, i) => i !== index);
    setLocalRooms(updatedRooms);
    onAddRoom(updatedRooms);
  }
};

  const handleEditRoom = (index) => {
    const roomToEdit = localRooms[index];
    setCurrentRoomData(roomToEdit);
    setEditingRoomIndex(index);
    setIsEditingRoom(true);
    setIsAddingRoom(true); // Reuse the same form
  };

  const handleCancelForm = () => {
    setIsAddingRoom(false);
    setIsEditingRoom(false);
    setEditingRoomIndex(-1);
    setCurrentRoomData(getInitialRoomData());
    setFormErrors({});
  };
  
  return (
    <div>
      <Typography variant="h5" gutterBottom>Room Details</Typography>

      {localRooms.length === 0 && !isAddingRoom && (
        <div className="text-center py-8">
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No rooms added yet. Please add at least one room to continue.
          </Typography>
        </div>
      )}

      {/* List of added rooms */}
      {localRooms.length > 0 && !isAddingRoom && (
        <div className="mb-6">
          <Typography variant="h6" gutterBottom>Added Rooms ({localRooms.length})</Typography>
          <Grid container spacing={3}>
            {localRooms.map((room, index) => (
              <Grid item size={{xs:12 ,md:6}} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <Typography variant="h6">{room.roomName}</Typography>
                      <div className="flex gap-1">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditRoom(index)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteRoom(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </div>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {room.roomType} · {room.roomSize} {room.sizeUnit}
                    </Typography>
                    
                    {room.description && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {room.description}
                      </Typography>
                    )}
                    
                    <Divider className="my-2" />
                    
                    <div className="space-y-1">
                      <Typography variant="body2">
                        <strong>Beds:</strong> {room.beds.map(bed => 
                          `${bed.count}x ${bed.bedType} (${bed.accommodates} guests)`
                        ).join(', ')}
                      </Typography>
                      
                      <Typography variant="body2">
                        <strong>Occupancy:</strong> {room.occupancy.baseAdults}-{room.occupancy.maximumAdults} adults
                        {room.occupancy.maximumChildren > 0 && `, up to ${room.occupancy.maximumChildren} children`}
                        {` (max ${room.occupancy.maximumOccupancy} total)`}
                      </Typography>
                      
                      <Typography variant="body2">
                        <strong>Bathroom:</strong> {room.bathrooms.count} 
                        {room.bathrooms.private ? ' private' : ' shared'}
                      </Typography>
                      
                      {room.mealPlan.available && (
                        <Typography variant="body2">
                          <strong>Meal Plan:</strong> {room.mealPlan.planType || 'Available'}
                        </Typography>
                      )}
                      
                      <Typography variant="body2">
                        <strong>Price:</strong> ₹{room.pricing.baseAdultsCharge} per night
                        {room.pricing.extraAdultsCharge && ` (+₹${room.pricing.extraAdultsCharge} per extra adult)`}
                        {room.pricing.childCharge && ` (+₹${room.pricing.childCharge} per child)`}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      )}
      
      {/* Add/Edit room form */}
      {isAddingRoom ? (
        <Paper className="p-4 mb-4">
          <Typography variant="h6" gutterBottom>
            {isEditingRoom ? 'Edit Room' : 'Add New Room'}
          </Typography>
          
          <Grid container spacing={3}>
            {/* Basic Room Details */}
            <Grid item size={{xs:12 ,md:6}}>
              <FormControl fullWidth error={!!formErrors.roomType} className="mb-4">
                <InputLabel>Room Type *</InputLabel>
                <Select
                  value={currentRoomData.roomType}
                  onChange={(e) => handleRoomChange('roomType', e.target.value)}
                  label="Room Type *"
                >
                  {roomTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formErrors.roomType && <FormHelperText>{formErrors.roomType}</FormHelperText>}
              </FormControl>
              
              <TextField
                fullWidth
                label="Room Name *"
                value={currentRoomData.roomName}
                onChange={(e) => handleRoomChange('roomName', e.target.value)}
                error={!!formErrors.roomName}
                helperText={formErrors.roomName}
                className="mb-4"
              />
              
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
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
                  <FormControl fullWidth>
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
            
            <Grid item size={{xs:12 ,md:6}}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={currentRoomData.description}
                onChange={(e) => handleRoomChange('description', e.target.value)}
                className="mb-4"
              />
            </Grid>
            
            {/* Bed Configuration */}
            <Grid item size={{xs:12}}>
              <Typography variant="subtitle1" gutterBottom>Bed Configuration *</Typography>
              
              {currentRoomData.beds.map((bed, index) => (
                <Grid container spacing={2} key={index} className="mb-3 items-end">
                  <Grid item size={{xs:12}} sm={4}>
                    <FormControl fullWidth error={!!formErrors.beds?.[index]?.bedType}>
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
                  
                  <Grid item size={{xs:12, md:6}}>
                    <TextField
                      fullWidth
                      label="Count *"
                      type="number"
                      value={bed.count}
                      onChange={(e) => handleBedChange(index, 'count', parseInt(e.target.value))}
                      error={!!formErrors.beds?.[index]?.count}
                      helperText={formErrors.beds?.[index]?.count}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                  
                  <Grid item size={{xs:12, md:6}}>
                    <TextField
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
                  
                  <Grid item size={{xs:12}} sm={2} className="flex justify-end">
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
            
            {/* Occupancy */}
            <Grid item size={{xs:12}}>
              <Divider className="my-3" />
              <Typography variant="subtitle1" gutterBottom>Occupancy</Typography>
              
              <Grid container spacing={3}>
                <Grid item size={{xs:12, md:6}}>
                  <TextField
                    fullWidth
                    label="Base Adults *"
                    type="number"
                    value={currentRoomData.occupancy.baseAdults}
                    onChange={(e) => handleNestedChange('occupancy', 'baseAdults', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                
                <Grid item size={{xs:12, md:6}}>
                  <TextField
                    fullWidth
                    label="Maximum Adults *"
                    type="number"
                    value={currentRoomData.occupancy.maximumAdults}
                    onChange={(e) => handleNestedChange('occupancy', 'maximumAdults', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                
                <Grid item size={{xs:12, md:6}}>
                  <TextField
                    fullWidth
                    label="Maximum Children"
                    type="number"
                    value={currentRoomData.occupancy.maximumChildren}
                    onChange={(e) => handleNestedChange('occupancy', 'maximumChildren', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid item size={{xs:12, md:6}}>
                  <TextField
                    fullWidth
                    label="Maximum Occupancy"
                    type="number"
                    value={currentRoomData.occupancy.maximumOccupancy}
                    InputProps={{ readOnly: true }}
                    helperText="Calculated from beds"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Bathroom */}
            <Grid item size={{xs:12 ,md:6}}>
              <Typography variant="subtitle1" gutterBottom>Bathroom</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Bathroom Count *"
                    type="number"
                    value={currentRoomData.bathrooms.count}
                    onChange={(e) => handleNestedChange('bathrooms', 'count', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentRoomData.bathrooms.private}
                        onChange={(e) => handleNestedChange('bathrooms', 'private', e.target.checked)}
                      />
                    }
                    label="Private Bathroom"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Meal Plan */}
            <Grid item size={{xs:12 ,md:6}}>
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
               <FormControl fullWidth>
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
            <Grid item size={{xs:12}}>
              <Divider className="my-3" />
              <Typography variant="subtitle1" gutterBottom>Pricing</Typography>
              
              <Grid container spacing={3}>
                <Grid item size={{xs:12}} md={4}>
                  <TextField
                    fullWidth
                    label="Base Price (per night) *"
                    type="number"
                    value={currentRoomData.pricing.baseAdultsCharge}
                    onChange={(e) => handleNestedChange('pricing', 'baseAdultsCharge', parseFloat(e.target.value))}
                    error={!!formErrors.baseAdultsCharge}
                    helperText={formErrors.baseAdultsCharge}
                    InputProps={{ startAdornment: '₹' }}
                  />
                </Grid>
                
                <Grid item size={{xs:12}} md={4}>
                  <TextField
                    fullWidth
                    label="Extra Adult Charge"
                    type="number"
                    value={currentRoomData.pricing.extraAdultsCharge}
                    onChange={(e) => handleNestedChange('pricing', 'extraAdultsCharge', parseFloat(e.target.value))}
                    InputProps={{ startAdornment: '₹' }}
                  />
                </Grid>
                
                <Grid item size={{xs:12}} md={4}>
                  <TextField
                    fullWidth
                    label="Child Charge"
                    type="number"
                    value={currentRoomData.pricing.childCharge}
                    onChange={(e) => handleNestedChange('pricing', 'childCharge', parseFloat(e.target.value))}
                    InputProps={{ startAdornment: '₹' }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <div className="flex justify-end mt-4 gap-2">
            <Button 
              variant="outlined" 
              onClick={handleCancelForm}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={isEditingRoom ? handleUpdateRoom : handleAddRoom}
            >
              {isEditingRoom ? 'Update Room' : 'Add Room'}
            </Button>
          </div>
        </Paper>
      ) : (
        <div className="flex justify-center my-4">
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setIsAddingRoom(true)}
          >
            Add a Room
          </Button>
        </div>
      )}

      {errors && errors.rooms && (
        <Typography color="error" className="mt-4">
          {errors.rooms}
        </Typography>
      )}
    </div>
  );
}