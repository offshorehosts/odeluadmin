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
import { searchTvShows, getTvShowDetails, getImageUrl, convertTmdbShowToOdelu } from '../../api/tmdbApi';

const TmdbShowSearch = ({ onSelectShow }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedShowId, setSelectedShowId] = useState(null);

  // Search shows query
  const { 
    data: searchData, 
    isLoading: isSearchLoading,
    refetch: refetchSearch,
    isFetching: isSearchFetching
  } = useQuery(
    ['tmdbShowSearch', searchTerm, page],
    () => searchTvShows(searchTerm, page),
    { 
      enabled: false,
      keepPreviousData: true
    }
  );

  // Get show details query
  const { 
    data: showDetails, 
    isLoading: isDetailsLoading,
    isFetching: isDetailsFetching
  } = useQuery(
    ['tmdbShowDetails', selectedShowId],
    () => getTvShowDetails(selectedShowId),
    { 
      enabled: !!selectedShowId,
      onSuccess: (data) => {
        const formattedShow = convertTmdbShowToOdelu(data.data);
        onSelectShow(formattedShow);
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

  const handleShowSelect = (showId) => {
    setSelectedShowId(showId);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    refetchSearch();
  };

  const shows = searchData?.data?.results || [];
  const totalPages = searchData?.data?.total_pages || 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Search TMDB for TV Shows
      </Typography>
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 3, display: 'flex' }}>
        <TextField
          label="Search for a TV show"
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
          {shows.length > 0 ? (
            <>
              <Grid container spacing={2}>
                {shows.map((show) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={show.id}>
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
                      onClick={() => handleShowSelect(show.id)}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={show.poster_path ? getImageUrl(show.poster_path) : '/placeholder.png'}
                        alt={show.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {show.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <CircularProgress 
                            variant="determinate" 
                            value={show.vote_average * 10} 
                            size={30}
                            sx={{ 
                              color: show.vote_average > 7 ? 'success.main' : 
                                    show.vote_average > 5 ? 'warning.main' : 'error.main'
                            }}
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {show.vote_average.toFixed(1)}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary"
                          disabled={isDetailsLoading || isDetailsFetching || selectedShowId === show.id}
                          onClick={() => handleShowSelect(show.id)}
                        >
                          {isDetailsLoading && selectedShowId === show.id ? (
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
            <Typography>No TV shows found. Try a different search term.</Typography>
          ) : null}
        </>
      )}
    </Box>
  );
};

export default TmdbShowSearch;