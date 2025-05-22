import { 
  TextField, Button, Grid, Typography, 
  FormHelperText, Autocomplete 
} from '@mui/material';
import { useEffect, useState } from 'react';

export default function LocationForm({ formData, onChange, errors, onSave }) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  
  // In a real app, fetch states from API
  useEffect(() => {
    // Mock states data
    setStates(['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu']);
  }, []);
  
  // Fetch cities when state changes
  useEffect(() => {
    if (formData.state) {
      // Mock cities data based on state
      const stateCities = {
        'Delhi': ['New Delhi', 'Gurgaon'],
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
        'Karnataka': ['Bangalore', 'Mysore'],
        'Tamil Nadu': ['Chennai', 'Coimbatore']
      };
      
      setCities(stateCities[formData.state] || []);
    } else {
      setCities([]);
    }
  }, [formData.state]);

  return (
    <div>
      <Typography variant="h5" gutterBottom>Property Location</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Country"
            value={formData.country || ''}
            onChange={(e) => onChange('country', e.target.value)}
            error={!!errors.country}
            helperText={errors.country}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            value={formData.street || ''}
            onChange={(e) => onChange('street', e.target.value)}
            error={!!errors.street}
            helperText={errors.street}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Room/Suite Number (optional)"
            value={formData.roomNumber || ''}
            onChange={(e) => onChange('roomNumber', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={states}
            value={formData.state || null}
            onChange={(_, newValue) => {
              onChange('state', newValue);
              // Reset city when state changes
              onChange('city', '');
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="State"
                error={!!errors.state}
                helperText={errors.state}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={cities}
            value={formData.city || null}
            onChange={(_, newValue) => onChange('city', newValue)}
            disabled={!formData.state}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="City"
                error={!!errors.city}
                helperText={errors.city}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Postal Code"
            value={formData.postalCode || ''}
            onChange={(e) => onChange('postalCode', e.target.value)}
            error={!!errors.postalCode}
            helperText={errors.postalCode}
          />
        </Grid>
        
        <Grid item xs={12} className="flex justify-end mt-4">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onSave}
          >
            Save & Continue
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}