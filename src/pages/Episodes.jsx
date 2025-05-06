import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getEpisodes, deleteEpisode, getSeasons } from '../api/adminApi';
import { toast } from 'react-toastify';
import Loading from '../components/common/Loading';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EpisodeForm from '../components/shows/EpisodeForm';

const Episodes = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [episodeToDelete, setEpisodeToDelete] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch seasons for filter dropdown
  const { data: seasonsData, isLoading: isLoadingSeasons } = useQuery(
    'seasons-dropdown',
    () => getSeasons(null, 1, 100, ''),
    {
      select: (data) => data.data.data
    }
  );

  // Fetch episodes with pagination, search and season filter
  const { data, isLoading, error } = useQuery(
    ['episodes', page + 1, rowsPerPage, searchTerm, selectedSeasonId],
    () => getEpisodes(selectedSeasonId, page + 1, rowsPerPage, searchTerm),
    {
      keepPreviousData: true,
    }
  );

  // Delete episode mutation
  const deleteMutation = useMutation(deleteEpisode, {
    onSuccess: () => {
      queryClient.invalidateQueries('episodes');
      toast.success('Episode deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error deleting episode: ${error.response?.data?.message || error.message}`);
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

  const handleSeasonFilterChange = (event) => {
    setSelectedSeasonId(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (episode) => {
    setEpisodeToDelete(episode);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (episodeToDelete) {
      deleteMutation.mutate(episodeToDelete._id);
    }
  };

  const handleAdd = () => {
    setSelectedEpisodeId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (episodeId) => {
    setSelectedEpisodeId(episodeId);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedEpisodeId(null);
  };

  if (isFormOpen) {
    return (
      <EpisodeForm 
        episodeId={selectedEpisodeId} 
        seasonId={selectedSeasonId}
        onCancel={handleCancel} 
      />
    );
  }

  if (isLoading) return <Loading message="Loading episodes..." />;
  if (error) return <Typography color="error">Error loading episodes: {error.message}</Typography>;

  const episodes = data?.data?.data || [];
  const totalCount = data?.data?.pagination?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">Episodes</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Episode
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="season-filter-label">Filter by Season</InputLabel>
          <Select
            labelId="season-filter-label"
            id="season-filter"
            value={selectedSeasonId}
            label="Filter by Season"
            onChange={handleSeasonFilterChange}
            size="small"
          >
            <MenuItem value="">
              <em>All Seasons</em>
            </MenuItem>
            {isLoadingSeasons ? (
              <MenuItem disabled>Loading seasons...</MenuItem>
            ) : (
              seasonsData?.map((season) => (
                <MenuItem key={season._id} value={season._id}>
                  {season.showId.title} - {season.title}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        
        <TextField
          label="Search Episodes"
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: <SearchIcon color="action" />,
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="episodes table">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Show & Season</TableCell>
              <TableCell>Episode</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Links</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {episodes.map((episode) => (
              <TableRow key={episode._id}>
                <TableCell>
                  <Avatar
                    src={episode.image}
                    alt={episode.title}
                    variant="rounded"
                    sx={{ width: 60, height: 40 }}
                  />
                </TableCell>
                <TableCell>
                  {episode.seasonId.showId.title} - {episode.seasonId.seasonNumber}
                </TableCell>
                <TableCell>Episode {episode.episodeNumber}</TableCell>
                <TableCell>{episode.title}</TableCell>
                <TableCell>{episode.duration || 'N/A'}</TableCell>
                <TableCell>{episode.links?.length || 0} links</TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleEdit(episode._id)}
                    aria-label="edit episode"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClick(episode)}
                    aria-label="delete episode"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {episodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No episodes found
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
        title="Delete Episode"
        message={`Are you sure you want to delete "${episodeToDelete?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default Episodes;