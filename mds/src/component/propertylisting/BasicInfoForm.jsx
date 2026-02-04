import { useEffect, useState } from 'react';
import { 
  TextField, FormControl, InputLabel, Select, 
  MenuItem, FormHelperText, Grid, Typography,
  Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { checkEmailVerificationStatus, sendEmailOTP, verifyEmailOTP } from '@/redux/features/property/propertySlice';
export default function BasicInfoForm({ formData, onChange, errors, propertyId, onEmailVerified }) {
  const dispatch = useDispatch();
   const { isLoading, error, currentProperty } = useSelector(state => state.property);
  
  
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState('');
   const [emailForVerification, setEmailForVerification] = useState('');

  // Check verification status when component mounts or propertyId changes
  useEffect(() => {
    if (propertyId) {
      dispatch(checkEmailVerificationStatus(propertyId));
    }
  }, [propertyId, dispatch]);

  // Check if current property email is verified
  const isCurrentEmailVerified = currentProperty?.emailVerified && 
                                 currentProperty?.email === formData.email;

  const handleSendOTP = async () => {
    if (!formData.email) {
      alert('Please enter email address first');
      return;
    }
    
    setEmailForVerification(formData.email);
    console.log(propertyId, "")
    try {
      await dispatch(sendEmailOTP({ 
        propertyId, 
        email: formData.email 
      })).unwrap();
      setShowOTPDialog(true);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

   const handleVerifyOTP = async () => {
    try {
      await dispatch(verifyEmailOTP({ 
        propertyId, 
        email: emailForVerification, 
        otp 
      })).unwrap();
      
      setShowOTPDialog(false);
      setOtp('');
      
      // Call the callback to update basic info in parent component
      if (onEmailVerified) {
        await onEmailVerified();
      }
      
      alert('Email verified successfully!');
    } catch (error) {
      console.error('Failed to verify OTP:', error);
    }
  };

  const propertyTypes = [
    'Dharamshala', 'Ashram(Spiritual centers offering meditation/yoga stay with a guru or community)', 'Trust Guest House( Guesthouses owned/operated by temple or religious trusts)', 'Yatri Niwas / Pilgrim Lodge(Budget stays designed for pilgrims by governments or religious orgs)'
  ];
  
  // const rentalForms = ['Entire place', 'Private room', 'Share room'];

  const ratingArray = Array.from({ length: 5 }, (_, i) => 5 - i);


  // 1. Base array of years
const currentYear = new Date().getFullYear();
const baseYears = Array.from({ length: currentYear - 1800 + 1 }, (_, i) => currentYear - i);

// 2. Filtered years for "Property Built" 
// (Should only show years up to the "Booking Since" year, if selected)
const builtYearOptions = formData.bookingSince 
  ? baseYears.filter(year => year <= parseInt(formData.bookingSince))
  : baseYears;

// 3. Filtered years for "Accepting Booking Since" 
// (Should only show years from the "Property Built" year onwards)
const bookingYearOptions = formData.propertyBuilt 
  ? baseYears.filter(year => year >= parseInt(formData.propertyBuilt))
  : baseYears;

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
          <FormControl 
                     
            sx={{
              "& .MuiOutlinedInput-root": {

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }} 
            fullWidth error={!!errors?.propertyType}>
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
                     
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}
            fullWidth
            label="Name of the Property"
            value={formData.placeName || ''}
            onChange={(e) => onChange('placeName', e.target.value)}
            error={!!errors?.placeName}
            helperText={errors?.placeName}
          />
        </Grid>
        
        
        <Grid item size={{xs:12, md:4}}>
          <FormControl            
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }} fullWidth error={!!errors?.propertyBuilt}>
            <InputLabel>When was the property built?</InputLabel>
           <Select
            value={formData.propertyBuilt || ''}
            onChange={(e) => onChange('propertyBuilt', e.target.value)}
            label="When was the property built?"
          >
            {builtYearOptions.map(year => (
              <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
            ))}
          </Select>
            {errors?.propertyBuilt && (
              <FormHelperText>{errors.propertyBuilt}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item size={{xs:12, md:4}}>
          <FormControl            
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }} fullWidth error={!!errors?.bookingSince}>
            <InputLabel>Accepting booking since?</InputLabel>
            <Select
              value={formData.bookingSince || ''}
              onChange={(e) => onChange('bookingSince', e.target.value)}
              label="Accepting booking since?"
            >
              {bookingYearOptions.map(year => (
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <TextField
            sx={{ flex: 1 /* your existing styles */ }}
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            error={!!errors.email}
            placeholder=""
          />
          <Button 
            variant="outlined" 
            onClick={handleSendOTP}
            disabled={isLoading || !formData.email || isCurrentEmailVerified}
            style={{ height: '56px', minWidth: '120px' }}
          >
            {isCurrentEmailVerified ? 'Verified ✓' : 'Verify Email'}
          </Button>
        </div>
        {isCurrentEmailVerified && (
          <Alert severity="success" sx={{ mt: 1 }}>
            Email verified successfully!
          </Alert>
        )}
      </Grid>

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} >
        <DialogTitle>Email Verification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            We've sent a 6-digit OTP to {emailForVerification}
          </Typography>
          <TextField
            fullWidth
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputProps={{ maxLength: 6, inputMode: 'numeric' }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOTPDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleVerifyOTP}
            disabled={isLoading || otp.length !== 6}
            variant="contained"
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
        
        <Grid item sx={{xs:12, md:6}}>
          <TextField
                     
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}
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
                     
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}
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
        </Grid>
      </div>
      </Grid>
    </div>
  );
}