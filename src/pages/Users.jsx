import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  CircularProgress 
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getUserById, updateUser } from '../api/adminApi';
import { toast } from 'react-toastify';
import UserList from '../components/users/UserList';
import Loading from '../components/common/Loading';

// Validation schema
const userSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  name: Yup.string().nullable(),
  bio: Yup.string().nullable(),
  avatar: Yup.string().url('Must be a valid URL').nullable(),
  password: Yup.string().min(6, 'Password must be at least 6 characters').nullable()
});

const UserEditForm = ({ userId, onCancel }) => {
  const queryClient = useQueryClient();

  // Fetch user
  const { data: userData, isLoading } = useQuery(
    ['user', userId],
    () => getUserById(userId),
    {
      onSuccess: (data) => {
        const user = data.data.data;
        formik.setValues({
          username: user.username || '',
          email: user.email || '',
          name: user.name || '',
          bio: user.bio || '',
          avatar: user.avatar || '',
          password: '' // Empty for security
        });
      }
    }
  );

  // Update mutation
  const updateMutation = useMutation(
    (data) => updateUser(userId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['user', userId]);
        toast.success('User updated successfully');
        onCancel();
      },
      onError: (error) => {
        toast.error(`Error updating user: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  // Form handling
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      name: '',
      bio: '',
      avatar: '',
      password: ''
    },
    validationSchema: userSchema,
    onSubmit: (values) => {
      // Only include password if it was provided
      const userData = { ...values };
      if (!userData.password) {
        delete userData.password;
      }
      updateMutation.mutate(userData);
    }
  });

  if (isLoading) return <Loading message="Loading user data..." />;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Edit User
      </Typography>

      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="username"
              name="username"
              label="Username"
              variant="outlined"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              variant="outlined"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Full Name"
              variant="outlined"
              value={formik.values.name || ''}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password (leave empty to keep current)"
              variant="outlined"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="bio"
              name="bio"
              label="Bio"
              variant="outlined"
              multiline
              rows={3}
              value={formik.values.bio || ''}
              onChange={formik.handleChange}
              error={formik.touched.bio && Boolean(formik.errors.bio)}
              helperText={formik.touched.bio && formik.errors.bio}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              id="avatar"
              name="avatar"
              label="Avatar URL"
              variant="outlined"
              value={formik.values.avatar || ''}
              onChange={formik.handleChange}
              error={formik.touched.avatar && Boolean(formik.errors.avatar)}
              helperText={formik.touched.avatar && formik.errors.avatar}
            />
          </Grid>

          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Avatar
              src={formik.values.avatar}
              alt={formik.values.name || formik.values.username}
              sx={{ width: 80, height: 80 }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={updateMutation.isLoading}
          >
            {updateMutation.isLoading ? <CircularProgress size={24} /> : 'Update User'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

const Users = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleEdit = (userId) => {
    setSelectedUserId(userId);
  };

  const handleCancel = () => {
    setSelectedUserId(null);
  };

  return (
    <Box>
      {selectedUserId ? (
        <UserEditForm 
          userId={selectedUserId} 
          onCancel={handleCancel} 
        />
      ) : (
        <UserList onEdit={handleEdit} />
      )}
    </Box>
  );
};

export default Users;