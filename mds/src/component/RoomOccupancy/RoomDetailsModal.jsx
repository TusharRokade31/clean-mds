// components/RoomOccupancy/RoomDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import {
  Close,
  Person,
  Phone,
  Email,
  CalendarToday,
  Bed,
  Shower,
  Restaurant,
  Wifi,
  Tv,
  AcUnit,
  LocalParking,
  FitnessCenter,
  Pool,
  Spa,
  Business,
  RoomService,
  Kitchen,
  Balcony,
  PeopleAlt,
  SquareFoot,
  AttachMoney,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const RoomDetailsModal = ({ 
  open, 
  onClose, 
  room, 
  onCheckAvailability,
  onUpdateStatus,
  bookingDetails = null 
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
  };

  const handleCheckAvailability = async () => {
    if (selectedDates.length === 2) {
      setChecking(true);
      try {
        const result = await onCheckAvailability(
          room._id,
          selectedDates[0].toISOString(),
          selectedDates[1].toISOString()
        );
        setAvailabilityResult(result);
      } catch (error) {
        console.error('Error checking availability:', error);
      } finally {
        setChecking(false);
      }
    }
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'WiFi': <Wifi />,
      'TV': <Tv />,
      'AC': <AcUnit />,
      'Parking': <LocalParking />,
      'Gym': <FitnessCenter />,
      'Pool': <Pool />,
      'Spa': <Spa />,
      'Business': <Business />,
      'Room Service': <RoomService />,
      'Kitchen': <Kitchen />,
      'Balcony': <Balcony />
    };
    return iconMap[amenity] || <CheckCircle />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'booked': return 'warning';
      case 'maintenance': return 'error';
      default: return 'default';
    }
  };

  if (!room) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h5" component="span">
            {room.roomName}
          </Typography>
          <Chip 
            label={room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            color={getStatusColor(room.status)}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Room Details" />
            <Tab label="Availability" />
            {room.status === 'booked' && <Tab label="Guest Details" />}
          </Tabs>
        </Box>

        {/* Room Details Tab */}
        {selectedTab === 0 && (
          <Grid container spacing={3}>
            {/* Room Images */}
            <Grid item size={{xs:12,    md:6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Room Images</Typography>
                  <Grid container spacing={1}>
                    {room.media.images.map((image, index) => (
                      <Grid item xs={6} key={index}>
                        <Box
                          component="img"
                          src={`${image.url}`}
                          alt={`Room ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0'
                          }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {image.tags.join(', ')}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Room Information */}
            <Grid item size={{xs:12,    md:6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Room Information</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><SquareFoot /></ListItemIcon>
                      <ListItemText 
                        primary="Room Size" 
                        secondary={`${room.roomSize} ${room.sizeUnit}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PeopleAlt /></ListItemIcon>
                      <ListItemText 
                        primary="Occupancy" 
                        secondary={`${room.occupancy.baseAdults} base adults, max ${room.occupancy.maximumAdults} adults, ${room.occupancy.maximumChildren} children`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Bed /></ListItemIcon>
                      <ListItemText 
                        primary="Beds" 
                        secondary={room.beds.map(bed => `${bed.count} ${bed.bedType}`).join(', ')} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Shower /></ListItemIcon>
                      <ListItemText 
                        primary="Bathrooms" 
                        secondary={`${room.bathrooms.count} ${room.bathrooms.private ? 'private' : 'shared'} bathroom${room.bathrooms.count > 1 ? 's' : ''}`} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Pricing */}
            <Grid item size={{xs:12,    md:6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Pricing</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><AttachMoney /></ListItemIcon>
                      <ListItemText 
                        primary="Base Adults Charge" 
                        secondary={formatCurrency(room.pricing.baseAdultsCharge)} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AttachMoney /></ListItemIcon>
                      <ListItemText 
                        primary="Extra Adults Charge" 
                        secondary={formatCurrency(room.pricing.extraAdultsCharge)} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AttachMoney /></ListItemIcon>
                      <ListItemText 
                        primary="Child Charge" 
                        secondary={formatCurrency(room.pricing.childCharge)} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Description */}
            <Grid item size={{xs:12,    md:6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {room.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Amenities */}
            {room.amenities && Object.keys(room.amenities).length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Amenities</Typography>
                    <Grid container spacing={1}>
                      {Object.entries(room.amenities).map(([key, value]) => (
                        <Grid item key={key}>
                          <Chip
                            icon={getAmenityIcon(key)}
                            label={key}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {/* Availability Tab */}
        {selectedTab === 1 && (
          <Grid container spacing={3}>
            <Grid item size={{xs:12,    md:6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Check Availability</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Calendar
                      selectRange={true}
                      onChange={handleDateChange}
                      value={selectedDates}
                      minDate={new Date()}
                      className="react-calendar"
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleCheckAvailability}
                      disabled={checking || selectedDates.length !== 2}
                    >
                      {checking ? 'Checking...' : 'Check Availability'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item size={{xs:12,    md:6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Availability Periods</Typography>
                  <List>
                    {room.availability.map((period, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`}
                          secondary={`${period.availableUnits} unit${period.availableUnits > 1 ? 's' : ''} available`}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {availabilityResult && (
                    <Box sx={{ mt: 2 }}>
                      <Alert 
                        severity={availabilityResult.available ? 'success' : 'error'}
                        sx={{ mb: 2 }}
                      >
                        {availabilityResult.available 
                          ? 'Room is available for selected dates' 
                          : 'Room is not available for selected dates'
                        }
                      </Alert>
                      {availabilityResult.details && (
                        <Typography variant="body2" color="text.secondary">
                          {availabilityResult.details}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Guest Details Tab */}
        {selectedTab === 2 && room.status === 'booked' && (
          <Grid container spacing={3}>
            <Grid item size={{xs:12,    md:6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Current Guest</Typography>
                  {room.currentBooking ? (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2 }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {room.currentBooking.guestName || 'Guest Name'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Booking ID: {room.currentBooking._id}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <List dense>
                        <ListItem>
                          <ListItemIcon><Phone /></ListItemIcon>
                          <ListItemText 
                            primary="Phone" 
                            secondary={room.currentBooking.guestPhone || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Email /></ListItemIcon>
                          <ListItemText 
                            primary="Email" 
                            secondary={room.currentBooking.guestEmail || 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CalendarToday /></ListItemIcon>
                          <ListItemText 
                            primary="Check-in" 
                            secondary={room.currentBooking.checkInDate ? new Date(room.currentBooking.checkInDate).toLocaleDateString() : 'N/A'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CalendarToday /></ListItemIcon>
                          <ListItemText 
                            primary="Check-out" 
                            secondary={room.currentBooking.checkOutDate ? new Date(room.currentBooking.checkOutDate).toLocaleDateString() : 'N/A'} 
                          />
                        </ListItem>
                      </List>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No current booking information available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item size={{xs:12,    md:6}}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Booking Details</Typography>
                  {room.currentBooking ? (
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Booking Status" 
                          secondary={
                            <Chip 
                              label={room.currentBooking.status || 'Active'} 
                              color="warning" 
                              size="small" 
                            />
                          } 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Adults" 
                          secondary={room.currentBooking.adults || 'N/A'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Children" 
                          secondary={room.currentBooking.children || 'N/A'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Total Amount" 
                          secondary={formatCurrency(room.currentBooking.totalAmount || 0)} 
                        />
                      </ListItem>
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No booking details available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        {room.status === 'available' && (
          <Button 
            onClick={() => onUpdateStatus(room._id, 'maintenance')}
            color="error"
            variant="outlined"
          >
            Mark as Maintenance
          </Button>
        )}
        {room.status === 'maintenance' && (
          <Button 
            onClick={() => onUpdateStatus(room._id, 'available')}
            color="success"
            variant="outlined"
          >
            Mark as Available
          </Button>
        )}
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomDetailsModal;