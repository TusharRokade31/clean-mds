// BookingDashboard.jsx
"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  TableSortLabel,
  Checkbox
} from '@mui/material';
import {
  Edit as EditIcon,
  Payment as PaymentIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  ArrowDropDown as ArrowDropDownIcon,
  FilterList as FilterListIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllBookings,
  fetchBookingById,
  updateBooking,
  updatePayment,
  checkInGuest,
  checkOutGuest,
  cancelBooking,
  updateFilters,
  resetFilters,
  clearBookingError
} from '@/redux/features/bookings/bookingSlice';

const BookingDashboard = () => {
  const dispatch = useDispatch();
  const {
    bookings,
    currentBooking,
    pagination,
    filters,
    isLoading,
    isUpdating,
    error
  } = useSelector(state => state.booking);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Sort states
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBookingForMenu, setSelectedBookingForMenu] = useState(null);

  useEffect(() => {
    // Load selected property from localStorage
    const saved = localStorage.getItem("selectedProperty");
    if (saved) {
      setSelectedProperty(JSON.parse(saved));
    }
  }, []);

  // Dialog states
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({});
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'cash',
    transactionId: ''
  });
  const [cancelForm, setCancelForm] = useState({
    reason: '',
    refundAmount: 0
  });

  // Filter states
  const [searchFilters, setSearchFilters] = useState({
    status: '',
    guestName: '',
    bookingId: '',
    paymentStatus: '',
    checkIn: '',
    checkOut: ''
  });

  // Load bookings on component mount and when filters change
  useEffect(() => {
    if (selectedProperty) {
      const params = {
        ...filters,
        propertyId: selectedProperty._id
      };
      dispatch(fetchAllBookings(params));
    }
  }, [dispatch, selectedProperty, filters]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

// Update the sortedBookings memo to include filtering
const sortedBookings = React.useMemo(() => {
  let filteredBookings = [...bookings];
  
  // Apply client-side filters if backend search isn't working
  if (searchFilters.guestName) {
    const searchTerm = searchFilters.guestName.toLowerCase();
    filteredBookings = filteredBookings.filter(booking => 
      `${booking.primaryGuest.firstName} ${booking.primaryGuest.lastName}`
        .toLowerCase()
        .includes(searchTerm)
    );
  }
  
  if (searchFilters.status) {
    filteredBookings = filteredBookings.filter(booking => 
      booking.status === searchFilters.status
    );
  }
  
  if (searchFilters.paymentStatus) {
    filteredBookings = filteredBookings.filter(booking => 
      booking.payment.status === searchFilters.paymentStatus
    );
  }
  
  // Apply sorting
  if (sortConfig.key) {
    filteredBookings.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'guestName') {
        aValue = `${a.primaryGuest.firstName} ${a.primaryGuest.lastName}`;
        bValue = `${b.primaryGuest.firstName} ${b.primaryGuest.lastName}`;
      } else if (sortConfig.key === 'totalAmount') {
        aValue = a.pricing.totalAmount;
        bValue = b.pricing.totalAmount;
      } else if (sortConfig.key === 'paymentStatus') {
        aValue = a.payment.status;
        bValue = b.payment.status;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  return filteredBookings;
}, [bookings, sortConfig, searchFilters]);

  // Handle selection
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedBookings(bookings.map(booking => booking._id));
      setSelectAll(true);
    } else {
      setSelectedBookings([]);
      setSelectAll(false);
    }
  };

  const handleSelectBooking = (bookingId) => {
    const selectedIndex = selectedBookings.indexOf(bookingId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedBookings, bookingId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedBookings.slice(1));
    } else if (selectedIndex === selectedBookings.length - 1) {
      newSelected = newSelected.concat(selectedBookings.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedBookings.slice(0, selectedIndex),
        selectedBookings.slice(selectedIndex + 1)
      );
    }

    setSelectedBookings(newSelected);
    setSelectAll(newSelected.length === bookings.length);
  };

  // Handle actions menu
  const handleActionsClick = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBookingForMenu(booking);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setSelectedBookingForMenu(null);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    const updatedFilters = {
      ...filters,
      ...searchFilters,
      page: 1
    };
    dispatch(updateFilters(updatedFilters));
  };

  const clearFilters = () => {
    setSearchFilters({
      status: '',
      guestName: '',
      bookingId: '',
      paymentStatus: '',
      checkIn: '',
      checkOut: ''
    });
    dispatch(resetFilters());
  };

  // Handle pagination
  const handlePageChange = (event, newPage) => {
    dispatch(updateFilters({ ...filters, page: newPage }));
  };

  // Handle booking actions
  const handleViewBooking = (bookingId) => {
    dispatch(fetchBookingById(bookingId));
    setViewDialog(true);
    handleActionsClose();
  };

  const handleEditBooking = (booking) => {
    setEditForm({
      primaryGuest: booking.primaryGuest,
      additionalGuests: booking.additionalGuests,
      checkIn: booking.checkIn.split('T')[0],
      checkOut: booking.checkOut.split('T')[0],
      guestCount: booking.guestCount,
      specialRequests: booking.specialRequests || ''
    });
    dispatch(fetchBookingById(booking._id));
    setEditDialog(true);
    handleActionsClose();
  };

  const handlePaymentUpdate = (booking) => {
    setPaymentForm({
      amount: '',
      method: 'cash',
      transactionId: ''
    });
    dispatch(fetchBookingById(booking._id));
    setPaymentDialog(true);
    handleActionsClose();
  };

  const handleCancelBooking = (booking) => {
    setCancelForm({
      reason: '',
      refundAmount: 0
    });
    dispatch(fetchBookingById(booking._id));
    setCancelDialog(true);
    handleActionsClose();
  };

  const handleCheckIn = (bookingId) => {
    dispatch(checkInGuest(bookingId));
    handleActionsClose();
  };

  const handleCheckOut = (bookingId) => {
    dispatch(checkOutGuest(bookingId));
    handleActionsClose();
  };

  // Submit handlers
  const handleEditSubmit = () => {
    if (currentBooking) {
      dispatch(updateBooking({
        id: currentBooking._id,
        updateData: editForm
      }));
      setEditDialog(false);
    }
  };

  const handlePaymentSubmit = () => {
    if (currentBooking && paymentForm.amount > 0) {
      dispatch(updatePayment({
        id: currentBooking._id,
        paymentData: paymentForm
      }));
      setPaymentDialog(false);
    }
  };

  const handleCancelSubmit = () => {
    if (currentBooking) {
      dispatch(cancelBooking({
        id: currentBooking._id,
        cancellationData: cancelForm
      }));
      setCancelDialog(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Booked': 'success',
      'CheckIn': 'info',
      'CheckOut': 'primary',
      'Cancelled': 'error',
      'confirmed': 'warning',
      'checked-in': 'info',
      'checked-out': 'success',
      'cancelled': 'error',
      'no-show': 'default'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Paid': 'success',
      'Unpaid': 'error',
      'pending': 'warning',
      'partial': 'info',
      'completed': 'success',
      'failed': 'error',
      'refunded': 'default'
    };
    return colors[status] || 'default';
  };

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!selectedProperty) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a property to view bookings
        </Typography>
      </Box>
    );
  }

  

  return (
    
    <Box sx={{ p: 3 }}>
      {isLoading && (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress />
  </Box>
)}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {selectedProperty.placeName} - Bookings
        </Typography>
       
      </Box>

    

<Card sx={{ mb: 2 }}>
  <CardContent>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={3}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search by guest name..."
          value={searchFilters.guestName}
          onChange={(e) => handleFilterChange('guestName', e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          }}
        />
      </Grid>
      <Grid item size={{xs:12, md:2}}>
        <TextField
          size="small"
          fullWidth
          placeholder="Booking ID"
          value={searchFilters.bookingId}
          onChange={(e) => handleFilterChange('bookingId', e.target.value)}
        />
      </Grid>
      <Grid item size={{xs:12, md:2}}>
        <FormControl size="small" fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={searchFilters.status}
            label="Status"
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="confirmed">Booked</MenuItem>
            <MenuItem value="checked-in">Check In</MenuItem>
            <MenuItem value="checked-out">Check Out</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item size={{xs:12, md:2}}>
        <FormControl size="small" fullWidth>
          <InputLabel>Payment</InputLabel>
          <Select
            value={searchFilters.paymentStatus}
            label="Payment"
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="completed">Paid</MenuItem>
            <MenuItem value="pending">Unpaid</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={3}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={applyFilters}
            disabled={isLoading}
            startIcon={<SearchIcon />}
            size="small"
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={clearFilters}
            disabled={isLoading}
            startIcon={<ClearIcon />}
            size="small"
          >
            Clear
          </Button>
        </Box>
      </Grid>
    </Grid>
  </CardContent>
</Card>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearBookingError())}
        >
          {error}
        </Alert>
      )}

      {/* Bookings Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedBookings.length > 0 && selectedBookings.length < bookings.length}
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'guestName'}
                      direction={sortConfig.key === 'guestName' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('guestName')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'package'}
                      direction={sortConfig.key === 'package' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('package')}
                    >
                      Package
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'roomType'}
                      direction={sortConfig.key === 'roomType' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('roomType')}
                    >
                      Room Type
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'status'}
                      direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'checkIn'}
                      direction={sortConfig.key === 'checkIn' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('checkIn')}
                    >
                      Check In
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'checkOut'}
                      direction={sortConfig.key === 'checkOut' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('checkOut')}
                    >
                      Check Out
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'paymentStatus'}
                      direction={sortConfig.key === 'paymentStatus' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('paymentStatus')}
                    >
                      Payment
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedBookings.map((booking) => (
                  <TableRow 
                    key={booking._id}
                    selected={selectedBookings.indexOf(booking._id) !== -1}
                    hover
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedBookings.indexOf(booking._id) !== -1}
                        onChange={() => handleSelectBooking(booking._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getAvatarColor(booking.primaryGuest.firstName),
                            width: 40, 
                            height: 40 
                          }}
                        >
                          {booking.primaryGuest.firstName.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {booking.primaryGuest.firstName} {booking.primaryGuest.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {booking.package || 'All Inclusive'}
                      </Typography>
                    </TableCell>
                    {console.log(booking)}
                    <TableCell>
                      <Typography variant="body2">
                        {booking.property.propertyType || 'Delux'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status === 'confirmed' ? 'Booked' : 
                               booking.status === 'checked-in' ? 'CheckIn' :
                               booking.status === 'checked-out' ? 'CheckOut' :
                               booking.status === 'cancelled' ? 'Cancelled' :
                               booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                        sx={{ minWidth: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(booking.checkIn).toLocaleDateString('en-US', { 
                          month: '2-digit', 
                          day: '2-digit', 
                          year: 'numeric' 
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(booking.checkOut).toLocaleDateString('en-US', { 
                          month: '2-digit', 
                          day: '2-digit', 
                          year: 'numeric' 
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.payment.status === 'completed' ? 'Paid' :
                               booking.payment.status === 'pending' ? 'Unpaid' :
                               booking.payment.status}
                        color={getPaymentStatusColor(booking.payment.status)}
                        size="small"
                        sx={{ minWidth: 70 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2">
                          {booking.primaryGuest.phone || '1234567890'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionsClick(e, booking)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2,
            borderTop: '1px solid #e0e0e0'
          }}>
            <Typography variant="body2" color="text.secondary">
              {selectedBookings.length > 0 ? `${selectedBookings.length} of ` : ''}
              {`${((pagination.currentPage - 1) * 10) + 1} - ${Math.min(pagination.currentPage * 10, pagination.totalBookings)} of ${pagination.totalBookings}`}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select value={10} displayEmpty>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                Items per page
              </Typography>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="small"
                showFirstButton
                showLastButton
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Actions Menu */}
    <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleActionsClose}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
    <MenuItem onClick={() => handleViewBooking(selectedBookingForMenu?._id)}>
      <ListItemIcon>
        <ViewIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>View Details</ListItemText>
    </MenuItem>

    {selectedBookingForMenu?.status === 'confirmed' && (
      <MenuItem onClick={() => handleCheckIn(selectedBookingForMenu._id)}>
        <ListItemIcon>
          <CheckInIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Check In</ListItemText>
      </MenuItem>
    )}

    {selectedBookingForMenu?.status === 'checked-in' && (
      <MenuItem onClick={() => handleCheckOut(selectedBookingForMenu._id)}>
        <ListItemIcon>
          <CheckOutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Check Out</ListItemText>
      </MenuItem>
    )}

    {selectedBookingForMenu?.status !== 'cancelled' && selectedBookingForMenu?.status !== 'checked-out' && (
      <MenuItem onClick={() => handleEditBooking(selectedBookingForMenu)}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit Booking</ListItemText>
      </MenuItem>
    )}

    <MenuItem onClick={() => handlePaymentUpdate(selectedBookingForMenu)}>
      <ListItemIcon>
        <EditIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Update Payment</ListItemText>
    </MenuItem>

    {selectedBookingForMenu?.status !== 'cancelled' && (
      <MenuItem onClick={() => handleCancelBooking(selectedBookingForMenu)}>
        <ListItemIcon>
          <CancelIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Cancel Booking</ListItemText>
      </MenuItem>
    )}

    <MenuItem onClick={() => handleCancelBooking(selectedBookingForMenu)}>
      <ListItemIcon>
        <DeleteIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Delete Booking</ListItemText>
    </MenuItem>
    </Menu>


      {/* Keep all your existing dialogs here - View, Edit, Payment, Cancel */}
      {/* View Booking Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {currentBooking && (
            <Grid container spacing={3}>
              <Grid item size={{xs:12, md:6}}>
                <Typography variant="h6" gutterBottom>Booking Information</Typography>
                <Typography><strong>Booking ID:</strong> {currentBooking.bookingId}</Typography>
                <Typography><strong>Status:</strong> 
                  <Chip 
                    label={currentBooking.status} 
                    color={getStatusColor(currentBooking.status)} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography><strong>Check In:</strong> {new Date(currentBooking.checkIn).toLocaleDateString()}</Typography>
                <Typography><strong>Check Out:</strong> {new Date(currentBooking.checkOut).toLocaleDateString()}</Typography>
                <Typography><strong>Guests:</strong> {currentBooking.guestCount.adults} Adults, {currentBooking.guestCount.children} Children</Typography>
                <Typography><strong>Source:</strong> {currentBooking.source}</Typography>
              </Grid>
              
              <Grid item size={{xs:12, md:6}}>
                <Typography variant="h6" gutterBottom>Primary Guest</Typography>
                <Typography><strong>Name:</strong> {currentBooking.primaryGuest.firstName} {currentBooking.primaryGuest.lastName}</Typography>
                <Typography><strong>Email:</strong> {currentBooking.primaryGuest.email}</Typography>
                <Typography><strong>Phone:</strong> {currentBooking.primaryGuest.phone}</Typography>
                <Typography><strong>ID:</strong> {currentBooking.primaryGuest.idType} - {currentBooking.primaryGuest.idNumber}</Typography>
              </Grid>
              
              <Grid item size={{xs:12, md:6}}>
                <Typography variant="h6" gutterBottom>Pricing</Typography>
                <Typography><strong>Base Charge:</strong> ₹{currentBooking.pricing.baseCharge}</Typography>
                <Typography><strong>Extra Adult Charge:</strong> ₹{currentBooking.pricing.extraAdultCharge}</Typography>
                <Typography><strong>Child Charge:</strong> ₹{currentBooking.pricing.childCharge}</Typography>
                <Typography><strong>Subtotal:</strong> ₹{currentBooking.pricing.subtotal}</Typography>
                <Typography><strong>Taxes:</strong> ₹{currentBooking.pricing.taxes}</Typography>
                <Typography><strong>Total Amount:</strong> ₹{currentBooking.pricing.totalAmount}</Typography>
              </Grid>
              
              <Grid item size={{xs:12, md:6}}>
                <Typography variant="h6" gutterBottom>Payment</Typography>
                <Typography><strong>Status:</strong> 
                  <Chip 
                    label={currentBooking.payment.status} 
                    color={getPaymentStatusColor(currentBooking.payment.status)} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography><strong>Method:</strong> {currentBooking.payment.method}</Typography>
                <Typography><strong>Paid Amount:</strong> ₹{currentBooking.payment.paidAmount}</Typography>
                <Typography><strong>Pending Amount:</strong> ₹{currentBooking.payment.pendingAmount}</Typography>
                {currentBooking.payment.transactionId && (
                  <Typography><strong>Transaction ID:</strong> {currentBooking.payment.transactionId}</Typography>
                )}
              </Grid>
              
              {currentBooking.specialRequests && (
                <Grid item size={{xs:12}}>
                  <Typography variant="h6" gutterBottom>Special Requests</Typography>
                  <Typography>{currentBooking.specialRequests}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="First Name"
                value={editForm.primaryGuest?.firstName || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  primaryGuest: { ...editForm.primaryGuest, firstName: e.target.value }
                })}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="Last Name"
                value={editForm.primaryGuest?.lastName || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  primaryGuest: { ...editForm.primaryGuest, lastName: e.target.value }
                })}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="Email"
                value={editForm.primaryGuest?.email || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  primaryGuest: { ...editForm.primaryGuest, email: e.target.value }
                })}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="Phone"
                value={editForm.primaryGuest?.phone || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  primaryGuest: { ...editForm.primaryGuest, phone: e.target.value }
                })}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                type="date"
                label="Check In"
                value={editForm.checkIn || ''}
                onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                type="date"
                label="Check Out"
                value={editForm.checkOut || ''}
                onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                type="number"
                label="Adults"
                value={editForm.guestCount?.adults || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  guestCount: { ...editForm.guestCount, adults: parseInt(e.target.value) }
                })}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                type="number"
                label="Children"
                value={editForm.guestCount?.children || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  guestCount: { ...editForm.guestCount, children: parseInt(e.target.value) }
                })}
              />
            </Grid>
            <Grid item size={{xs:12}}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Requests"
                value={editForm.specialRequests || ''}
                onChange={(e) => setEditForm({ ...editForm, specialRequests: e.target.value })}
             />
           </Grid>
         </Grid>
       </DialogContent>
       <DialogActions>
         <Button onClick={() => setEditDialog(false)}>Cancel</Button>
         <Button onClick={handleEditSubmit} variant="contained" disabled={isUpdating}>
           {isUpdating ? 'Updating...' : 'Update'}
         </Button>
       </DialogActions>
     </Dialog>

     {/* Payment Dialog */}
     <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
       <DialogTitle>Update Payment</DialogTitle>
       <DialogContent>
         <Grid container spacing={2} sx={{ mt: 1 }}>
           <Grid item size={{xs:12}}>
             <TextField
               fullWidth
               type="number"
               label="Payment Amount"
               value={paymentForm.amount}
               onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
               inputProps={{ min: 0 }}
             />
           </Grid>
           <Grid item size={{xs:12}}>
             <FormControl fullWidth>
               <InputLabel>Payment Method</InputLabel>
               <Select
                 value={paymentForm.method}
                 label="Payment Method"
                 onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
               >
                 <MenuItem value="cash">Cash</MenuItem>
                 <MenuItem value="card">Card</MenuItem>
                 <MenuItem value="upi">UPI</MenuItem>
                 <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                 <MenuItem value="other">Other</MenuItem>
               </Select>
             </FormControl>
           </Grid>
           <Grid item size={{xs:12}}>
             <TextField
               fullWidth
               label="Transaction ID (Optional)"
               value={paymentForm.transactionId}
               onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
             />
           </Grid>
         </Grid>
       </DialogContent>
       <DialogActions>
         <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
         <Button onClick={handlePaymentSubmit} variant="contained" disabled={isUpdating}>
           {isUpdating ? 'Updating...' : 'Update Payment'}
         </Button>
       </DialogActions>
     </Dialog>

     {/* Cancel Booking Dialog */}
     <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
       <DialogTitle>Cancel Booking</DialogTitle>
       <DialogContent>
         <Grid container spacing={2} sx={{ mt: 1 }}>
           <Grid item size={{xs:12}}>
             <TextField
               fullWidth
               multiline
               rows={3}
               label="Cancellation Reason"
               value={cancelForm.reason}
               onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
               required
             />
           </Grid>
           <Grid item size={{xs:12}}>
             <TextField
               fullWidth
               type="number"
               label="Refund Amount"
               value={cancelForm.refundAmount}
               onChange={(e) => setCancelForm({ ...cancelForm, refundAmount: e.target.value })}
               inputProps={{ min: 0 }}
             />
           </Grid>
         </Grid>
       </DialogContent>
       <DialogActions>
         <Button onClick={() => setCancelDialog(false)}>Cancel</Button>
         <Button onClick={handleCancelSubmit} variant="contained" color="error" disabled={isUpdating}>
           {isUpdating ? 'Cancelling...' : 'Cancel Booking'}
         </Button>
       </DialogActions>
     </Dialog>
   </Box>
 );
};

export default BookingDashboard;
                  