import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Divider
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
import { getEpisodeById, createEpisode, updateEpisode, getSeasons } from '../../api/adminApi';
import { getTvSeasonDetails, convertTmdbEpisodeToOdelu } from '../../api/tmdbApi';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

// Validation schema
const episodeSchema = Yup.object({
  seasonId: Yup.string().required('Season is required'),
  episodeNumber: Yup.number().required('Episode number is required').positive('Must be positive'),
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  image: Yup.string().url('Must be a valid URL'),
  duration: Yup.string(),
  links: Yup.array().of(
    Yup.object({
      name: Yup.string().required('Link name is required'),
      url: Yup.string().url('Must be a valid URL').required('Link URL is required')
    })
  )
});

const EpisodeForm = ({ episodeId, seasonId: initialSeasonId, onCancel }) => {
  const [tmdbShowId, setTmdbShowId] = useState('');
  const [tmdbSeasonNumber, setTmdbSeasonNumber] = useState(1);
  const [tmdbEpisodeNumber, setTmdbEpisodeNumber] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch seasons for dropdown
  const { data: seasonsData, isLoading: isLoadingSeasons } = useQuery(
    'seasons-dropdown',
    () => getSeasons(null, 1, 100, ''),
    {
      select: (data) => data.data.data
    }
  );

  // Fetch episode if editing
  const { data: episodeData, isLoading: isLoadingEpisode } = useQuery(
    ['episode', episodeId],
    () => getEpisodeById(episodeId),
    {
      enabled: !!episodeId,
      onSuccess: (data) => {
        const episode = data.data.data;
        formik.setValues({
          seasonId: episode.seasonId._id,
          episodeNumber: episode.episodeNumber,
          title: episode.title,
          description: episode.description || '',
          image: episode.image || '',
          duration: episode.duration || '',
          links: episode.links || []
        });
      }
    }
  );

  // Create/Update mutations
  const createMutation = useMutation(
    (data) => createEpisode(data.seasonId, {
      episodeNumber: data.episodeNumber,
      title: data.title,
      description: data.description,
      image: data.image,
      duration: data.duration,
      links: data.links
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('episodes');
        toast.success('Episode created successfully');
        onCancel();
      },
      onError: (error) => {
        toast.error(`Error creating episode: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  const updateMutation = useMutation(
    (data) => updateEpisode(episodeId, {
      episodeNumber: data.episodeNumber,
      title: data.title,
      description: data.description,
      image: data.image,
      duration: data.duration,
      links: data.links
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('episodes');
        queryClient.invalidateQueries(['episode', episodeId]);
        toast.success('Episode updated successfully');
        onCancel();
      },
      onError: (error) => {
        toast.error(`Error updating episode: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  // Form handling
  const formik = useFormik({
    initialValues: {
      seasonId: initialSeasonId || '',
      episodeNumber: 1,
      title: '',
      description: '',
      image: '',
      duration: '',
      links: []
    },
    validationSchema: episodeSchema,
    onSubmit: (values) => {
      if (episodeId) {
        updateMutation.mutate(values);
      } else {
        createMutation.mutate(values);
      }
    }
  });

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

  // Import from TMDB
  const handleImportFromTmdb = async () => {
    if (!tmdbShowId || !tmdbSeasonNumber || !tmdbEpisodeNumber) {
      toast.error('Please enter TMDB Show ID, Season Number, and Episode Number');
      return;
    }

    setIsImporting(true);
    try {
      const response = await getTvSeasonDetails(tmdbShowId, tmdbSeasonNumber);
      const tmdbSeason = response.data;
      
      const tmdbEpisode = tmdbSeason.episodes.find(
        ep => ep.episode_number === parseInt(tmdbEpisodeNumber)
      );
      
      if (!tmdbEpisode) {
        toast.error(`Episode ${tmdbEpisodeNumber} not found in season ${tmdbSeasonNumber}`);
        setIsImporting(false);
        return;
      }
      
      const formattedEpisode = convertTmdbEpisodeToOdelu(tmdbEpisode, formik.values.seasonId);
      
      formik.setValues({
        ...formik.values,
        episodeNumber: formattedEpisode.episodeNumber,
        title: formattedEpisode.title,
        description: formattedEpisode.description,
        image: formattedEpisode.image,
        links: formik.values.links // Keep existing links
      });
      
      toast.success('Episode data imported from TMDB');
    } catch (error) {
      toast.error(`Error importing from TMDB: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoadingEpisode) return <Loading message="Loading episode data..." />;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {episodeId ? 'Edit Episode' : 'Add New Episode'}
      </Typography>

      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl 
              fullWidth 
              error={formik.touched.seasonId && Boolean(formik.errors.seasonId)}
              disabled={!!episodeId} // Disable if editing
            >
              <InputLabel id="season-label">Season</InputLabel>
              <Select
                labelId="season-label"
                id="seasonId"
                name="seasonId"
                value={formik.values.seasonId}
                label="Season"
                onChange={formik.handleChange}
              >
                {isLoadingSeasons ? (
                  <MenuItem value="">
                    <CircularProgress size={20} /> Loading...
                  </MenuItem>
                ) : (
                  seasonsData?.map((season) => (
                    <MenuItem key={season._id} value={season._id}>
                      {season.showId.title} - {season.title}
                    </MenuItem>
                  ))
                )}
              </Select>
              {formik.touched.seasonId && formik.errors.seasonId && (
                <FormHelperText>{formik.errors.seasonId}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              id="episodeNumber"
              name="episodeNumber"
              label="Episode Number"
              variant="outlined"
              type="number"
              value={formik.values.episodeNumber}
              onChange={formik.handleChange}
              error={formik.touched.episodeNumber && Boolean(formik.errors.episodeNumber)}
              helperText={formik.touched.episodeNumber && formik.errors.episodeNumber}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              id="duration"
              name="duration"
              label="Duration (e.g., 45:00)"
              variant="outlined"
              value={formik.values.duration}
              onChange={formik.handleChange}
              error={formik.touched.duration && Boolean(formik.errors.duration)}
              helperText={formik.touched.duration && formik.errors.duration}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Episode Title"
              variant="outlined"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
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
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="image"
              name="image"
              label="Image URL (Episode Screenshot)"
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
                  alt="Episode screenshot" 
                  style={{ maxHeight: '100px', maxWidth: '100%' }} 
                  onError={(e) => { e.target.src = '/placeholder.png' }}
                />
              </Box>
            )}
          </Grid>

          {!episodeId && formik.values.seasonId && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Import from TMDB
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="TMDB Show ID"
                      variant="outlined"
                      value={tmdbShowId}
                      onChange={(e) => setTmdbShowId(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Season Number"
                      variant="outlined"
                      type="number"
                      value={tmdbSeasonNumber}
                      onChange={(e) => setTmdbSeasonNumber(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Episode Number"
                      variant="outlined"
                      type="number"
                      value={tmdbEpisodeNumber}
                      onChange={(e) => setTmdbEpisodeNumber(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      variant="contained"
                      onClick={handleImportFromTmdb}
                      disabled={isImporting}
                      fullWidth
                    >
                      {isImporting ? <CircularProgress size={24} /> : 'Import'}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

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
              episodeId ? 'Update Episode' : 'Create Episode'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EpisodeForm;