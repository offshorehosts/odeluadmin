import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  FormControlLabel, 
  Switch, 
  Paper,
  Chip,
  Autocomplete,
  Tabs,
  Tab,
  Rating,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { 
  Save as SaveIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getShowById, createShow, updateShow } from '../../api/adminApi';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';
import TmdbShowSearch from './TmdbShowSearch';

// Validation schema
const showSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  image: Yup.string().url('Must be a valid URL').required('Image URL is required'),
  coverImage: Yup.string().url('Must be a valid URL').required('Cover image URL is required'),
  hoverImage: Yup.string().url('Must be a valid URL').nullable(),
  startYear: Yup.number().integer('Must be a year').nullable(),
  endYear: Yup.number().integer('Must be a year')
    .nullable()
    .test('is-greater', 'End year must be after start year', function (value) {
      const { startYear } = this.parent;
      if (value && startYear && value < startYear) {
        return false;
      }
      return true;
    }),
  status: Yup.string().required('Status is required'),
  rating: Yup.number().min(0, 'Minimum rating is 0').max(10, 'Maximum rating is 10').nullable(),
  featured: Yup.boolean(),
  tags: Yup.array().of(Yup.string())
});

const ShowForm = ({ showId, onCancel }) => {
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();

  // Fetch show if editing
  const { data: showData, isLoading } = useQuery(
    ['show', showId],
    () => getShowById(showId),
    {
      enabled: !!showId,
      onSuccess: (data) => {
        const show = data.data.data;
        formik.setValues({
          title: show.title || '',
          description: show.description || '',
          image: show.image || '',
          coverImage: show.coverImage || '',
          hoverImage: show.hoverImage || '',
          startYear: show.startYear || null,
          endYear: show.endYear || null,
          status: show.status || 'Ongoing',
          rating: show.rating || null,
          featured: show.featured || false,
          tags: show.tags || []
        });
      }
    }
  );

  // Create/Update mutations
  const createMutation = useMutation(createShow, {
    onSuccess: () => {
      queryClient.invalidateQueries('shows');
      toast.success('Show created successfully');
      onCancel();
    },
    onError: (error) => {
      toast.error(`Error creating show: ${error.response?.data?.message || error.message}`);
    }
  });

  const updateMutation = useMutation(
    (data) => updateShow(showId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('shows');
        queryClient.invalidateQueries(['show', showId]);
        toast.success('Show updated successfully');
        onCancel();
      },
      onError: (error) => {
        toast.error(`Error updating show: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  // Form handling
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      image: '',
      coverImage: '',
      hoverImage: '',
      startYear: null,
      endYear: null,
      status: 'Ongoing',
      rating: null,
      featured: false,
      tags: []
    },
    validationSchema: showSchema,
    onSubmit: (values) => {
      if (showId) {
        updateMutation.mutate(values);
      } else {
        createMutation.mutate(values);
      }
    }
  });

  // Handle TMDB show selection
  const handleTmdbShowSelect = (tmdbShow) => {
    formik.setValues({
      ...formik.values,
      ...tmdbShow
    });
    setTabValue(0);
    toast.success('Show data imported from TMDB');
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (isLoading) return <Loading message="Loading show data..." />;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {showId ? 'Edit TV Show' : 'Add New TV Show'}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="show form tabs">
          <Tab label="Show Details" />
          <Tab label="Search TMDB" />
        </Tabs>
      </Box>

      {tabValue === 0 ? (
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Title"
                variant="outlined"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                id="startYear"
                name="startYear"
                label="Start Year"
                variant="outlined"
                type="number"
                value={formik.values.startYear || ''}
                onChange={formik.handleChange}
                error={formik.touched.startYear && Boolean(formik.errors.startYear)}
                helperText={formik.touched.startYear && formik.errors.startYear}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                id="endYear"
                name="endYear"
                label="End Year"
                variant="outlined"
                type="number"
                value={formik.values.endYear || ''}
                onChange={formik.handleChange}
                error={formik.touched.endYear && Boolean(formik.errors.endYear)}
                helperText={formik.touched.endYear && formik.errors.endYear}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  label="Status"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="Ongoing">Ongoing</MenuItem>
                  <MenuItem value="Ended">Ended</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Upcoming">Upcoming</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="image"
                name="image"
                label="Image URL (Poster)"
                variant="outlined"
                value={formik.values.image}
                onChange={formik.handleChange}
                error={formik.touched.image && Boolean(formik.errors.image)}
                helperText={formik.touched.image && formik.errors.image}
              />
              {formik.values.image && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <img 
                    src={formik.values.image} 
                    alt="Show poster" 
                    style={{ maxHeight: '100px', maxWidth: '100%' }} 
                    onError={(e) => { e.target.src = '/placeholder.png' }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="coverImage"
                name="coverImage"
                label="Cover Image URL (Background)"
                variant="outlined"
                value={formik.values.coverImage}
                onChange={formik.handleChange}
                error={formik.touched.coverImage && Boolean(formik.errors.coverImage)}
                helperText={formik.touched.coverImage && formik.errors.coverImage}
              />
              {formik.values.coverImage && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <img 
                    src={formik.values.coverImage} 
                    alt="Cover image" 
                    style={{ maxHeight: '100px', maxWidth: '100%' }} 
                    onError={(e) => { e.target.src = '/placeholder.png' }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="hoverImage"
                name="hoverImage"
                label="Hover Image URL (Optional)"
                variant="outlined"
                value={formik.values.hoverImage || ''}
                onChange={formik.handleChange}
                error={formik.touched.hoverImage && Boolean(formik.errors.hoverImage)}
                helperText={formik.touched.hoverImage && formik.errors.hoverImage}
              />
              {formik.values.hoverImage && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <img 
                    src={formik.values.hoverImage} 
                    alt="Hover image" 
                    style={{ maxHeight: '100px', maxWidth: '100%' }} 
                    onError={(e) => { e.target.src = '/placeholder.png' }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="legend">Rating (0-10)</Typography>
                <Rating
                  name="rating"
                  value={formik.values.rating ? formik.values.rating / 2 : 0}
                  precision={0.5}
                  max={5}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('rating', newValue ? newValue * 2 : null);
                  }}
                />
                <Typography sx={{ ml: 1 }}>
                  {formik.values.rating ? `${formik.values.rating.toFixed(1)}/10` : 'Not rated'}
                </Typography>
              </Box>
              {formik.touched.rating && formik.errors.rating && (
                <Typography color="error" variant="caption">
                  {formik.errors.rating}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                id="tags"
                options={[]}
                freeSolo
                value={formik.values.tags}
                onChange={(event, newValue) => {
                  formik.setFieldValue('tags', newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Tags"
                    placeholder="Add tags"
                    helperText="Type and press Enter to add tags"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.featured}
                    onChange={formik.handleChange}
                    name="featured"
                    color="primary"
                  />
                }
                label="Featured Show"
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
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {(createMutation.isLoading || updateMutation.isLoading) ? (
                <CircularProgress size={24} />
              ) : (
                showId ? 'Update Show' : 'Create Show'
              )}
            </Button>
          </Box>
        </Box>
      ) : (
        <TmdbShowSearch onSelectShow={handleTmdbShowSelect} />
      )}
    </Paper>
  );
};

export default ShowForm;