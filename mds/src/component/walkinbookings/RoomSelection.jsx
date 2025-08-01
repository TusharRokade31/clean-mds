// components/BookingFlow/steps/RoomSelection.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Person,
  Bed,
  Bathtub,
  Wifi,
  AcUnit,
  Restaurant,
  LocalParking,
  CheckCircle
} from '@mui/icons-material';
import { addDays, differenceInDays } from 'date-fns';

const RoomSelection = ({ property, bookingData, onNext, onDataChange }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [pricing, setPricing] = useState(null);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const calculatePricing = (room, adults, children, nights) => {
    if (!room || !nights) return null;

    const baseCharge = room.pricing.baseAdultsCharge;
    const extraAdults = Math.max(0, adults - room.occupancy.baseAdults);
    const extraAdultCharge = extraAdults * room.pricing.extraAdultsCharge;
    const childCharge = children * room.pricing.childCharge;
    
    const dailyRate = baseCharge + extraAdultCharge + childCharge;
    const subtotal = dailyRate * nights;
    const taxes = subtotal * 0.12; // 12% GST
    const totalAmount = subtotal + taxes;

    return {
      baseCharge: baseCharge * nights,
      extraAdultCharge: extraAdultCharge * nights,
      childCharge: childCharge * nights,
      totalDays: nights,
      subtotal,
      taxes,
      totalAmount
    };
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    if (checkIn && checkOut) {
      const nights = differenceInDays(checkOut, checkIn);
      const roomPricing = calculatePricing(room, adults, children, nights);
      setPricing(roomPricing);
      setShowPricingDialog(true);
    }
  };

  const handleDateChange = () => {
    if (checkIn && checkOut && selectedRoom) {
      const nights = differenceInDays(checkOut, checkIn);
      const roomPricing = calculatePricing(selectedRoom, adults, children, nights);
      setPricing(roomPricing);
    }
  };

  useEffect(() => {
    handleDateChange();
  }, [checkIn, checkOut, adults, children, selectedRoom]);

  const validateAndProceed = () => {
    const errors = {};

    if (!selectedRoom) errors.room = 'Please select a room';
    if (!checkIn) errors.checkIn = 'Please select check-in date';
    if (!checkOut) errors.checkOut = 'Please select check-out date';
    if (checkIn && checkOut && checkIn >= checkOut) {
      errors.dates = 'Check-out must be after check-in';
    }

    if (selectedRoom) {
      const totalGuests = adults + children;
      if (totalGuests > selectedRoom.occupancy.maximumOccupancy) {
        errors.guests = `Room can accommodate maximum ${selectedRoom.occupancy.maximumOccupancy} guests`;
      }
      if (adults > selectedRoom.occupancy.maximumAdults) {
        errors.adults = `Room can accommodate maximum ${selectedRoom.occupancy.maximumAdults} adults`;
      }
      if (children > selectedRoom.occupancy.maximumChildren) {
        errors.children = `Room can accommodate maximum ${selectedRoom.occupancy.maximumChildren} children`;
      }
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      onDataChange({
        roomId: selectedRoom._id,
        checkIn,
        checkOut,
        guestCount: { adults, children },
        pricing
      });
      onNext();
    }
  };

  const getRoomAmenities = (room) => {
    const amenities = [];
    
    // Extract amenities from room.amenities
    Object.entries(room.amenities || {}).forEach(([category, categoryAmenities]) => {
      if (categoryAmenities) {
        Object.entries(categoryAmenities).forEach(([amenity, details]) => {
          if (details.available) {
            amenities.push(amenity);
          }
        });
      }
    });

    return amenities.slice(0, 6); // Show first 6 amenities
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'Wi-Fi': <Wifi />,
      'Air Conditioning': <AcUnit />,
      'Restaurant': <Restaurant />,
      'Parking': <LocalParking />,
      'Bathroom': <Bathtub />,
      default: <CheckCircle />
    };
    return iconMap[amenity] || iconMap.default;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Date and Guest Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Select Your Dates & Guests
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{xs:12, md:3}}>
                <DatePicker
                  label="Check-in Date"
                  value={checkIn}
                  onChange={setCheckIn}
                  minDate={new Date()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!validationErrors.checkIn}
                      helperText={validationErrors.checkIn}
                    />
                  )}
                />
              </Grid>
              <Grid item size={{xs:12, md:3}}>
                <DatePicker
                  label="Check-out Date"
                  value={checkOut}
                  onChange={setCheckOut}
                  minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!validationErrors.checkOut}
                      helperText={validationErrors.checkOut}
                    />
                  )}
                />
              </Grid>
              <Grid item size={{xs:12, md:3}}>
                <FormControl fullWidth>
                  <InputLabel>Adults</InputLabel>
                  <Select
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    label="Adults"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <MenuItem key={num} value={num}>{num}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item size={{xs:12, md:3}}>
                <FormControl fullWidth>
                  <InputLabel>Children</InputLabel>
                  <Select
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    label="Children"
                  >
                    {[0, 1, 2, 3, 4].map(num => (
                      <MenuItem key={num} value={num}>{num}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            {validationErrors.dates && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {validationErrors.dates}
              </Alert>
            )}
            {validationErrors.guests && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {validationErrors.guests}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Room Selection */}
        <Typography variant="h6" gutterBottom>
          Available Rooms
        </Typography>
        <Grid container spacing={3}>
          {property?.rooms?.map((room) => (
            <Grid item size={{xs:12, md:6}} key={room._id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedRoom?._id === room._id ? '2px solid' : '1px solid',
                  borderColor: selectedRoom?._id === room._id ? 'primary.main' : 'divider',
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: 'primary.main'
                  }
                }}
                onClick={() => handleRoomSelect(room)}
              >
                {room.media?.images?.[0] && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`${process.env.NEXT_PUBLIC_IMAGE_URL}${room.media.images[0].url}`}
                    alt={room.roomName}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {room.roomName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {room.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      icon={<Person />}
                      label={`${room.occupancy.maximumOccupancy} guests max`}
                      size="small"
                    />
                    <Chip
                      icon={<Bed />}
                      label={`${room.beds.length} bed${room.beds.length > 1 ? 's' : ''}`}
                      size="small"
                    />
                    <Chip
                      icon={<Bathtub />}
                      label={`${room.bathrooms.count} bathroom${room.bathrooms.count > 1 ? 's' : ''}`}
                      size="small"
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Amenities:
                  </Typography>
                  <List dense>
                    {getRoomAmenities(room).map((amenity, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          {getAmenityIcon(amenity)}
                        </ListItemIcon>
                        <ListItemText primary={amenity} />
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" color="primary">
                    ₹{room.pricing.baseAdultsCharge}/night
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Base price for {room.occupancy.baseAdults} adult{room.occupancy.baseAdults > 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {validationErrors.room && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {validationErrors.room}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            onClick={validateAndProceed}
            disabled={!selectedRoom || !checkIn || !checkOut}
          >
            Continue to Guest Details
          </Button>
        </Box>

        {/* Pricing Dialog */}
        <Dialog open={showPricingDialog} onClose={() => setShowPricingDialog(false)}>
          <DialogTitle>Booking Summary</DialogTitle>
          <DialogContent>
            {pricing && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedRoom?.roomName}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Base Charge"
                      secondary={`₹${selectedRoom?.pricing.baseAdultsCharge} × ${pricing.totalDays} nights`}
                    />
                    <Typography>₹{pricing.baseCharge}</Typography>
                  </ListItem>
                  {pricing.extraAdultCharge > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Extra Adults"
                        secondary={`₹${selectedRoom?.pricing.extraAdultsCharge} × ${pricing.totalDays} nights`}
                      />
                      <Typography>₹{pricing.extraAdultCharge}</Typography>
                    </ListItem>
                  )}
                  {pricing.childCharge > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Children"
                        secondary={`₹${selectedRoom?.pricing.childCharge} × ${pricing.totalDays} nights`}
                      />
                      <Typography>₹{pricing.childCharge}</Typography>
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemText primary="Subtotal" />
                    <Typography>₹{pricing.subtotal}</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Taxes (12%)" />
                    <Typography>₹{pricing.taxes}</Typography>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Total Amount" />
                    <Typography variant="h6" color="primary">
                      ₹{pricing.totalAmount}
                    </Typography>
                  </ListItem>
                </List>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPricingDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default RoomSelection;