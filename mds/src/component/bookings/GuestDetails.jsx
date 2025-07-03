// components/BookingFlow/steps/GuestDetails.jsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add,
  Remove,
  ExpandMore,
  Person,
  Phone,
  Email,
  Home,
  CreditCard
} from '@mui/icons-material';

const GuestDetails = ({ bookingData, onNext, onBack, onDataChange }) => {
  const [primaryGuest, setPrimaryGuest] = useState(bookingData.primaryGuest || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    idType: 'aadhar',
    idNumber: '',
    dateOfBirth: null
  });

  const [additionalGuests, setAdditionalGuests] = useState(bookingData.additionalGuests || []);
  const [specialRequests, setSpecialRequests] = useState(bookingData.specialRequests || '');
  const [errors, setErrors] = useState({});

  const totalGuests = bookingData.guestCount.adults + bookingData.guestCount.children;
  const additionalGuestsNeeded = Math.max(0, totalGuests - 1);

  const idTypes = [
    { value: 'aadhar', label: 'Aadhar Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'voter_id', label: 'Voter ID' },
    { value: 'pan', label: 'PAN Card' }
  ];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
  };

  const handlePrimaryGuestChange = (field, value) => {
    setPrimaryGuest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdditionalGuestChange = (index, field, value) => {
    const updatedGuests = [...additionalGuests];
    updatedGuests[index] = {
      ...updatedGuests[index],
      [field]: value
    };
    setAdditionalGuests(updatedGuests);
  };

  const addAdditionalGuest = () => {
    if (additionalGuests.length < additionalGuestsNeeded) {
      setAdditionalGuests(prev => [...prev, {
        firstName: '',
        lastName: '',
        age: '',
        idType: 'aadhar',
        idNumber: '',
        relationship: 'family'
      }]);
    }
  };

  const removeAdditionalGuest = (index) => {
    setAdditionalGuests(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate primary guest
    if (!primaryGuest.firstName) newErrors.firstName = 'First name is required';
    if (!primaryGuest.lastName) newErrors.lastName = 'Last name is required';
    if (!primaryGuest.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(primaryGuest.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!primaryGuest.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(primaryGuest.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!primaryGuest.address) newErrors.address = 'Address is required';
    if (!primaryGuest.idNumber) newErrors.idNumber = 'ID number is required';
    if (!primaryGuest.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    // Validate additional guests
    additionalGuests.forEach((guest, index) => {
      if (!guest.firstName) newErrors[`additionalGuest${index}FirstName`] = 'First name is required';
      if (!guest.lastName) newErrors[`additionalGuest${index}LastName`] = 'Last name is required';
      if (!guest.age) newErrors[`additionalGuest${index}Age`] = 'Age is required';
      if (!guest.idNumber) newErrors[`additionalGuest${index}IdNumber`] = 'ID number is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onDataChange({
        primaryGuest,
        additionalGuests,
        specialRequests
      });
      onNext();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Guest Details
        </Typography>
        
        {/* Primary Guest */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1 }} />
              <Typography variant="h6">Primary Guest</Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={primaryGuest.firstName}
                  onChange={(e) => handlePrimaryGuestChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={primaryGuest.lastName}
                  onChange={(e) => handlePrimaryGuestChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={primaryGuest.email}
                  onChange={(e) => handlePrimaryGuestChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={primaryGuest.phone}
                  onChange={(e) => handlePrimaryGuestChange('phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={primaryGuest.address}
                  onChange={(e) => handlePrimaryGuestChange('address', e.target.value)}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                  InputProps={{
                    startAdornment: <Home sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>ID Type</InputLabel>
                  <Select
                    value={primaryGuest.idType}
                    onChange={(e) => handlePrimaryGuestChange('idType', e.target.value)}
                    label="ID Type"
                    startAdornment={<CreditCard sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    {idTypes.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ID Number"
                  value={primaryGuest.idNumber}
                  onChange={(e) => handlePrimaryGuestChange('idNumber', e.target.value)}
                  error={!!errors.idNumber}
                  helperText={errors.idNumber}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Date of Birth"
                  value={primaryGuest.dateOfBirth}
                  onChange={(date) => handlePrimaryGuestChange('dateOfBirth', date)}
                  maxDate={new Date()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth}
                      required
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Additional Guests */}
        {additionalGuestsNeeded > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Additional Guests ({additionalGuests.length}/{additionalGuestsNeeded})
                </Typography>
                // components/BookingFlow/steps/GuestDetails.jsx (continuation)
              <Button
                startIcon={<Add />}
                onClick={addAdditionalGuest}
                disabled={additionalGuests.length >= additionalGuestsNeeded}
                variant="outlined"
                size="small"
              >
                Add Guest
              </Button>
            </Box>

            {additionalGuests.map((guest, index) => (
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>
                    Guest {index + 1} - {guest.firstName} {guest.lastName}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={guest.firstName}
                        onChange={(e) => handleAdditionalGuestChange(index, 'firstName', e.target.value)}
                        error={!!errors[`additionalGuest${index}FirstName`]}
                        helperText={errors[`additionalGuest${index}FirstName`]}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={guest.lastName}
                        onChange={(e) => handleAdditionalGuestChange(index, 'lastName', e.target.value)}
                        error={!!errors[`additionalGuest${index}LastName`]}
                        helperText={errors[`additionalGuest${index}LastName`]}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Age"
                        type="number"
                        value={guest.age}
                        onChange={(e) => handleAdditionalGuestChange(index, 'age', e.target.value)}
                        error={!!errors[`additionalGuest${index}Age`]}
                        helperText={errors[`additionalGuest${index}Age`]}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>ID Type</InputLabel>
                        <Select
                          value={guest.idType}
                          onChange={(e) => handleAdditionalGuestChange(index, 'idType', e.target.value)}
                          label="ID Type"
                        >
                          {idTypes.map(type => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="ID Number"
                        value={guest.idNumber}
                        onChange={(e) => handleAdditionalGuestChange(index, 'idNumber', e.target.value)}
                        error={!!errors[`additionalGuest${index}IdNumber`]}
                        helperText={errors[`additionalGuest${index}IdNumber`]}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Relationship</InputLabel>
                        <Select
                          value={guest.relationship}
                          onChange={(e) => handleAdditionalGuestChange(index, 'relationship', e.target.value)}
                          label="Relationship"
                        >
                          <MenuItem value="family">Family</MenuItem>
                          <MenuItem value="friend">Friend</MenuItem>
                          <MenuItem value="colleague">Colleague</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          onClick={() => removeAdditionalGuest(index)}
                          color="error"
                          size="small"
                        >
                          <Remove />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
            
            {additionalGuestsNeeded > additionalGuests.length && (
              <Alert severity="info" sx={{ mt: 2 }}>
                You need to add {additionalGuestsNeeded - additionalGuests.length} more guest(s) based on your selection.
              </Alert>
            )}
          </CardContent>
        </Card>
        )}

        {/* Special Requests */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Special Requests
            </Typography>
            <TextField
              fullWidth
              label="Special Requests (Optional)"
              multiline
              rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests or preferences..."
            />
          </CardContent>
        </Card>

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
            onClick={handleNext}
            size="large"
          >
            Next
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default GuestDetails;