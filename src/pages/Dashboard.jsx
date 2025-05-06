import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider 
} from '@mui/material';
import { 
  Movie as MovieIcon, 
  Tv as TvIcon, 
  VideoLibrary as EpisodeIcon, 
  People as PeopleIcon 
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { getMovies, getShows, getEpisodes, getUsers } from '../api/adminApi';
import Loading from '../components/common/Loading';
import axios from 'axios';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              bgcolor: `${color}.light`, 
              color: `${color}.main`, 
              p: 1, 
              borderRadius: 1,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  // Fetch counts
  const { data: moviesData, isLoading: isLoadingMovies } = useQuery(
    'movies-count',
    () => getMovies(1, 1),
    {
      select: (data) => data.data.pagination.total,
      onError: (error) => {
        console.error("Error fetching movies count:", error);
        return 0;
      }
    }
  );

  const { data: showsData, isLoading: isLoadingShows } = useQuery(
    'shows-count',
    () => getShows(1, 1),
    {
      select: (data) => data.data.pagination.total,
      onError: (error) => {
        console.error("Error fetching shows count:", error);
        return 0;
      }
    }
  );

  const { data: episodesData, isLoading: isLoadingEpisodes } = useQuery(
    'episodes-count',
    () => getEpisodes(null, 1, 1),
    {
      select: (data) => data.data.pagination.total,
      onError: (error) => {
        console.error("Error fetching episodes count:", error);
        return 0;
      }
    }
  );

  const { data: usersData, isLoading: isLoadingUsers } = useQuery(
    'users-count',
    () => getUsers(1, 1),
    {
      select: (data) => data.data.pagination.total,
      onError: (error) => {
        console.error("Error fetching users count:", error);
        return 0;
      }
    }
  );

  const isLoading = isLoadingMovies || isLoadingShows || isLoadingEpisodes || isLoadingUsers;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {isLoading ? (
        <Loading message="Loading dashboard data..." />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Movies" 
              value={moviesData || 0} 
              icon={<MovieIcon />} 
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="TV Shows" 
              value={showsData || 0} 
              icon={<TvIcon />} 
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Episodes" 
              value={episodesData || 0} 
              icon={<EpisodeIcon />} 
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Users" 
              value={usersData || 0} 
              icon={<PeopleIcon />} 
              color="warning"
            />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Welcome to Odelu Admin Panel
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1">
                This is your central dashboard for managing all content for the Odelu streaming platform.
                Use the sidebar to navigate to different sections:
              </Typography>
              <Box component="ul" sx={{ mt: 2 }}>
                <Typography component="li">
                  <strong>Movies</strong> - Add, edit, and delete movies
                </Typography>
                <Typography component="li">
                  <strong>TV Shows</strong> - Manage TV shows and their details
                </Typography>
                <Typography component="li">
                  <strong>Seasons</strong> - Add and manage seasons for TV shows
                </Typography>
                <Typography component="li">
                  <strong>Episodes</strong> - Add, edit episodes and their streaming links
                </Typography>
                <Typography component="li">
                  <strong>Users</strong> - View and manage user accounts
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;