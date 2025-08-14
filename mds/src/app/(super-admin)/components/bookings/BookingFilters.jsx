import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Box,
  Typography 
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateFilters, resetFilters } from '@/redux/features/bookings/bookingSlice';

const BookingFilters = ({ selectedProperty, bookings }) => {
  const dispatch = useDispatch();
  const { filters, isLoading } = useSelector(state => state.booking);
  
  const [searchFilters, setSearchFilters] = useState({
    guestName: '',
    bookingId: '',
    status: '',
    paymentStatus: ''
  });

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    dispatch(updateFilters({
      ...filters,
      ...searchFilters,
      page: 1
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      guestName: '',
      bookingId: '',
      status: '',
      paymentStatus: ''
    });
    dispatch(resetFilters());
  };

  return (
    <>
      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item size={{xs:12, md:3}}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search by Booking ID, User ID, Property..."
                value={searchFilters.guestName}
                onChange={(e) => handleFilterChange('guestName', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item size={{xs:12, md:2}}>
              <FormControl size="small" fullWidth>
                <InputLabel>All Status</InputLabel>
                <Select
                  value={searchFilters.status}
                  label="All Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="checked-in">Checked In</MenuItem>
                  <MenuItem value="checked-out">Checked Out</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item size={{xs:12, md:2}}>
              <FormControl size="small" fullWidth>
                <InputLabel>All Payments</InputLabel>
                <Select
                  value={searchFilters.paymentStatus}
                  label="All Payments"
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                >
                  <MenuItem value="">All Payments</MenuItem>
                  <MenuItem value="completed">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item size={{xs:12, md:5}}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Manual Booking
                </Button>
                
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AnalyticsIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Analytics
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Export CSV
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* All Bookings Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          All Bookings
        </Typography>
      </Box>
    </>
  );
};

export default BookingFilters;