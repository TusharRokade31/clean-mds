// components/BookingFlow/steps/BookingReview.jsx
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Alert
} from '@mui/material';
import {
  CalendarToday,
  Person,
  Hotel,
  Payment,
  LocationOn,
  Phone,
  Email
} from '@mui/icons-material';
import { format } from 'date-fns';

const BookingReview = ({ property, bookingData, onNext, onBack, onDataChange }) => {
  console.log(property)
  const calculatePricing = () => {
    // This should match your backend pricing calculation
    const room = property.rooms.find(r => r._id === bookingData.roomId);
    if (!room) return { totalAmount: 0, subtotal: 0, taxes: 0 };

    const { adults, children } = bookingData.guestCount;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const totalDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const baseCharge = room.pricing.baseAdultsCharge;
    const extraAdults = Math.max(0, adults - room.occupancy.baseAdults);
    const extraAdultCharge = extraAdults * room.pricing.extraAdultsCharge;
    const childCharge = children * room.pricing.childCharge;

    const dailyRate = baseCharge + extraAdultCharge + childCharge;
    const subtotal = dailyRate * totalDays;
    const taxes = subtotal * 0.12; // 12% GST
    const totalAmount = subtotal + taxes;

    return {
      baseCharge: baseCharge * totalDays,
      extraAdultCharge: extraAdultCharge * totalDays,
      childCharge: childCharge * totalDays,
      totalDays,
      subtotal,
      taxes,
      totalAmount
    };
  };

  const pricing = calculatePricing();
  const room = property.rooms.find(r => r._id === bookingData.roomId);
  console.log(room)

  const handleConfirm = () => {
    onDataChange({ pricing });
    onNext();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Booking
      </Typography>

      <Grid container spacing={3}>
        {/* Property & Room Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Hotel sx={{ mr: 1 }} />
                <Typography variant="h6">Property & Room Details</Typography>
              </Box>
              
              <Typography variant="h5" color="primary" gutterBottom>
                {property.placeName}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                <Typography variant="body2" color="text.secondary">
                  {property.location.city}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                {room?.roomName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {room?.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={`Max ${room?.occupancy?.maximumOccupancy} Guests`} 
                  size="small" 
                  variant="outlined" 
                />
                <Chip 
                  label={`${room?.amenities.length} Amenities`} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Amenities:
              </Typography>
              {/* <Typography variant="body2" color="text.secondary">
                {room?.amenities?.join(', ')}
              </Typography> */}
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ mr: 1 }} />
                <Typography variant="h6">Booking Details</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Check-in Date</Typography>
                  <Typography variant="body1">
                    {format(new Date(bookingData.checkIn), 'PPP')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Check-out Date</Typography>
                  <Typography variant="body1">
                    {format(new Date(bookingData.checkOut), 'PPP')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Duration</Typography>
                  <Typography variant="body1">
                    {pricing.totalDays} night{pricing.totalDays > 1 ? 's' : ''}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Guests</Typography>
                  <Typography variant="body1">
                    {bookingData.guestCount.adults} Adult{bookingData.guestCount.adults > 1 ? 's' : ''}
                    {bookingData.guestCount.children > 0 && 
                      `, ${bookingData.guestCount.children} Child${bookingData.guestCount.children > 1 ? 'ren' : ''}`
                    }
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Guest Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1 }} />
                <Typography variant="h6">Guest Details</Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Primary Guest
              </Typography>
              <Typography variant="body1">
                {bookingData.primaryGuest.firstName} {bookingData.primaryGuest.lastName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">{bookingData.primaryGuest.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">{bookingData.primaryGuest.phone}</Typography>
              </Box>

              {bookingData.additionalGuests.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Additional Guests
                  </Typography>
                  <List dense>
                    {bookingData.additionalGuests.map((guest, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText
                          primary={`${guest.firstName} ${guest.lastName}`}
                          secondary={`Age: ${guest.age}, ${guest.relationship}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {bookingData.specialRequests && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Special Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {bookingData.specialRequests}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pricing Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Payment sx={{ mr: 1 }} />
                <Typography variant="h6">Pricing Summary</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Base charge ({pricing.totalDays} nights)</Typography>
                  <Typography variant="body2">₹{pricing.baseCharge.toLocaleString()}</Typography>
                </Box>
                
                {pricing.extraAdultCharge > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Extra adult charges</Typography>
                    <Typography variant="body2">₹{pricing.extraAdultCharge.toLocaleString()}</Typography>
                  </Box>
                )}
                
                {pricing.childCharge > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Child charges</Typography>
                    <Typography variant="body2">₹{pricing.childCharge.toLocaleString()}</Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">₹{pricing.subtotal.toLocaleString()}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Taxes & fees (12%)</Typography>
                  <Typography variant="body2">₹{pricing.taxes.toLocaleString()}</Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total Amount</Typography>
                  <Typography variant="h6" color="primary">
                    ₹{pricing.totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                Please review all details carefully before proceeding to payment.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          size="large"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          size="large"
        >
          Proceed to Payment
        </Button>
      </Box>
    </Box>
  );
};

export default BookingReview;