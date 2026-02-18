import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
// import {
//   MoreVertIcon,
//    ViewIcon,
//   EditIcon,
//   PaymentIcon,
// //   CancelIcon,
//   CheckInIcon,
//   CheckOutIcon
// } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchBookingById, 
  checkInGuest, 
  checkOutGuest, 
  cancelBooking,
  updateFilters,
  clearBookingError 
} from '@/redux/features/bookings/bookingSlice';
import { MoreVerticalIcon } from 'lucide-react';

const BookingTable = ({   bookings = [], 
  pagination, 
  isLoading, 
  error, 
  selectedProperty,
  // Add these props
  onViewBooking,
  onEditBooking,
  onUpdatePayment,
  onCancelBooking,
  onConfirm,
  onCheckIn,
  onCheckOut }) => {
  const dispatch = useDispatch();
  const { isUpdating } = useSelector(state => state.booking);
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleActionsClick = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  // Update the handlers to use the passed functions
  const handleViewBooking = () => {
    if (selectedBooking && onViewBooking) {
      onViewBooking(selectedBooking._id);
    }
    handleActionsClose();
  };

  const handleEditBooking = () => {
    if (selectedBooking && onEditBooking) {
      onEditBooking(selectedBooking);
    }
    handleActionsClose();
  };

  const handleUpdatePayment = () => {
    if (selectedBooking && onUpdatePayment) {
      onUpdatePayment(selectedBooking);
    }
    handleActionsClose();
  };

  const handleCancelBooking = () => {
    if (selectedBooking && onCancelBooking) {
      onCancelBooking(selectedBooking);
    }
    handleActionsClose();
  };

  const handleCheckIn = () => {
    if (selectedBooking && onCheckIn) {
      onCheckIn(selectedBooking._id);
    }
    handleActionsClose();
  };

  const handleConfimStatus = () => {
    if (selectedBooking && onConfirm) {
      onConfirm(selectedBooking._id);
    }
    handleActionsClose();
  };

  const handleCheckOut = () => {
    if (selectedBooking && onCheckOut) {
      onCheckOut(selectedBooking._id);
    }
    handleActionsClose();
  };

  const handlePageChange = (event, newPage) => {
    dispatch(updateFilters({ page: newPage }));
  };

  // Status and payment status styling
  const getStatusColor = (status) => {
    const colors = {
      'confirmed': 'success',
      'checked-in': 'info',
      'checked-out': 'primary',
      'cancelled': 'error',
      'completed': 'success',
      'pending': 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'confirmed': 'Confirmed',
      'checked-in': 'Checked In',
      'checked-out': 'Checked Out',
      'cancelled': 'Cancelled',
      'completed': 'Completed',
      'pending': 'Pending'
    };
    return labels[status] || status;
  };

  const getPaymentColor = (status) => {
    const colors = {
      'completed': 'success',
      'pending': 'error',
      'partial': 'warning',
      'refunded': 'default'
    };
    return colors[status] || 'default';
  };

  const getPaymentLabel = (status) => {
    const labels = {
      'completed': 'Paid',
      'pending': 'Pending',
      'partial': 'Partial',
      'refunded': 'Refunded'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 3 }}
        onClose={() => dispatch(clearBookingError())}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
              <TableRow>
                <TableCell><strong>BOOKING ID</strong></TableCell>
                <TableCell><strong>GUEST DETAILS</strong></TableCell>
                <TableCell><strong>PROPERTY</strong></TableCell>
                <TableCell><strong>STAY DETAILS</strong></TableCell>
                <TableCell><strong>AMOUNT</strong></TableCell>
                <TableCell><strong>STATUS</strong></TableCell>
                <TableCell><strong>PAYMENT</strong></TableCell>
                <TableCell><strong>ACTIONS</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {booking.bookingId}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {booking.primaryGuest.firstName} {booking.primaryGuest.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.primaryGuest.email}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {booking.primaryGuest.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {booking.property?.placeName || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.property?.propertyType || 'N/A'}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {new Date(booking.checkIn).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        to {new Date(booking.checkOut).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {booking.pricing.totalDays} nights
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      ₹{booking.pricing.totalAmount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getStatusLabel(booking.status)}
                      color={getStatusColor(booking.status)}
                      size="small"
                      sx={{ minWidth: 80 }}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={getPaymentLabel(booking.payment.status)}
                      color={getPaymentColor(booking.payment.status)}
                      size="small"
                      sx={{ minWidth: 70 }}
                    />
                  </TableCell>
                  
                  <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      color="primary" 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onViewBooking && onViewBooking(booking._id)}
                    >
                      View
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleActionsClick(e, booking)}
                    >
                      <MoreVerticalIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            p: 2,
            borderTop: '1px solid #e0e0e0'
          }}>
            <Pagination
              count={pagination.totalPages || 1}
              page={pagination.currentPage || 1}
              onChange={handlePageChange}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </CardContent>

      {/* Actions Menu */}
     <Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleActionsClose}
  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
>
  <MenuItem onClick={handleViewBooking}>
    <ListItemIcon>
      {/* <ViewIcon fontSize="small" /> */}
    </ListItemIcon>
    <ListItemText>View Details</ListItemText>
  </MenuItem>

  {selectedBooking?.status === 'confirmed' && (
    <MenuItem onClick={handleCheckIn}>
      <ListItemIcon>
        {/* <CheckInIcon fontSize="small" /> */}
      </ListItemIcon>
      <ListItemText>Check In</ListItemText>
    </MenuItem>
  )}
  {selectedBooking?.status === 'pending' && (
    <MenuItem onClick={handleConfimStatus}>
      <ListItemIcon>
        {/* <CheckInIcon fontSize="small" /> */}
      </ListItemIcon>
      <ListItemText>Confirm</ListItemText>
    </MenuItem>  
  )}

  {selectedBooking?.status === 'checked-in' && (
    <MenuItem onClick={handleCheckOut}>
      <ListItemIcon>
        {/* <CheckOutIcon fontSize="small" /> */}
      </ListItemIcon>
      <ListItemText>Check Out</ListItemText>
    </MenuItem>
  )}

  {selectedBooking?.status !== 'cancelled' && selectedBooking?.status !== 'checked-out' && (
    <MenuItem onClick={handleEditBooking}>
      <ListItemIcon>
        {/* <EditIcon fontSize="small" /> */}
      </ListItemIcon>
      <ListItemText>Edit Booking</ListItemText>
    </MenuItem>
  )}

  <MenuItem onClick={handleUpdatePayment}>
    <ListItemIcon>
      {/* <PaymentIcon fontSize="small" /> */}
    </ListItemIcon>
    <ListItemText>Update Payment</ListItemText>
  </MenuItem>

  {selectedBooking?.status !== 'cancelled' && (
    <MenuItem onClick={handleCancelBooking}>
      <ListItemIcon>
        {/* <CancelIcon fontSize="small" /> */}
      </ListItemIcon>
      <ListItemText>Cancel Booking</ListItemText>
    </MenuItem>
  )}
</Menu>
    </Card>
  );
};

export default BookingTable;