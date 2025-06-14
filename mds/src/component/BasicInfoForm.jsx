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
      <p className='text-2xl font-bold'>
        Property Details
      </p>
       <p>
        Update your property details here
      </p>

      <Grid sx={{ mt: 5 }} container spacing={3}>
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
        
        {/* <Grid item size={{xs:12, md:4}}>
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
        </Grid> */}
        
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
        <Grid item size={{xs:12, md:4}}>

        </Grid>
        
        

<div className='mt-5'>
  <p className='text-2xl font-bold'>
        Contact details to be shared with guests
      </p>
        <p>
        These contact details will be shared with the guests when they make a booking
      </p>
       <Grid container sx={{mt:3}} spacing={3}>

        <Grid item sx={{xs:12, md:6}}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            error={!!errors.email}
            placeholder=""
          />
        </Grid>
        
        <Grid item sx={{xs:12, md:6}}>
          <TextField
            fullWidth
            label="Mobile Number"
            value={formData.mobileNumber}
            onChange={(e) => onChange('mobileNumber', e.target.value)}
            error={!!errors.mobileNumber}
            // helperText={errors.mobileNumber || 'Enter 10 digit mobile number'}

            placeholder=""
            inputProps={{
              maxLength: 10,
              pattern: '[0-9]*',
              inputMode: 'numeric'
            }}
          />
        </Grid>
        
        <Grid item sx={{xs:12, md:6}}>
          <TextField
            fullWidth
            label="Landline (Optional)"
            value={formData.landline}
            onChange={(e) => onChange('landline', e.target.value)}
            error={!!errors.landline}
            helperText={errors.landline}
            placeholder=""
            inputProps={{
              maxLength: 11,
              pattern: '[0-9]*',
              inputMode: 'numeric'
            }}
          />
        </Grid>

          {/* <Grid item size={{xs:12, md:6}}>
         <TextField
            fullWidth
            label="Email ID"
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            error={!!errors?.email}
            helperText={errors?.email}
          />
        </Grid>

        <Grid item size={{xs:12, md:6}}>
         <TextField
           type="number"
            fullWidth
            label="Mobile Number"
            value={formData.mobileNumber || ''}
            onChange={(e) => onChange('mobileNumber', e.target.value)}
            error={!!errors?.mobileNumber}
            helperText={errors?.mobileNumber}
          />
        </Grid> */}
        </Grid>
</div>
        

        
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