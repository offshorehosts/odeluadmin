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
  FormHelperText
} from '@mui/material';
import { 
  Save as SaveIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getSeasonById, createSeason, updateSeason, getShows } from '../../api/adminApi';
import { getTvSeasonDetails, convertTmdbSeasonToOdelu } from '../../api/tmdbApi';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';

// Validation schema
const seasonSchema = Yup.object({
  showId: Yup.string().required('Show is required'),
  seasonNumber: Yup.number().required('Season number is required').positive('Must be positive'),
  title: Yup.string().required('Title is required'),
  releaseYear: Yup.number().integer('Must be a year').nullable()
});

const SeasonForm = ({ seasonId, showId: initialShowId, onCancel }) => {
  const [tmdbShowId, setTmdbShowId] = useState('');
  const [tmdbSeasonNumber, setTmdbSeasonNumber] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch shows for dropdown
  const { data: showsData, isLoading: isLoadingShows } = useQuery(
    'shows-dropdown',
    () => getShows(1, 100, ''),
    {
      select: (data) => data.data.data
    }
  );

  // Fetch season if editing
  const { data: seasonData, isLoading: isLoadingSeason } = useQuery(
    ['season', seasonId],
    () => getSeasonById(seasonId),
    {
      enabled: !!seasonId,
      onSuccess: (data) => {
        const season = data.data.data;
        formik.setValues({
          showId: season.showId,
          seasonNumber: season.seasonNumber,
          title: season.title,
          releaseYear: season.releaseYear
        });
      }
    }
  );

  // Create/Update mutations
  const createMutation = useMutation(
    (data) => createSeason(data.showId, {
      seasonNumber: data.seasonNumber,
      title: data.title,
      releaseYear: data.releaseYear
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('seasons');
        toast.success('Season created successfully');
        onCancel();
      },
      onError: (error) => {
        toast.error(`Error creating season: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  const updateMutation = useMutation(
    (data) => updateSeason(seasonId, {
      seasonNumber: data.seasonNumber,
      title: data.title,
      releaseYear: data.releaseYear
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('seasons');
        queryClient.invalidateQueries(['season', seasonId]);
        toast.success('Season updated successfully');
        onCancel();
      },
      onError: (error) => {
        toast.error(`Error updating season: ${error.response?.data?.message || error.message}`);
      }
    }
  );

  // Form handling
  const formik = useFormik({
    initialValues: {
      showId: initialShowId || '',
      seasonNumber: 1,
      title: '',
      releaseYear: null
    },
    validationSchema: seasonSchema,
    onSubmit: (values) => {
      if (seasonId) {
        updateMutation.mutate(values);
      } else {
        createMutation.mutate(values);
      }
    }
  });

  // Import from TMDB
  const handleImportFromTmdb = async () => {
    if (!tmdbShowId || !tmdbSeasonNumber) {
      toast.error('Please enter both TMDB Show ID and Season Number');
      return;
    }

    setIsImporting(true);
    try {
      const response = await getTvSeasonDetails(tmdbShowId, tmdbSeasonNumber);
      const tmdbSeason = response.data;
      
      const formattedSeason = convertTmdbSeasonToOdelu(tmdbSeason, formik.values.showId);
      
      formik.setValues({
        ...formik.values,
        seasonNumber: formattedSeason.seasonNumber,
        title: formattedSeason.title,
        releaseYear: formattedSeason.releaseYear
      });
      
      toast.success('Season data imported from TMDB');
    } catch (error) {
      toast.error(`Error importing from TMDB: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoadingSeason) return <Loading message="Loading season data..." />;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {seasonId ? 'Edit Season' : 'Add New Season'}
      </Typography>

      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl 
              fullWidth 
              error={formik.touched.showId && Boolean(formik.errors.showId)}
              disabled={!!seasonId} // Disable if editing
            >
              <InputLabel id="show-label">Show</InputLabel>
              <Select
                labelId="show-label"
                id="showId"
                name="showId"
                value={formik.values.showId}
                label="Show"
                onChange={formik.handleChange}
              >
                {isLoadingShows ? (
                  <MenuItem value="">
                    <CircularProgress size={20} /> Loading...
                  </MenuItem>
                ) : (
                  showsData?.map((show) => (
                    <MenuItem key={show._id} value={show._id}>
                      {show.title}
                    </MenuItem>
                  ))
                )}
              </Select>
              {formik.touched.showId && formik.errors.showId && (
                <FormHelperText>{formik.errors.showId}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              id="seasonNumber"
              name="seasonNumber"
              label="Season Number"
              variant="outlined"
              type="number"
              value={formik.values.seasonNumber}
              onChange={formik.handleChange}
              error={formik.touched.seasonNumber && Boolean(formik.errors.seasonNumber)}
              helperText={formik.touched.seasonNumber && formik.errors.seasonNumber}
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Season Title"
              variant="outlined"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
          </Grid>

          {!seasonId && formik.values.showId && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Import from TMDB
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="TMDB Show ID"
                      variant="outlined"
                      value={tmdbShowId}
                      onChange={(e) => setTmdbShowId(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
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
                  <Grid item xs={12} sm={4}>
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
              seasonId ? 'Update Season' : 'Create Season'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default SeasonForm;