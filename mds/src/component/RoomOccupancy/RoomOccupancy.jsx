// components/RoomOccupancy/RoomOccupancy.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Home } from '@mui/icons-material';
import BookingFlow from '../walkinbookings/BookingFlow';
import { checkRoomAvailability, fetchRooms, resetRoomFilters, updateRoomFilters, updateRoomStatus } from '@/redux/features/rooms/roomSlice';
import RoomDetailsModal from './RoomDetailsModal';


const RoomOccupancy = ({ property }) => {
    const dispatch = useDispatch();
  const { 
    rooms, 
    isLoading, 
    error, 
    pagination, 
    filters,
    availabilityCheck 
  } = useSelector(state => state.rooms);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState(null);
const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);
useEffect(() => {
    if (property?._id) {
      dispatch(fetchRooms({ 
        propertyId: property._id, 
        filters,
        page: 1,
        limit: 50
      }));
    }
  }, [dispatch, property?._id, filters]);

  const handleFilterChange = (filterType, value) => {
    dispatch(updateRoomFilters({ [filterType]: value }));
  };

  const handleClearFilters = () => {
    dispatch(resetRoomFilters());
  };

  const handleUpdateRoomStatus = async (roomId, status) => {
    try {
      await dispatch(updateRoomStatus({ roomId, status })).unwrap();
      // Optionally show success message
    } catch (error) {
      console.error('Failed to update room status:', error);
      // Show error message to user
    }
  };

  const handleCheckAvailability = async (roomId, startDate, endDate) => {
    try {
      const result = await dispatch(checkRoomAvailability({ 
        roomId, 
        startDate, 
        endDate 
      })).unwrap();
      return result.data;
    } catch (error) {
      console.error('Failed to check availability:', error);
      return null;
    }
  };

  const handleAddGuest = (room) => {
    console.log(room)
    setSelectedRoom(room);
    setShowBookingFlow(true);
  };

  const handleRoomDetails = (room) => {
  setSelectedRoomForDetails(room);
  setShowRoomDetailsModal(true);
};


const handleGuestDetails = (room) => {
  setSelectedRoomForDetails(room);
  setShowRoomDetailsModal(true);
};
  const getFilteredRooms = () => {
    return rooms.filter(room => {
      const statusMatch = filters.status === 'All' || room.status === filters.status.toLowerCase();
      const typeMatch = filters.roomType === 'All' || room.type === filters.roomType;
      const bedMatch = filters.bedSize === 'All' || room.bedSize === filters.bedSize;
      return statusMatch && typeMatch && bedMatch;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'booked':
        return 'warning';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredRooms = getFilteredRooms();

  if (showBookingFlow) {
    return (
      <BookingFlow
        selectedProperty={property}
        selectedRoom={selectedRoom}
        onClose={() => {
          setShowBookingFlow(false);
          setSelectedRoom(null);
        }}
      />
    );
  }



  if (isLoading) {
    return <div>Loading rooms...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography color="text.primary">Occupancy</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Occupancy
      </Typography>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item size={{xs:12, sm:6, md:3}}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="booked">Booked</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{xs:12, sm:6, md:3}}>
            <FormControl fullWidth size="small">
              <InputLabel>Room Type</InputLabel>
              <Select
                value={filters.roomType}
                label="Room Type"
                onChange={(e) => handleFilterChange('roomType', e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Deluxe">Deluxe</MenuItem>
                <MenuItem value="Super Deluxe">Super Deluxe</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
                <MenuItem value="Family Suite">Family Suite</MenuItem>
                <MenuItem value="Business Room">Business Room</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{xs:12, sm:6, md:3}}>
            <FormControl fullWidth size="small">
              <InputLabel>Bed Size</InputLabel>
              <Select
                value={filters.bedSize}
                label="Bed Size"
                onChange={(e) => handleFilterChange('bedSize', e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Single Bed">Single Bed</MenuItem>
                <MenuItem value="Double Bed">Double Bed</MenuItem>
                <MenuItem value="Queen Bed">Queen Bed</MenuItem>
                <MenuItem value="King Bed">King Bed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{xs:12, sm:6, md:3}}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleClearFilters}
              sx={{ height: '40px' }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Rooms Grid */}
      
        <Box sx={{ mb: 4 }}>
          
          <Grid container spacing={2}>
            {filteredRooms.map((room) => (
              <Grid item  size={{xs:12, sm:6, md:3}} key={room._id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: room.status === 'available' ? '1px solid #4caf50' : '1px solid #ff9800',
                    backgroundColor: room.status === 'available' ? '#f3f9f4' : '#fff8e1',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  {/* Status Badge */}
                  <Chip
                    label={getStatusText(room.status)}
                    color={getStatusColor(room.status)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      fontSize: '0.7rem'
                    }}
                  />

                  <CardContent sx={{ pt: 1 }}>
  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
    Room {room.number}
  </Typography>
  
  <Typography variant="body2" color="text.secondary" gutterBottom>
    {room.type}
  </Typography>
  
  <Typography variant="body2" color="text.secondary" gutterBottom>
    {room.bedSize}
  </Typography>
  
  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
    {room.occupancy.maximumAdults} Adult{room.occupancy.maximumAdults > 1 ? 's' : ''}
    {room.occupancy.maximumChildren > 0 && `, ${room.occupancy.maximumChildren} Child${room.occupancy.maximumChildren > 1 ? 'ren' : ''}`}
  </Typography>

  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    <Button
      variant="outlined"
      color="primary"
      size="small"
      onClick={() => handleRoomDetails(room)}
      sx={{ 
        fontSize: '0.75rem',
        textTransform: 'none',
        minWidth: 'auto',
        px: 1
      }}
    >
      View Details
    </Button>
    
    {room.status === 'available' ? (
      <Button
        variant="text"
        color="primary"
        size="small"
        onClick={() => handleAddGuest(room)}
        sx={{ 
          fontSize: '0.75rem',
          textTransform: 'none',
          minWidth: 'auto',
          px: 1
        }}
      >
        Add Guest
      </Button>
    ) : (
      <Button
        variant="text"
        color="warning"
        size="small"
        onClick={() => handleGuestDetails(room)}
        sx={{ 
          fontSize: '0.75rem',
          textTransform: 'none',
          minWidth: 'auto',
          px: 1
        }}
      >
        Guest Details
      </Button>
    )}
  </Box>
</CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>


      {filteredRooms.length === 0 && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No rooms found matching your filters
          </Typography>
        </Paper>
      )}


       <RoomDetailsModal
      open={showRoomDetailsModal}
      onClose={() => {
        setShowRoomDetailsModal(false);
        setSelectedRoomForDetails(null);
      }}
      room={selectedRoomForDetails}
      onCheckAvailability={handleCheckAvailability}
      onUpdateStatus={handleUpdateRoomStatus}
    />
    </Container>
  );
};

export default RoomOccupancy;