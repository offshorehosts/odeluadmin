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
  Chip,
  TablePagination,
  Rating
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getMovies, deleteMovie } from '../../api/adminApi';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';
import ConfirmDialog from '../common/ConfirmDialog';

const MovieList = ({ onEdit, onAdd }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch movies with pagination and search
  const { data, isLoading, error } = useQuery(
    ['movies', page + 1, rowsPerPage, searchTerm],
    () => getMovies(page + 1, rowsPerPage, searchTerm),
    {
      keepPreviousData: true,
      onError: (error) => {
        console.error("Error fetching movies:", error);
        toast.error(`Error loading movies: ${error.message}`);
      }
    }
  );

  // Delete movie mutation
  const deleteMutation = useMutation(deleteMovie, {
    onSuccess: () => {
      queryClient.invalidateQueries('movies');
      toast.success('Movie deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error deleting movie: ${error.response?.data?.message || error.message}`);
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

  const handleDeleteClick = (movie) => {
    setMovieToDelete(movie);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (movieToDelete) {
      deleteMutation.mutate(movieToDelete._id);
    }
  };

  if (isLoading) return <Loading message="Loading movies..." />;
  if (error) return <Typography color="error">Error loading movies: {error.message}</Typography>;

  // Extract data from the response
  const movies = data?.data?.data || [];
  const totalCount = data?.data?.pagination?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">Movies</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Add Movie
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex' }}>
        <TextField
          label="Search Movies"
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
        <Table sx={{ minWidth: 650 }} aria-label="movies table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Release Year</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movies.map((movie) => (
              <TableRow key={movie._id}>
                <TableCell component="th" scope="row">
                  {movie.title}
                </TableCell>
                <TableCell>{movie.releaseYear}</TableCell>
                <TableCell>
                  <Rating 
                    value={movie.rating / 2} 
                    precision={0.5} 
                    readOnly 
                    size="small" 
                  />
                  <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                    ({movie.rating})
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {movie.tags?.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                    {movie.tags?.length > 3 && (
                      <Chip label={`+${movie.tags.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {movie.featured ? 'Yes' : 'No'}
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    onClick={() => onEdit(movie._id)}
                    aria-label="edit movie"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClick(movie)}
                    aria-label="delete movie"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {movies.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No movies found
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
        title="Delete Movie"
        message={`Are you sure you want to delete "${movieToDelete?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default MovieList;