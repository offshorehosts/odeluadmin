import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  TablePagination,
  Avatar,
  Chip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getUsers, deleteUser } from '../../api/adminApi';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';
import ConfirmDialog from '../common/ConfirmDialog';

const UserList = ({ onEdit }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch users with pagination and search
  const { data, isLoading, error } = useQuery(
    ['users', page + 1, rowsPerPage, searchTerm],
    () => getUsers(page + 1, rowsPerPage, searchTerm),
    {
      keepPreviousData: true,
    }
  );

  // Delete user mutation
  const deleteMutation = useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error deleting user: ${error.response?.data?.message || error.message}`);
      setDeleteDialogOpen(false);
    }
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete._id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) return <Loading message="Loading users..." />;
  if (error) return <Typography color="error">Error loading users: {error.message}</Typography>;

  const users = data?.data?.data || [];
  const totalCount = data?.data?.pagination?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">Users</Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex' }}>
        <TextField
          label="Search Users"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ maxWidth: 500 }}
          InputProps={{
            endAdornment: <SearchIcon color="action" />,
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={user.avatar} 
                      alt={user.name || user.username}
                      sx={{ mr: 2 }}
                    />
                    <Typography>{user.name || user.username}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.username} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    onClick={() => onEdit(user._id)}
                    aria-label="edit user"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClick(user)}
                    aria-label="delete user"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${userToDelete?.username}"? This will also delete all their watch history and watchlist. This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default UserList;