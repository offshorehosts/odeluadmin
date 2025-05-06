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
  MenuItem
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getSeasons, deleteSeason, getShows } from '../api/adminApi';
import { toast } from 'react-toastify';
import Loading from '../components/common/Loading';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SeasonForm from '../components/shows/SeasonForm';

const Seasons = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShowId, setSelectedShowId] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch shows for filter dropdown
  const { data: showsData, isLoading: isLoadingShows } = useQuery(
    'shows-dropdown',
    () => getShows(1, 100, ''),
    {
      select: (data) => data.data.data
    }
  );

  // Fetch seasons with pagination, search and show filter
  const { data, isLoading, error } = useQuery(
    ['seasons', page + 1, rowsPerPage, searchTerm, selectedShowId],
    () => getSeasons(selectedShowId, page + 1, rowsPerPage, searchTerm),
    {
      keepPreviousData: true,
    }
  );

  // Delete season mutation
  const deleteMutation = useMutation(deleteSeason, {
    onSuccess: () => {
      queryClient.invalidateQueries('seasons');
      toast.success('Season deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error deleting season: ${error.response?.data?.message || error.message}`);
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

  const handleShowFilterChange = (event) => {
    setSelectedShowId(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (season) => {
    setSeasonToDelete(season);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (seasonToDelete) {
      deleteMutation.mutate(seasonToDelete._id);
    }
  };

  const handleAdd = () => {
    setSelectedSeasonId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (seasonId) => {
    setSelectedSeasonId(seasonId);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedSeasonId(null);
  };

  if (isFormOpen) {
    return (
      <SeasonForm 
        seasonId={selectedSeasonId} 
        showId={selectedShowId}
        onCancel={handleCancel} 
      />
    );
  }

  if (isLoading) return <Loading message="Loading seasons..." />;
  if (error) return <Typography color="error">Error loading seasons: {error.message}</Typography>;

  const seasons = data?.data?.data || [];
  const totalCount = data?.data?.pagination?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">Seasons</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Season
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="show-filter-label">Filter by Show</InputLabel>
          <Select
            labelId="show-filter-label"
            id="show-filter"
            value={selectedShowId}
            label="Filter by Show"
            onChange={handleShowFilterChange}
            size="small"
          >
            <MenuItem value="">
              <em>All Shows</em>
            </MenuItem>
            {isLoadingShows ? (
              <MenuItem disabled>Loading shows...</MenuItem>
            ) : (
              showsData?.map((show) => (
                <MenuItem key={show._id} value={show._id}>
                  {show.title}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        
        <TextField
          label="Search Seasons"
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
        <Table sx={{ minWidth: 650 }} aria-label="seasons table">
          <TableHead>
            <TableRow>
              <TableCell>Show</TableCell>
              <TableCell>Season</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Release Year</TableCell>
              <TableCell>Episodes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seasons.map((season) => (
              <TableRow key={season._id}>
                <TableCell>
                  {season.showId.title}
                </TableCell>
                <TableCell>Season {season.seasonNumber}</TableCell>
                <TableCell>{season.title}</TableCell>
                <TableCell>{season.releaseYear || 'N/A'}</TableCell>
                <TableCell>{season.episodes?.length || 0}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleEdit(season._id)}
                    aria-label="edit season"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClick(season)}
                    aria-label="delete season"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {seasons.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No seasons found
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
        title="Delete Season"
        message={`Are you sure you want to delete "${seasonToDelete?.title}" from "${seasonToDelete?.showId?.title}"? This will also delete all episodes. This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default Seasons;