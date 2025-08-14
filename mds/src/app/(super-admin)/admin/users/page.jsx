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
  Avatar,
  Divider,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon,
  Support as SupportIcon,
  LockReset as LockResetIcon,
  Block as BlockIcon,
} from '@mui/icons-material';

import { 
  fetchAllUsers, 
  updateUser, 
  deleteUser, 
  fetchUserById,
  clearError,
  clearSelectedUser 
} from '@/redux/features/admin/adminSlice';
import UserProfileDialog from '../../components/users/UserProfileDialog';
import EditUserDialog from '../../components/users/EditUserDialog';

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

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [cityFilter, setCityFilter] = useState('All Cities');

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
        setSelectedUserId({userId, name});
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
    switch (role?.toLowerCase()) {
      case 'admin':
        return { backgroundColor: '#ffa726', color: 'white' };
      case 'dharamshala partner':
        return { backgroundColor: '#4caf50', color: 'white' };
      case 'guest':
        return { backgroundColor: '#e3f2fd', color: '#1976d2' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#666' };
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { backgroundColor: '#4caf50', color: 'white' };
      case 'suspended':
        return { backgroundColor: '#ff9800', color: 'white' };
      case 'blocked':
        return { backgroundColor: '#f44336', color: 'white' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#666' };
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('All Roles');
    setStatusFilter('All Status');
    setCityFilter('All Cities');
  };

  const exportUsers = () => {
    // Export functionality to be implemented
    console.log('Export users');
  };


    const tableActions = (user) => (
    <Box display="flex" gap={1} justifyContent="center">
      <Button
        variant="text"
        size="small"
        onClick={() => handleView(user._id)}
        sx={{ color: '#1976d2' }}
      >
        View
      </Button>
      <Button
        variant="text"
        size="small"
        onClick={() => handleEdit(user._id, user.name)}
        sx={{ color: '#ff9800' }}
        startIcon={<EditIcon />}
      >
        Edit
      </Button>
    </Box>
  );
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold" mb={1}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all users, partners, and administrators across the platform.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item size={{xs:12, md:3}}>
            <Typography variant="subtitle2" mb={1}>Search Users</Typography>
            <TextField
              fullWidth
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item size={{xs:6,md:2}}>
            <Typography variant="subtitle2" mb={1}>Role</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="All Roles">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="guest">Guest</MenuItem>
                <MenuItem value="dharamshala partner">Dharamshala Partner</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{xs:6, md:2}}>
            <Typography variant="subtitle2" mb={1}>Status</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All Status">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{xs:6, md:2}}>
            <Typography variant="subtitle2" mb={1}>City</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <MenuItem value="All Cities">All Cities</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{xs:6, md:1}}>
            <Typography variant="subtitle2" mb={1}>Signup Date</Typography>
            <TextField
              fullWidth
              type="date"
              size="small"
            />
          </Grid>
          <Grid item size={{xs:12, md:2}}>
            <Box display="flex" gap={1} mt={3}>
              <Button variant="outlined" onClick={clearFilters} size="small">
                Clear Filters
              </Button>
              <Button variant="contained" onClick={exportUsers} size="small">
                Export Users
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Users List */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Users List</Typography>
          <Typography variant="body2" color="text.secondary">
            Showing 1-10 of {totalUsers || 0} users
          </Typography>
        </Box>
        
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>USER</TableCell>
                <TableCell>ROLE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>BOOKINGS</TableCell>
                <TableCell>JOINED</TableCell>
                <TableCell align="center">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow hover key={user._id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}>
                          {getInitials(user.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role || 'Guest'} 
                        size="small"
                        sx={getRoleColor(user.role)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isDeleted ? 'Blocked' : 'Active'} 
                        size="small"
                        sx={getStatusColor(user.isDeleted ? 'blocked' : 'active')}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">0</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                    {tableActions(user)}
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

       <UserProfileDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        selectedUser={selectedUser}
        onEdit={handleEdit}
        formatDate={formatDate}
        getRoleColor={getRoleColor}
        getStatusColor={getStatusColor}
        getInitials={getInitials}
      />

      <EditUserDialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        editFormData={editFormData}
        onInputChange={handleInputChange}
        onSubmit={handleEditSubmit}
        isUpdating={isUpdating}
        selectedUserId={selectedUserId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUserId?.name} account? This action cannot be undone.
          </Typography>
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