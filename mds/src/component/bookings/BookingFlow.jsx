// components/BookingFlow/BookingFlow.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Fade,
  Backdrop,
  CircularProgress
} from '@mui/material';
import { createBooking, clearBookingError } from '@/redux/features/bookings/bookingSlice';
import RoomSelection from './RoomSelection';
import GuestDetails from './GuestDetails';
import PaymentDetails from './PaymentDetails';
import BookingConfirmation from './BookingConfirmation';
import BookingReview from './BookingReview';

const steps = ['Select Room', 'Guest Details', 'Review Booking', 'Payment', 'Confirmation'];

const BookingFlow = ({ selectedProperty, selectedRoom, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  
  const { isCreating, error, currentBooking } = useSelector(state => state.booking);
  
   const [activeStep, setActiveStep] = useState(selectedRoom ? 1 : 0); // Skip room selection if room already selected
  const [bookingData, setBookingData] = useState({
    propertyId: selectedProperty?._id,
    roomId: selectedRoom?._id || null,
    primaryGuest: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      idType: '',
      idNumber: '',
      dateOfBirth: null
    },
    additionalGuests: [],
    checkIn: null,
    checkOut: null,
    guestCount: {
      adults: 1,
      children: 0
    },
    specialRequests: '',
    paymentMethod: 'cash',
    paidAmount: 0,
    source: 'walk-in'
  });

  useEffect(() => {
    if (error) {
      // Handle error display
      console.error('Booking error:', error);
    }
  }, [error]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepData = (stepData) => {
    setBookingData(prev => ({ ...prev, ...stepData }));
  };

  const handleSubmitBooking = async (paymentData) => {
    const finalBookingData = {
      ...bookingData,
      ...paymentData
    };

    try {
      await dispatch(createBooking(finalBookingData)).unwrap();
      handleNext(); // Move to confirmation step
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <RoomSelection
            property={selectedProperty}
            bookingData={bookingData}
            onNext={handleNext}
            onDataChange={handleStepData}
          />
        );
      case 1:
        return (
          <GuestDetails
            bookingData={bookingData}
            onNext={handleNext}
            onBack={handleBack}
            onDataChange={handleStepData}
          />
        );
      case 2:
        return (
          <BookingReview
            property={selectedProperty}
            bookingData={bookingData}
            onNext={handleNext}
            onBack={handleBack}
            onDataChange={handleStepData}
          />
        );
      case 3:
        return (
          <PaymentDetails
            bookingData={bookingData}
            onBack={handleBack}
            onSubmit={handleSubmitBooking}
            isLoading={isCreating}
          />
        );
      case 4:
        return (
          <BookingConfirmation
            booking={currentBooking}
            property={selectedProperty}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };
    
  return (
    <Box sx={{ width: '100%', mx:"auto", maxWidth: 1200, p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom textAlign="center" color="primary">
          Booking Portal
        </Typography>
        
        <Typography variant="h6" gutterBottom textAlign="center" color="text.secondary">
          {selectedProperty?.placeName}
        </Typography>

        <Stepper 
          activeStep={activeStep} 
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{ mb: 4 }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Fade in={true} timeout={500}>
          <Box sx={{ minHeight: 400 }}>
            {getStepContent(activeStep)}
          </Box>
        </Fade>

        {/* Loading overlay */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isCreating}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Paper>
    </Box>
  );
};

export default BookingFlow;