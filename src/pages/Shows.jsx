import React, { useState } from 'react';
import { Box } from '@mui/material';
import ShowList from '../components/shows/ShowList';
import ShowForm from '../components/shows/ShowForm';

const Shows = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedShowId, setSelectedShowId] = useState(null);

  const handleAdd = () => {
    setSelectedShowId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (showId) => {
    setSelectedShowId(showId);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedShowId(null);
  };

  return (
    <Box>
      {isFormOpen ? (
        <ShowForm 
          showId={selectedShowId} 
          onCancel={handleCancel} 
        />
      ) : (
        <ShowList 
          onAdd={handleAdd} 
          onEdit={handleEdit} 
        />
      )}
    </Box>
  );
};

export default Shows;