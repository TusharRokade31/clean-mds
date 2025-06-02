import { 
  TextField, FormControl, InputLabel, Select, 
  MenuItem, FormHelperText, Button, Grid, Typography,
  Alert, CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateBasicInfo } from '@/redux/features/property/propertySlice';
import { useState } from 'react';

export default function BasicInfoForm({ formData, onChange, errors }) {
  const dispatch = useDispatch();
  const { currentProperty, isLoading, error } = useSelector(state => state.property);

  const [localErrors, setLocalErrors] = useState({});

  const propertyTypes = [
    'Hotel', 'Cottage', 'Villa', 'Cabin', 'Farm stay', 'Houseboat', 'Lighthouse'
  ];
  
  const rentalForms = ['Entire place', 'Private room', 'Share room'];
  const yearArray = Array.from({ length: 2026 - 1800 }, (_, i) => 2025 - i);
  const ratingArray = Array.from({ length: 5 }, (_, i) => 5 - i);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData.placeName) newErrors.placeName = 'Place name is required';
    if (!formData.placeRating) newErrors.placeRating = 'Rating is required';
    if (!formData.propertyBuilt) newErrors.propertyBuilt = 'Built year is required';
    if (!formData.bookingSince) newErrors.bookingSince = 'Booking since date is required';
    if (!formData.rentalForm) newErrors.rentalForm = 'Rental form is required';
    
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (currentProperty?._id) {
      const result = await dispatch(updateBasicInfo({
        id: currentProperty._id,
        data: formData
      }));
      
      if (result.type.endsWith('/fulfilled')) {
        // Handle success - maybe show success message or navigate
        
      }
    }
  };

  const displayErrors = { ...errors, ...localErrors };

  return (
    <div>
      <Typography sx={{ mb: 2 }} variant="h5" gutterBottom>
        Basic Property Information
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item size={{xs:12, md:4}}>
          <FormControl fullWidth error={!!displayErrors.propertyType}>
            <InputLabel>Property Type</InputLabel>
            <Select
              value={formData.propertyType || ''}
              onChange={(e) => onChange('propertyType', e.target.value)}
              label="Property Type"
              disabled={isLoading}
            >
              {propertyTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
            {displayErrors.propertyType && (
              <FormHelperText>{displayErrors.propertyType}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Place Name"
            value={formData.placeName || ''}
            onChange={(e) => onChange('placeName', e.target.value)}
            error={!!displayErrors.placeName}
            helperText={displayErrors.placeName}
            disabled={isLoading}
          />
        </Grid>
        
        <Grid item size={{xs:12, md:4}}>
          <FormControl fullWidth error={!!displayErrors.placeRating}>
            <InputLabel>Place Rating</InputLabel>
            <Select
              value={formData.placeRating || ''}
              onChange={(e) => onChange('placeRating', e.target.value)}
              label="Place Rating"
              disabled={isLoading}
            >
              {ratingArray.map(rating => (
                <MenuItem key={rating} value={rating.toString()}>{rating}</MenuItem>
              ))}
            </Select>
            {displayErrors.placeRating && (
              <FormHelperText>{displayErrors.placeRating}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item size={{xs:12, md:4}}>
          <FormControl fullWidth error={!!displayErrors.propertyBuilt}>
            <InputLabel>Property Built Year</InputLabel>
            <Select
              value={formData.propertyBuilt || ''}
              onChange={(e) => onChange('propertyBuilt', e.target.value)}
              label="Property Built Year"
              disabled={isLoading}
            >
              {yearArray.map(year => (
                <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
              ))}
            </Select>
            {displayErrors.propertyBuilt && (
              <FormHelperText>{displayErrors.propertyBuilt}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item size={{xs:12, md:4}}>
          <FormControl fullWidth error={!!displayErrors.bookingSince}>
            <InputLabel>Booking Since</InputLabel>
            <Select
              value={formData.bookingSince || ''}
              onChange={(e) => onChange('bookingSince', e.target.value)}
              label="Booking Since"
              disabled={isLoading}
            >
              {yearArray.map(year => (
                <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
              ))}
            </Select>
            {displayErrors.bookingSince && (
              <FormHelperText>{displayErrors.bookingSince}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item size={{xs:12, md:4}}>
          <FormControl fullWidth error={!!displayErrors.rentalForm}>
            <InputLabel>Rental Form</InputLabel>
            <Select
              value={formData.rentalForm || ''}
              onChange={(e) => onChange('rentalForm', e.target.value)}
              label="Rental Form"
              disabled={isLoading}
            >
              {rentalForms.map(form => (
                <MenuItem key={form} value={form}>{form}</MenuItem>
              ))}
            </Select>
            {displayErrors.rentalForm && (
              <FormHelperText>{displayErrors.rentalForm}</FormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
      
      <Button 
        variant="contained" 
        color="primary" 
        sx={{ mt: 3 }}
        onClick={handleSave}
        disabled={isLoading}
        startIcon={isLoading ? <CircularProgress size={20} /> : null}
      >
        {isLoading ? 'Saving...' : 'Save & Continue'}
      </Button>
    </div>
  );
}