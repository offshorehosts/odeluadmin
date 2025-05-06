import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY; 
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const searchMovies = (query, page = 1) => 
  tmdbApi.get('/search/movie', { params: { query, page } });

export const getMovieDetails = (id) => 
  tmdbApi.get(`/movie/${id}`);

export const searchTvShows = (query, page = 1) => 
  tmdbApi.get('/search/tv', { params: { query, page } });

export const getTvShowDetails = (id) => 
  tmdbApi.get(`/tv/${id}`);

export const getTvSeasonDetails = (showId, seasonNumber) => 
  tmdbApi.get(`/tv/${showId}/season/${seasonNumber}`);

// Helper functions for image URLs
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Convert TMDB movie to our format
export const convertTmdbMovieToOdelu = (tmdbMovie) => {
  return {
    title: tmdbMovie.title,
    description: tmdbMovie.overview,
    releaseYear: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : null,
    duration: `${Math.floor(tmdbMovie.runtime / 60)}h ${tmdbMovie.runtime % 60}min`,
    rating: tmdbMovie.vote_average,
    tags: tmdbMovie.genres?.map(genre => genre.name) || [],
    image: getImageUrl(tmdbMovie.poster_path),
    coverImage: getImageUrl(tmdbMovie.backdrop_path, 'original'),
    hoverImage: getImageUrl(tmdbMovie.poster_path, 'w780'),
    featured: tmdbMovie.vote_average > 7.5, // Automatically feature highly rated movies
    links: []
  };
};

// Convert TMDB TV show to our format
export const convertTmdbShowToOdelu = (tmdbShow) => {
  return {
    title: tmdbShow.name,
    description: tmdbShow.overview,
    startYear: tmdbShow.first_air_date ? parseInt(tmdbShow.first_air_date.split('-')[0]) : null,
    endYear: tmdbShow.status === 'Ended' && tmdbShow.last_air_date ? 
      parseInt(tmdbShow.last_air_date.split('-')[0]) : null,
    status: tmdbShow.status || 'Ongoing',
    rating: tmdbShow.vote_average,
    tags: tmdbShow.genres?.map(genre => genre.name) || [],
    image: getImageUrl(tmdbShow.poster_path),
    coverImage: getImageUrl(tmdbShow.backdrop_path, 'original'),
    hoverImage: getImageUrl(tmdbShow.poster_path, 'w780'),
    featured: tmdbShow.vote_average > 7.5,
    seasons: []
  };
};

// Convert TMDB season to our format
export const convertTmdbSeasonToOdelu = (tmdbSeason, showId) => {
  return {
    showId: showId,
    seasonNumber: tmdbSeason.season_number,
    title: tmdbSeason.name || `Season ${tmdbSeason.season_number}`,
    releaseYear: tmdbSeason.air_date ? parseInt(tmdbSeason.air_date.split('-')[0]) : null,
    episodes: []
  };
};

// Convert TMDB episode to our format
export const convertTmdbEpisodeToOdelu = (tmdbEpisode, seasonId) => {
  return {
    seasonId: seasonId,
    episodeNumber: tmdbEpisode.episode_number,
    title: tmdbEpisode.name,
    description: tmdbEpisode.overview,
    image: getImageUrl(tmdbEpisode.still_path),
    duration: '0', // TMDB doesn't provide episode duration
    links: []
  };
};

export default tmdbApi;
