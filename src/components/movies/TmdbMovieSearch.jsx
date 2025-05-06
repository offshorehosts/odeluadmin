import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  CircularProgress,
  Pagination
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { searchMovies, getMovieDetails, getImageUrl, convertTmdbMovieToOdelu } from '../../api/tmdbApi';

const TmdbMovieSearch = ({ onSelectMovie }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // Search movies query
  const { 
    data: searchData, 
    isLoading: isSearchLoading,
    refetch: refetchSearch,
    isFetching: isSearchFetching
  } = useQuery(
    ['tmdbMovieSearch', searchTerm, page],
    () => searchMovies(searchTerm, page),
    { 
      enabled: false,
      keepPreviousData: true
    }
  );

  // Get movie details query
  const { 
    data: movieDetails, 
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching
  } = useQuery(
    ['tmdbMovieDetails', selectedMovieId],
    () => getMovieDetails(selectedMovieId),
    { 
      enabled: !!selectedMovieId,
      onSuccess: (data) => {
        const formattedMovie = convertTmdbMovieToOdelu(data.data);
        onSelectMovie(formattedMovie);
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setPage(1);
      refetchSearch();
    }
  };

  const handleMovieSelect = (movieId) => {
    setSelectedMovieId(movieId);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    refetchSearch();
  };

  const movies = searchData?.data?.results || [];
  const totalPages = searchData?.data?.total_pages || 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Search TMDB for Movies
      </Typography>
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 3, display: 'flex' }}>
        <TextField
          label="Search for a movie"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mr: 1 }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          startIcon={<SearchIcon />}
          disabled={isSearchLoading || isSearchFetching}
        >
          {(isSearchLoading || isSearchFetching) ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </Box>

      {isSearchLoading || isSearchFetching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {movies.length > 0 ? (
            <>
              <Grid container spacing={2}>
                {movies.map((movie) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleMovieSelect(movie.id)}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={movie.poster_path ? getImageUrl(movie.poster_path) : '/placeholder.png'}
                        alt={movie.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {movie.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <CircularProgress 
                            variant="determinate" 
                            value={movie.vote_average * 10} 
                            size={30}
                            sx={{ 
                              color: movie.vote_average > 7 ? 'success.main' : 
                                    movie.vote_average > 5 ? 'warning.main' : 'error.main'
                            }}
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {movie.vote_average.toFixed(1)}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary"
                          disabled={isDetailsLoading || isDetailsFetching || selectedMovieId === movie.id}
                          onClick={() => handleMovieSelect(movie.id)}
                        >
                          {isDetailsLoading && selectedMovieId === movie.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            'Select'
                          )}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination 
                    count={Math.min(totalPages, 10)} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary" 
                  />
                </Box>
              )}
            </>
          ) : searchData ? (
            <Typography>No movies found. Try a different search term.</Typography>
          ) : null}
        </>
      )}
    </Box>
  );
};

export default TmdbMovieSearch;