"use client"
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';

import { 
  fetchAllUsers, 
  updateUser, 
  deleteUser, 
  fetchUserById,
  clearError,
  clearSelectedUser 
} from '@/redux/features/admin/adminSlice';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { 
    users, 
    selectedUser, 
    isLoading, 
    isUpdating, 
    isDeleting, 
    error, 
    totalUsers 
  } = useSelector((state) => state.admin);

  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    maritalStatus: '',
    state: '',
    city: '',
    phoneNumber: '',
    username: '',
  });

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (userId, name) => {
    dispatch(fetchUserById(userId)).then((result) => {
      if (result.type === 'admin/fetchUserById/fulfilled') {
        const user = result.payload.data;
        setEditFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
          address: user.address || '',
          maritalStatus: user.maritalStatus || '',
          state: user.state || '',
          city: user.city || '',
          phoneNumber: user.phoneNumber || '',
          username: user.username || '',
        });
        setSelectedUserId(userId, name);
        setEditDialog(true);
      }
    });
  };

  const handleView = (userId) => {
    dispatch(fetchUserById(userId)).then((result) => {
      if (result.type === 'admin/fetchUserById/fulfilled') {
        setViewDialog(true);
      }
    });
  };

  const handleDelete = (userId, name) => {
    setSelectedUserId({userId, name});
    setDeleteDialog(true);
  };

  const handleEditSubmit = () => {
    dispatch(updateUser({ userId: selectedUserId.userId, userData: editFormData })).then((result) => {
      if (result.type === 'admin/updateUser/fulfilled') {
        setEditDialog(false);
        dispatch(clearSelectedUser());
      }
    });
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteUser(selectedUserId.userId)).then((result) => {
      if (result.type === 'admin/deleteUser/fulfilled') {
        console.log(result)
        setDeleteDialog(false);
        setSelectedUserId(null);
      }
    });
  };

  const handleInputChange = (field) => (event) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'error' : 'default';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        {/* <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
        >
          Add User
        </Button> */}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow hover key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.gender || 'N/A'}</TableCell>
                    <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>{user.city || 'N/A'}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleView(user._id)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(user._id, user.name)}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user._id, user.name)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Name"
                value={editFormData.name}
                onChange={handleInputChange('name')}
              />
            </Grid>
            <Grid item size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={handleInputChange('email')}
              />
            </Grid>
            <Grid item size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Username"
                value={editFormData.username}
                onChange={handleInputChange('username')}
              />
            </Grid>
            <Grid item size={{xs:12, sm:6}}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editFormData.role}
                  label="Role"
                  onChange={handleInputChange('role')}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item size={{xs:12, sm:6}}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={editFormData.gender}
                  label="Gender"
                  onChange={handleInputChange('gender')}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={editFormData.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editFormData.phoneNumber}
                onChange={handleInputChange('phoneNumber')}
              />
            </Grid>
            <Grid item size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="Marital Status"
                value={editFormData.maritalStatus}
                onChange={handleInputChange('maritalStatus')}
              />
            </Grid>
            <Grid item size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="State"
                value={editFormData.state}
                onChange={handleInputChange('state')}
              />
            </Grid>
            <Grid item size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                label="City"
                value={editFormData.city}
                onChange={handleInputChange('city')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={editFormData.address}
                onChange={handleInputChange('address')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>Name:</strong> {selectedUser.name}</Typography>
              </Grid>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
              </Grid>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>Username:</strong> {selectedUser.username || 'N/A'}</Typography>
              </Grid>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>Role:</strong> {selectedUser.role}</Typography>
              </Grid>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>Gender:</strong> {selectedUser.gender || 'N/A'}</Typography>
              </Grid>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>Date of Birth:</strong> {formatDate(selectedUser.dateOfBirth)}</Typography>
              </Grid>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>Phone:</strong> {selectedUser.phoneNumber || 'N/A'}</Typography>
              </Grid>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>Marital Status:</strong> {selectedUser.maritalStatus || 'N/A'}</Typography>
              </Grid>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>State:</strong> {selectedUser.state || 'N/A'}</Typography>
              </Grid>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>City:</strong> {selectedUser.city || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Address:</strong> {selectedUser.address || 'N/A'}</Typography>
              </Grid>
              <Grid item size={{xs:12, sm:6}}>
                <Typography><strong>Created At:</strong> {formatDate(selectedUser.createdAt)}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>{`Are you sure you want to delete ${selectedUserId?.name} account? This action cannot be undone.`}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;