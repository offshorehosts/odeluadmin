import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  FormControlLabel, 
  Switch, 
  Divider,
  Paper,
  Chip,
  Autocomplete,
  Tabs,
  Tab,
  Rating,
  CircularProgress,
  IconButton
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getMovieById, createMovie, updateMovie } from '../../api/adminApi';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';
import TmdbMovieSearch from './TmdbMovieSearch';

// Validation schema
const movieSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  image: Yup.string().url('Must be a valid URL').required('Image URL is required'),
  coverImage: Yup.string().url('Must be a valid URL').required('Cover image URL is required'),
  hoverImage: Yup.string().url('Must be a valid URL').nullable(),
  releaseYear: Yup.number().integer('Must be a year').nullable(),
  duration: Yup.string().nullable(),
  rating: Yup.number().min(0, 'Minimum rating is 0').max(10, 'Maximum rating is 10').nullable(),
  featured: Yup.boolean(),
  tags: Yup.array().of(Yup.string()),
  links: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Link name is required'),
      url: Yup.string().url('Must be a valid URL').required('Link URL is required')
    })
  )
});

const MovieForm = ({ movieId, onCancel }) => {
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();

  // Fetch movie if editing
  const { data: movieData, isLoading } = useQuery(
    ['movie', movieId],
    () => getMovieById(movieId),
    {
      enabled: !!movieId,
      onSuccess: (data) => {
        const movie = data.data.data;
        formik.setValues({
          title: movie.title || '',
          description: movie.description || '',
          image: movie.image || '',
          coverImage: movie.coverImage || '',
          hoverImage: movie.hoverImage || '',
          releaseYear: movie.releaseYear || null,
          duration: movie.duration || '',
          rating: movie.rating || null,
          featured: movie.featured || false,
          tags: movie.tags || [],
          links: movie.links || []
        });
      }
    }
  );

  // Create/Update mutations
  const createMutation = useMutation(createMovie, {
    onSuccess: () => {
      queryClient.invalidateQueries('movies');
      toast.success('Movie created successfully');
      onCancel();
    },
    onError: (error) => {
      toast.error(`Error creating movie: ${error.response?.data?.message || error.message}`);
    }
  });

  const updateMutation = useMutation(
    (data) => updateMovie(movieId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('movies');
        queryClient.invalidateQueries(['movie', movieId]);
        toast.success('Movie updated successfully');
        onCancel();
      },
      onError: (error) => {
        toast.error(`Error updating movie: ${error.response?.data?.message || error.message}`);
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
      releaseYear: null,
      duration: '',
      rating: null,
      featured: false,
      tags: [],
      links: []
    },
    validationSchema: movieSchema,
    onSubmit: (values) => {
      if (movieId) {
        updateMutation.mutate(values);
      } else {
        createMutation.mutate(values);
      }
    }
  });

  // Handle TMDB movie selection
  const handleTmdbMovieSelect = (tmdbMovie) => {
    formik.setValues({
      ...formik.values,
      ...tmdbMovie
    });
    setTabValue(0);
    toast.success('Movie data imported from TMDB');
  };

  // Add empty link
  const handleAddLink = () => {
    formik.setFieldValue('links', [...formik.values.links, { name: '', url: '' }]);
  };

  // Remove link
  const handleRemoveLink = (index) => {
    const newLinks = [...formik.values.links];
    newLinks.splice(index, 1);
    formik.setFieldValue('links', newLinks);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (isLoading) return <Loading message="Loading movie data..." />;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {movieId ? 'Edit Movie' : 'Add New Movie'}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="movie form tabs">
          <Tab label="Movie Details" />
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

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                id="releaseYear"
                name="releaseYear"
                label="Release Year"
                variant="outlined"
                type="number"
                value={formik.values.releaseYear || ''}
                onChange={formik.handleChange}
                error={formik.touched.releaseYear && Boolean(formik.errors.releaseYear)}
                helperText={formik.touched.releaseYear && formik.errors.releaseYear}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                id="duration"
                name="duration"
                label="Duration (e.g., 2h 30min)"
                variant="outlined"
                value={formik.values.duration || ''}
                onChange={formik.handleChange}
                error={formik.touched.duration && Boolean(formik.errors.duration)}
                helperText={formik.touched.duration && formik.errors.duration}
              />
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
                    alt="Movie poster" 
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
                label="Featured Movie"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Video Links</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddLink}
                  variant="outlined"
                >
                  Add Link
                </Button>
              </Box>

              {formik.values.links.map((link, index) => (
                <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Link Name"
                        value={link.name}
                        onChange={(e) => {
                          const newLinks = [...formik.values.links];
                          newLinks[index].name = e.target.value;
                          formik.setFieldValue('links', newLinks);
                        }}
                        error={
                          formik.touched.links?.[index]?.name && 
                          Boolean(formik.errors.links?.[index]?.name)
                        }
                        helperText={
                          formik.touched.links?.[index]?.name && 
                          formik.errors.links?.[index]?.name
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Link URL"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...formik.values.links];
                          newLinks[index].url = e.target.value;
                          formik.setFieldValue('links', newLinks);
                        }}
                        error={
                          formik.touched.links?.[index]?.url && 
                          Boolean(formik.errors.links?.[index]?.url)
                        }
                        helperText={
                          formik.touched.links?.[index]?.url && 
                          formik.errors.links?.[index]?.url
                        }
                        InputProps={{
                          startAdornment: <LinkIcon color="action" sx={{ mr: 1 }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRemoveLink(index)}
                        aria-label="remove link"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
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
                movieId ? 'Update Movie' : 'Create Movie'
              )}
            </Button>
          </Box>
        </Box>
      ) : (
        <TmdbMovieSearch onSelectMovie={handleTmdbMovieSelect} />
      )}
    </Paper>
  );
};

export default MovieForm;