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
import { getShows, deleteShow } from '../../api/adminApi';
import { toast } from 'react-toastify';
import Loading from '../common/Loading';
import ConfirmDialog from '../common/ConfirmDialog';

const ShowList = ({ onEdit, onAdd }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showToDelete, setShowToDelete] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch shows with pagination and search
  const { data, isLoading, error } = useQuery(
    ['shows', page + 1, rowsPerPage, searchTerm],
    () => getShows(page + 1, rowsPerPage, searchTerm),
    {
      keepPreviousData: true,
      onError: (error) => {
        console.error("Error fetching shows:", error);
        toast.error(`Error loading shows: ${error.message}`);
      }
    }
  );

  // Delete show mutation
  const deleteMutation = useMutation(deleteShow, {
    onSuccess: () => {
      queryClient.invalidateQueries('shows');
      toast.success('Show deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error deleting show: ${error.response?.data?.message || error.message}`);
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

  const handleDeleteClick = (show) => {
    setShowToDelete(show);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (showToDelete) {
      deleteMutation.mutate(showToDelete._id);
    }
  };

  if (isLoading) return <Loading message="Loading shows..." />;
  if (error) return <Typography color="error">Error loading shows: {error.message}</Typography>;

  // Extract data from the response
  const shows = data?.data?.data || [];
  const totalCount = data?.data?.pagination?.total || 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">TV Shows</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Add Show
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex' }}>
        <TextField
          label="Search Shows"
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
        <Table sx={{ minWidth: 650 }} aria-label="shows table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Years</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shows.map((show) => (
              <TableRow key={show._id}>
                <TableCell component="th" scope="row">
                  {show.title}
                </TableCell>
                <TableCell>
                  {show.startYear}{show.endYear ? ` - ${show.endYear}` : ''}
                </TableCell>
                <TableCell>{show.status}</TableCell>
                <TableCell>
                  <Rating 
                    value={show.rating / 2} 
                    precision={0.5} 
                    readOnly 
                    size="small" 
                  />
                  <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                    ({show.rating})
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {show.tags?.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                    {show.tags?.length > 3 && (
                      <Chip label={`+${show.tags.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {show.featured ? 'Yes' : 'No'}
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    onClick={() => onEdit(show._id)}
                    aria-label="edit show"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteClick(show)}
                    aria-label="delete show"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {shows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No shows found
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
        title="Delete Show"
        message={`Are you sure you want to delete "${showToDelete?.title}"? This will also delete all seasons and episodes. This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Box>
  );
};

export default ShowList;