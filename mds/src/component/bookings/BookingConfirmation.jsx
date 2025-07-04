// components/BookingFlow/steps/BookingConfirmation.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Grid,
  Divider,
  Chip,
  Paper,
  Stack
} from '@mui/material';
import {
  CheckCircle,
  Download,
  Email,
  Print,
  Share,
  CalendarToday,
  Person,
  Hotel,
  Payment,
  Close
} from '@mui/icons-material';
import { format } from 'date-fns';

const BookingConfirmation = ({ booking, property, onClose }) => {
  const handleDownloadReceipt = () => {
    // Implement PDF generation logic
    console.log('Download receipt for booking:', booking.bookingId);
  };

  const handleEmailReceipt = () => {
    // Implement email sending logic
    console.log('Email receipt for booking:', booking.bookingId);
  };

  const handlePrintReceipt = () => {
    // Implement print logic
    window.print();
  };

  const handleShareBooking = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Booking Confirmation',
        text: `Booking confirmed for ${property.placeName}`,
        url: window.location.href
      });
    }
  };

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" color="success.main" gutterBottom>
          Booking Confirmed!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your booking has been successfully created
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Booking Details</Typography>
            <Chip 
              label={booking.status} 
              color="success" 
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Booking Information
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Booking ID:</strong> {booking.bookingId}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Property:</strong> {property.placeName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Check-in:</strong> {format(new Date(booking.checkIn), 'PPP')}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Check-out:</strong> {format(new Date(booking.checkOut), 'PPP')}
                </Typography>
                <Typography variant="body2">
                  <strong>Guests:</strong> {booking.guestCount.adults} Adult{booking.guestCount.adults > 1 ? 's' : ''}
                  {booking.guestCount.children > 0 && 
                    `, ${booking.guestCount.children} Child${booking.guestCount.children > 1 ? 'ren' : ''}`
                  }
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Primary Guest
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Name:</strong> {booking.primaryGuest.firstName} {booking.primaryGuest.lastName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Email:</strong> {booking.primaryGuest.email}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Phone:</strong> {booking.primaryGuest.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>ID:</strong> {booking.primaryGuest.idType} - {booking.primaryGuest.idNumber}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Pricing Breakdown */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Pricing Breakdown
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Base Charge ({booking.pricing.totalDays} nights)</Typography>
                  <Typography variant="body2">₹{booking.pricing.baseCharge}</Typography>
                </Box>
                {booking.pricing.extraAdultCharge > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Extra Adult Charge</Typography>
                    <Typography variant="body2">₹{booking.pricing.extraAdultCharge}</Typography>
                  </Box>
                )}
                {booking.pricing.childCharge > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Child Charge</Typography>
                    <Typography variant="body2">₹{booking.pricing.childCharge}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">₹{booking.pricing.subtotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Taxes & Fees</Typography>
                  <Typography variant="body2">₹{booking.pricing.taxes}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" color="primary">Total Amount</Typography>
                  <Typography variant="h6" color="primary">₹{booking.pricing.totalAmount}</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Payment Method</Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {booking.payment.method}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Paid Amount</Typography>
                  <Typography variant="body2">₹{booking.payment.paidAmount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Pending Amount</Typography>
                  <Typography variant="body2">₹{booking.payment.pendingAmount || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Payment Status</Typography>
                  <Chip 
                    label={booking.payment.status} 
                    color={booking.payment.status === 'completed' ? 'success' : 
                           booking.payment.status === 'partial' ? 'warning' : 'error'}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Special Requests */}
          {booking.specialRequests && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Special Requests
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">{booking.specialRequests}</Typography>
              </Paper>
            </>
          )}

          {/* Additional Guests */}
          {booking.additionalGuests && booking.additionalGuests.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Additional Guests
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                {booking.additionalGuests.map((guest, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{guest.firstName} {guest.lastName}</strong> - {guest.email}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </>
          )}
        </CardContent>
      </Card>

      {/* Important Information */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Please arrive at the property by the check-in time. 
          If you need to modify your booking, please contact us at least 24 hours in advance.
        </Typography>
      </Alert>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownloadReceipt}
          sx={{ minWidth: 150 }}
        >
          Download Receipt
        </Button>
        <Button
          variant="outlined"
          startIcon={<Email />}
          onClick={handleEmailReceipt}
          sx={{ minWidth: 150 }}
        >
          Email Receipt
        </Button>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handlePrintReceipt}
          sx={{ minWidth: 150 }}
        >
          Print Receipt
        </Button>
        <Button
          variant="outlined"
          startIcon={<Share />}
          onClick={handleShareBooking}
          sx={{ minWidth: 150 }}
        >
          Share Booking
        </Button>
      </Stack>

      {/* Close Button */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={onClose}
          startIcon={<Close />}
          sx={{ minWidth: 200 }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default BookingConfirmation;