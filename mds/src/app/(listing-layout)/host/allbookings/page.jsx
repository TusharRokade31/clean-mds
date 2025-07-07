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
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Payment as PaymentIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon
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
  };

  const handlePaymentUpdate = (booking) => {
    setPaymentForm({
      amount: '',
      method: 'cash',
      transactionId: ''
    });
    dispatch(fetchBookingById(booking._id));
    setPaymentDialog(true);
  };

  const handleCancelBooking = (booking) => {
    setCancelForm({
      reason: '',
      refundAmount: 0
    });
    dispatch(fetchBookingById(booking._id));
    setCancelDialog(true);
  };

  const handleCheckIn = (bookingId) => {
    dispatch(checkInGuest(bookingId));
  };

  const handleCheckOut = (bookingId) => {
    dispatch(checkOutGuest(bookingId));
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
      confirmed: 'warning',
      'checked-in': 'info',
      'checked-out': 'success',
      cancelled: 'error',
      'no-show': 'default'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      partial: 'info',
      completed: 'success',
      failed: 'error',
      refunded: 'default'
    };
    return colors[status] || 'default';
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
      <Typography variant="h4" gutterBottom>
        Bookings - {selectedProperty.placeName}
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearBookingError())}
        >
          {error}
        </Alert>
      )}

      {/* Filters */}   
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item size={{xs:12, sm:6,md:2}}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={searchFilters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="checked-in">Checked In</MenuItem>
                  <MenuItem value="checked-out">Checked Out</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no-show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item size={{xs:12, sm:6,md:2}}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={searchFilters.paymentStatus}
                  label="Payment Status"
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item size={{xs:12, sm:6,md:2}}>
              <TextField
                fullWidth
                size="small"
                label="Guest Name"
                value={searchFilters.guestName}
                onChange={(e) => handleFilterChange('guestName', e.target.value)}
              />
            </Grid>
            <Grid item size={{xs:12, sm:6,md:2}}>
              <TextField
                fullWidth
                size="small"
                label="Booking ID"
                value={searchFilters.bookingId}
                onChange={(e) => handleFilterChange('bookingId', e.target.value)}
              />
            </Grid>
            <Grid item size={{xs:12, sm:6,md:2}}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Check In"
                value={searchFilters.checkIn}
                onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item size={{xs:12, sm:6,md:2}}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Check Out"
                value={searchFilters.checkOut}
                onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item size={{xs:12}}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Bookings ({pagination.totalBookings})
            </Typography>
            {isLoading && <CircularProgress size={24} />}
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Guest Name</TableCell>
                  <TableCell>Check In</TableCell>
                  <TableCell>Check Out</TableCell>
                  <TableCell>Guests</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.bookingId}</TableCell>
                    <TableCell>
                      {booking.primaryGuest.firstName} {booking.primaryGuest.lastName}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {booking.guestCount.adults + booking.guestCount.children}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.payment.status}
                        color={getPaymentStatusColor(booking.payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>₹{booking.pricing.totalAmount}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewBooking(booking._id)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {booking.status !== 'cancelled' && booking.status !== 'checked-out' && (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditBooking(booking)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {booking.payment.status !== 'completed' && booking.status !== 'cancelled' && (
                          <Tooltip title="Update Payment">
                            <IconButton
                              size="small"
                              onClick={() => handlePaymentUpdate(booking)}
                            >
                              <PaymentIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <Tooltip title="Check In">
                            <IconButton
                              size="small"
                              onClick={() => handleCheckIn(booking._id)}
                              disabled={isUpdating}
                            >
                              <CheckInIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {booking.status === 'checked-in' && (
                          <Tooltip title="Check Out">
                            <IconButton
                              size="small"
                              onClick={() => handleCheckOut(booking._id)}
                              disabled={isUpdating}
                            >
                              <CheckOutIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {booking.status !== 'cancelled' && booking.status !== 'checked-out' && (
                          <Tooltip title="Cancel">
                            <IconButton
                              size="small"
                              onClick={() => handleCancelBooking(booking)}
                              color="error"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

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