"use client"
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Avatar,
  Chip,
  Grid,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  LockReset as LockResetIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon,
  Support as SupportIcon,
} from '@mui/icons-material';

const UserProfileDialog = ({ 
  open, 
  onClose, 
  selectedUser, 
  onEdit,
  formatDate,
  getRoleColor,
  getStatusColor,
  getInitials 
}) => {
  if (!selectedUser) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">User Profile</Typography>
          <Box display="flex" gap={1}>
            <IconButton 
              onClick={() => onEdit(selectedUser._id, selectedUser.name)}
              sx={{ color: '#1976d2' }}
            >
              <EditIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box>
          {/* User Info Section */}
          <Box sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar sx={{ bgcolor: '#1976d2', width: 80, height: 80, fontSize: '2rem' }}>
                {getInitials(selectedUser.name)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h4" fontWeight="bold" mb={1}>
                  {selectedUser.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {selectedUser.email}
                </Typography>
                <Box display="flex" gap={1} mb={2}>
                  <Chip 
                    label={selectedUser.role || 'Guest'} 
                    size="small"
                    sx={getRoleColor(selectedUser.role)}
                  />
                  <Chip 
                    label={selectedUser.isDeleted ? 'Blocked' : 'Active'} 
                    size="small"
                    sx={getStatusColor(selectedUser.isDeleted ? 'blocked' : 'active')}
                  />
                </Box>
                <Grid container spacing={3}>
                  <Grid item size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography variant="body2">{selectedUser.phoneNumber || '+91 98765 43210'}</Typography>
                  </Grid>
                  <Grid item size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">City</Typography>
                    <Typography variant="body2">{selectedUser.city || 'Delhi'}</Typography>
                  </Grid>
                  <Grid item size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">Joined</Typography>
                    <Typography variant="body2">{formatDate(selectedUser.createdAt)}</Typography>
                  </Grid>
                  <Grid item size={{ xs: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">KYC Status</Typography>
                    <Typography variant="body2" color="green" fontWeight="bold">Verified</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#f57c00', '&:hover': { bgcolor: '#ef6c00' } }}
                  fullWidth
                  startIcon={<BlockIcon />}
                >
                  Suspend Account
                </Button>
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<LockResetIcon />}
                >
                  Reset Password
                </Button>
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                  fullWidth
                  startIcon={<DownloadIcon />}
                >
                  Download Report
                </Button>
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                  fullWidth
                  startIcon={<NotificationsIcon />}
                >
                  Send Notification
                </Button>
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#666', '&:hover': { bgcolor: '#555' } }}
                  fullWidth
                  startIcon={<SupportIcon />}
                >
                  Assign Support Ticket
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              {/* Booking History */}
              <Grid item size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                      Booking History
                    </Typography>
                    
                    {/* Sample booking data - replace with actual data */}
                    <Box mb={2}>
                      <Grid container spacing={2} alignItems="center" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Grid item size={{ xs: 12, md: 4 }}>
                          <Typography variant="subtitle2" fontWeight="bold">Divine Villa, Dharamshala</Typography>
                          <Typography variant="caption" color="text.secondary">Dec 15-18, 2024 • 3 nights</Typography>
                        </Grid>
                        <Grid item size={{ xs: 6, md: 3 }}>
                          <Typography variant="body2">₹12,500 • 2 guests</Typography>
                        </Grid>
                        <Grid item size={{ xs: 6, md: 3 }}>
                          <Chip label="Completed" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                        </Grid>
                      </Grid>
                    </Box>

                    <Box mb={2}>
                      <Grid container spacing={2} alignItems="center" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Grid item size={{ xs: 12, md: 4 }}>
                          <Typography variant="subtitle2" fontWeight="bold">Mountain View Resort</Typography>
                          <Typography variant="caption" color="text.secondary">Nov 20-22, 2024 • 2 nights</Typography>
                        </Grid>
                        <Grid item size={{ xs: 6, md: 3 }}>
                          <Typography variant="body2">₹8,900 • 1 guest</Typography>
                        </Grid>
                        <Grid item size={{ xs: 6, md: 3 }}>
                          <Chip label="Upcoming" size="small" sx={{ bgcolor: '#2196f3', color: 'white' }} />
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Cancellation & Refund History */}
              <Grid item size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                      Cancellation & Refund History
                    </Typography>
                    
                    <Box mb={2}>
                      <Grid container spacing={2} alignItems="center" sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                        <Grid item size={{ xs: 12, md: 4 }}>
                          <Typography variant="subtitle2" fontWeight="bold">Peaceful Retreat, McLeod</Typography>
                          <Typography variant="caption" color="text.secondary">Cancelled on Oct 10, 2024</Typography>
                        </Grid>
                        <Grid item size={{ xs: 6, md: 3 }}>
                          <Typography variant="body2">₹6,500 refunded • Reason: Emergency</Typography>
                        </Grid>
                        <Grid item size={{ xs: 6, md: 3 }}>
                          <Chip label="Refunded" size="small" sx={{ bgcolor: '#4caf50', color: 'white' }} />
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Reviews Written */}
              <Grid item size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                      Reviews Written
                    </Typography>
                    
                    <Box mb={2} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item size={{ xs: 12 }}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Typography key={star} sx={{ color: '#ffa726' }}>★</Typography>
                            ))}
                            <Typography variant="subtitle2" fontWeight="bold" ml={1}>
                              Divine Villa, Dharamshala
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            "Amazing stay with beautiful mountain views. The host was very welcoming and the property was exactly as described. Highly recommended!"
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Dec 19, 2024
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;