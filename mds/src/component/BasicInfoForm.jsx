import { 
  TextField, FormControl, InputLabel, Select, 
  MenuItem, FormHelperText, Grid, Typography,
  Alert
} from '@mui/material';

export default function BasicInfoForm({ formData, onChange, errors }) {
  const propertyTypes = [
    'Dharamshala (Basic spiritual lodging run by religious trusts or communities)', 'Ashram(Spiritual centers offering meditation/yoga stay with a guru or community)', 'Trust Guest House( Guesthouses owned/operated by temple or religious trusts)', 'Yatri Niwas / Pilgrim Lodge(Budget stays designed for pilgrims by governments or religious orgs)'
  ];
  
  // const rentalForms = ['Entire place', 'Private room', 'Share room'];
  const yearArray = Array.from({ length: 2026 - 1800 }, (_, i) => 2025 - i);
  const ratingArray = Array.from({ length: 5 }, (_, i) => 5 - i);

  return (
    <div>
      <Typography sx={{ mb: 2 }} variant="h5" gutterBottom>
        Basic Property Information
      </Typography>

      <Grid container spacing={3}>
        <Grid item size={{xs:12, md:4}}>
          <FormControl fullWidth error={!!errors?.propertyType}>
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
            {errors?.propertyType && (
              <FormHelperText>{errors.propertyType}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item size={{xs:12, md:4}}>
          <TextField
            fullWidth
            label="Name of the Property"
            value={formData.placeName || ''}
            onChange={(e) => onChange('placeName', e.target.value)}
            error={!!errors?.placeName}
            helperText={errors?.placeName}
          />
        </Grid>
        
        <Grid item size={{xs:12, md:4}}>
          <FormControl fullWidth error={!!errors?.placeRating}>
            <InputLabel>Property Rating</InputLabel>
            <Select
              value={formData.placeRating || ''}
              onChange={(e) => onChange('placeRating', e.target.value)}
              label="Property Rating"
            >
              {ratingArray.map(rating => (
                <MenuItem key={rating} value={rating.toString()}>{rating}</MenuItem>
              ))}
            </Select>
            {errors?.placeRating && (
              <FormHelperText>{errors.placeRating}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item size={{xs:12, md:4}}>
          <FormControl fullWidth error={!!errors?.propertyBuilt}>
            <InputLabel>When was the property built?</InputLabel>
            <Select
              value={formData.propertyBuilt || ''}
              onChange={(e) => onChange('propertyBuilt', e.target.value)}
              label="When was the property built?"
            >
              {yearArray.map(year => (
                <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
              ))}
            </Select>
            {errors?.propertyBuilt && (
              <FormHelperText>{errors.propertyBuilt}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item size={{xs:12, md:4}}>
          <FormControl fullWidth error={!!errors?.bookingSince}>
            <InputLabel>Accepting booking since?</InputLabel>
            <Select
              value={formData.bookingSince || ''}
              onChange={(e) => onChange('bookingSince', e.target.value)}
              label="Accepting booking since?"
            >
              {yearArray.map(year => (
                <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
              ))}
            </Select>
            {errors?.bookingSince && (
              <FormHelperText>{errors.bookingSince}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        {/* <Grid item size={{xs:12, md:4}}>
          <FormControl fullWidth error={!!errors?.rentalForm}>
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
            {errors?.rentalForm && (
              <FormHelperText>{errors.rentalForm}</FormHelperText>
            )}
          </FormControl>
        </Grid> */}
      </Grid>
    </div>
  );
}