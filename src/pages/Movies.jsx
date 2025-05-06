import React, { useState } from 'react';
import { Box } from '@mui/material';
import MovieList from '../components/movies/MovieList';
import MovieForm from '../components/movies/MovieForm';

const Movies = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const handleAdd = () => {
    setSelectedMovieId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (movieId) => {
    setSelectedMovieId(movieId);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedMovieId(null);
  };

  return (
    <Box>
      {isFormOpen ? (
        <MovieForm 
          movieId={selectedMovieId} 
          onCancel={handleCancel} 
        />
      ) : (
        <MovieList 
          onAdd={handleAdd} 
          onEdit={handleEdit} 
        />
      )}
    </Box>
  );
};

export default Movies;