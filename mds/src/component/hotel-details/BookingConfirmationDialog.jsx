// components/BookingConfirmationDialog.jsx
"use client"
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Divider,
  Alert,
  ThemeProvider,
  createTheme
} from "@mui/material"
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { checkRoomAvailability } from "@/redux/features/rooms/roomSlice"

// Create custom theme with the specified color
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#1035ac',
      light: '#4a63c4',
      dark: '#0b2578',
      contrastText: '#ffffff',
    },
  },
});

const BookingConfirmationDialog = ({ 
  room, 
  property, 
  open, 
  onClose, 
  isLoading = false 
}) => {
  const pathName = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const [bookingDetails, setBookingDetails] = useState({
    checkIn: null,
    checkOut: null,
    adults: 1,
    children: 0
  })
  const [errors, setErrors] = useState({})
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')

    const {  isAuthenticated } = useSelector(
      (state) => state.auth
    );

  // Load data from localStorage on component mount
  useEffect(() => {
    if (open) {
          if (!isAuthenticated) {
      localStorage.setItem("hoteldetailPath", pathName);
    }
    else{
      localStorage.removeItem("hoteldetailPath");
    }
      const lastSearchQuery = localStorage.getItem('lastSearchQuery')
      if (lastSearchQuery) {
        try {
          const searchData = JSON.parse(lastSearchQuery)
          setBookingDetails(prev => ({
            ...prev,
            checkIn: searchData.checkin ? new Date(searchData.checkin) : null,
            checkOut: searchData.checkout ? new Date(searchData.checkout) : null,
            adults: Math.min(parseInt(searchData.persons) || 1, room?.occupancy?.maximumAdults || 4),
            children: 0
          }))
        } catch (error) {
          console.error('Error parsing search query:', error)
        }
      }
    }
  }, [open, room])

  const validateBookingDetails = () => {
    const newErrors = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!bookingDetails.checkIn) {
      newErrors.checkIn = 'Check-in date is required'
    } else if (bookingDetails.checkIn < today) {
      newErrors.checkIn = 'Check-in date cannot be in the past'
    }

    if (!bookingDetails.checkOut) {
      newErrors.checkOut = 'Check-out date is required'
    } else if (bookingDetails.checkOut <= bookingDetails.checkIn) {
      newErrors.checkOut = 'Check-out date must be after check-in date'
    }

    const totalGuests = bookingDetails.adults + bookingDetails.children
    if (room && totalGuests > room?.occupancy?.maximumOccupancy) {
      newErrors.guests = `Maximum ${room?.occupancy?.maximumOccupancy} guests allowed`
    }

    if (room && bookingDetails.adults > room?.occupancy?.maximumAdults) {
      newErrors.adults = `Maximum ${room?.occupancy?.maximumAdults} adults allowed`
    }

    if (room && bookingDetails.children > room?.occupancy?.maximumChildren) {
      newErrors.children = `Maximum ${room?.occupancy?.maximumChildren} children allowed`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkAvailability = async () => {
    try {
      setAvailabilityLoading(true)
      setAvailabilityError('')
      
      const result = await dispatch(checkRoomAvailability({ 
        roomId: room._id, 
        startDate: bookingDetails.checkIn.toISOString().split('T')[0], 
        endDate: bookingDetails.checkOut.toISOString().split('T')[0]
      })).unwrap()
      
      return result.data
    } catch (error) {
      console.error('Failed to check availability:', error)
      setAvailabilityError('Failed to check room availability. Please try again.')
      return null
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!isAuthenticated) {
    onClose()
    router.push('/login')
    return
  }
    if (!validateBookingDetails()) return

    // Check room availability first
    const availabilityResult = await checkAvailability()
    if (!availabilityResult) {
      return // Error already handled in checkAvailability
    }

    console.log(availabilityResult)

    if (!availabilityResult.available) {
      setAvailabilityError('Room is not available for the selected dates. Please choose different dates.')
      return
    }

    try {
      // Update lastSearchQuery with new booking details
      const updatedSearchQuery = {
        checkin: bookingDetails.checkIn.toISOString().split('T')[0],
        checkout: bookingDetails.checkOut.toISOString().split('T')[0],
        persons: bookingDetails.adults.toString(),
        children: bookingDetails.children.toString(),
        location: property.location?.city || '',
        propertyId: property._id,
        roomId: room._id
      }
      
      localStorage.setItem('lastSearchQuery', JSON.stringify(updatedSearchQuery))
      localStorage.setItem('selectedRoom', JSON.stringify(room))
      localStorage.setItem('selectedProperty', JSON.stringify(property))
      
      // Navigate to booking page
      const queryParams = new URLSearchParams({
        room: room._id,
        checkIn: bookingDetails.checkIn.toISOString().split('T')[0],
        checkOut: bookingDetails.checkOut.toISOString().split('T')[0],
        adults: bookingDetails.adults.toString(),
        children: bookingDetails.children.toString()
      })
      
      router.push(`/booking/${property._id}?${queryParams.toString()}`)
      
    } catch (error) {
      console.error('Booking confirmation failed:', error)
      toast.error('Failed to process booking. Please try again.')
    }
  }

  const calculateTotalPrice = () => {
    if (!room || !bookingDetails.checkIn || !bookingDetails.checkOut) return 0
    
    const totalDays = Math.ceil((bookingDetails.checkOut - bookingDetails.checkIn) / (1000 * 60 * 60 * 24))
    
    const baseAdults = room.occupancy?.baseAdults || 1
    const extraAdults = Math.max(0, bookingDetails.adults - baseAdults)
    
    const dailyRate = room.pricing.baseAdultsCharge + 
                     (extraAdults * (room.pricing.extraAdultsCharge || 0)) + 
                     (bookingDetails.children * (room.pricing.childCharge || 0))
    
    return dailyRate * totalDays
  }

  const calculateNights = () => {
    if (!bookingDetails.checkIn || !bookingDetails.checkOut) return 0
    return Math.ceil((bookingDetails.checkOut - bookingDetails.checkIn) / (1000 * 60 * 60 * 24))
  }

  if (!room || !property) return null

  return (
    <ThemeProvider theme={customTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog 
          open={open} 
          onClose={onClose} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                Confirm Your Booking
              </Typography>
              <IconButton 
                onClick={onClose} 
                disabled={isLoading || availabilityLoading}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'error.light', 
                    color: 'white' 
                  } 
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            {!isAuthenticated && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Please login to continue with your booking
              </Alert>
            )}
            {availabilityError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {availabilityError}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Property & Room Summary */}
              <Grid item size={{xs:12}}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                }}>
                  <Box display="flex" alignItems="start" gap={2}>
                    <LocationOnIcon sx={{ color: 'primary.main', mt: 0.5, fontSize: 28 }} />
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
                        {property.placeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {property.location?.city}, {property.location?.state}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <HomeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="body1" fontWeight="medium">
                          {room.roomName}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" gap={3} mt={1} flexWrap="wrap">
                        <Typography variant="body2" color="text.secondary">
                          Size: {room.roomSize} {room.sizeUnit}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Max: {room.occupancy.maximumAdults}A, {room.occupancy.maximumChildren}C
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Booking Details Form */}
              <Grid item size={{xs:12}}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}>
                  <CalendarTodayIcon sx={{ color: 'primary.main' }} />
                  Booking Details
                </Typography>
                
                <Grid container spacing={2}>
                  {/* Date Selection with DatePicker */}
                  <Grid item size={{xs:12,sm:6}}>
                    <DatePicker
                      label="Check-in Date"
                      value={bookingDetails.checkIn}
                      onChange={(newValue) => setBookingDetails({ ...bookingDetails, checkIn: newValue })}
                      minDate={new Date()}
                      disabled={isLoading || availabilityLoading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.checkIn,
                          helperText: errors.checkIn,
                          sx: {
                            '& .MuiInputBase-root': {
                              borderRadius: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 500
                            }
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item size={{xs:12,sm:6}}>
                    <DatePicker
                      label="Check-out Date"
                      value={bookingDetails.checkOut}
                      onChange={(newValue) => setBookingDetails({ ...bookingDetails, checkOut: newValue })}
                      minDate={bookingDetails.checkIn || new Date()}
                      disabled={isLoading || availabilityLoading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.checkOut,
                          helperText: errors.checkOut,
                          sx: {
                            '& .MuiInputBase-root': {
                              borderRadius: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 500
                            }
                          }
                        }
                      }}
                    />
                  </Grid>

                  {/* Guest Selection with improved styling */}
                  <Grid item size={{xs:12,sm:6}}>
                    <FormControl fullWidth error={!!errors.adults}>
                      <InputLabel sx={{ fontWeight: 500 }}>Adults</InputLabel>
                      <Select
                        value={bookingDetails.adults}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, adults: e.target.value })}
                        label="Adults"
                        disabled={isLoading || availabilityLoading}
                        sx={{ 
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        {[...Array(room.occupancy.maximumAdults)].map((_, i) => (
                          <MenuItem key={i + 1} value={i + 1}>
                            {i + 1} Adult{i > 0 ? 's' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.adults && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                          {errors.adults}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item size={{xs:12,sm:6}}>
                    <FormControl fullWidth error={!!errors.children}>
                      <InputLabel sx={{ fontWeight: 500 }}>Children</InputLabel>
                      <Select
                        value={bookingDetails.children}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, children: e.target.value })}
                        label="Children"
                        disabled={isLoading || availabilityLoading}
                        sx={{ 
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        {[...Array(room.occupancy.maximumChildren + 1)].map((_, i) => (
                          <MenuItem key={i} value={i}>
                            {i} {i === 1 ? 'Child' : 'Children'}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.children && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                          {errors.children}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>

                {errors.guests && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {errors.guests}
                  </Typography>
                )}
              </Grid>

              {/* Price Summary with enhanced styling */}
              {bookingDetails.checkIn && bookingDetails.checkOut && (
                <Grid item size={{xs:12}}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    // background: `linear-gradient(135deg, ${customTheme.palette.primary.main} 0%, ${customTheme.palette.primary.dark} 100%)`,
                    color: `${customTheme.palette.primary.main}`,
                    boxShadow: `0 10px 30px ${customTheme.palette.primary.main}40`
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      fontWeight: 'bold'
                    }}>
                      <PeopleAltIcon />
                      Booking Summary
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body1">
                        {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                      </Typography>
                      <Typography variant="body1">
                        ₹{room.pricing.baseAdultsCharge} × {calculateNights()}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {bookingDetails.adults} adult{bookingDetails.adults > 1 ? 's' : ''} • {bookingDetails.children} children
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight="bold">
                        Total Amount:
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        ₹{calculateTotalPrice()}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Action Buttons with enhanced styling */}
              <Grid item size={{xs:12}}>
                <Box display="flex" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    fullWidth
                    disabled={isLoading || availabilityLoading}
                    sx={{ 
                      borderRadius: 3, 
                      py: 1.5,
                      fontWeight: 600,
                      borderWidth: 2,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.light',
                        color: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleConfirm}
                    fullWidth
                    disabled={isLoading || availabilityLoading}
                    sx={{ 
                      borderRadius: 3, 
                      py: 1.5,
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${customTheme.palette.primary.main} 0%, ${customTheme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${customTheme.palette.primary.light} 0%, ${customTheme.palette.primary.main} 100%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 10px 30px ${customTheme.palette.primary.main}66`
                      }
                    }}
                  >
                    {availabilityLoading ? 'Checking Availability...' : isLoading ? 'Processing...' : !isAuthenticated ? 'Login to Continue' : 'Confirm & Continue'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default BookingConfirmationDialog