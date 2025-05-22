import { 
  TextField, FormControl, InputLabel, Select, 
  MenuItem, FormHelperText, Button, Grid, Typography 
} from '@mui/material';

export default function BasicInfoForm({ formData, onChange, errors, onSave }) {
  const propertyTypes = [
    'Hotel', 'Cottage', 'Villa', 'Cabin', 'Farm stay', 'Houseboat', 'Lighthouse'
  ];
  
  const rentalForms = ['Entire place', 'Private room', 'Share room'];

  return (
    <div>
      <Typography variant="h5" gutterBottom>Basic Property Information</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.propertyType}>
            <InputLabel>Property Type</InputLabel>
            <Select
              value={formData.propertyType || ''}
              onChange={(e) => onChange('propertyType', e.target.value)}
              label="Property Type"
            >
              {propertyTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
            {errors.propertyType && <FormHelperText>{errors.propertyType}</FormHelperText>}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Place Name"
            value={formData.placeName || ''}
            onChange={(e) => onChange('placeName', e.target.value)}
            error={!!errors.placeName}
            helperText={errors.placeName}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Place Rating"
            value={formData.placeRating || ''}
            onChange={(e) => onChange('placeRating', e.target.value)}
            error={!!errors.placeRating}
            helperText={errors.placeRating}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Property Built Year"
            value={formData.propertyBuilt || ''}
            onChange={(e) => onChange('propertyBuilt', e.target.value)}
            error={!!errors.propertyBuilt}
            helperText={errors.propertyBuilt}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Booking Since"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.bookingSince || ''}
            onChange={(e) => onChange('bookingSince', e.target.value)}
            error={!!errors.bookingSince}
            helperText={errors.bookingSince}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.rentalForm}>
            <InputLabel>Rental Form</InputLabel>
            <Select
              value={formData.rentalForm || ''}
              onChange={(e) => onChange('rentalForm', e.target.value)}
              label="Rental Form"
            >
              {rentalForms.map(form => (
                <MenuItem key={form} value={form}>{form}</MenuItem>
              ))}
            </Select>
            {errors.rentalForm && <FormHelperText>{errors.rentalForm}</FormHelperText>}
          </FormControl>
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