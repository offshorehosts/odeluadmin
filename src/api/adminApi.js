import axios from 'axios';

const API_BASE_URL = 'https://odeluapi.onrender.com/api'; // Update this to your actual API URL

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include API key
adminApi.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('adminApiKey');
    if (apiKey) {
      config.headers['x-api-key'] = apiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Movies
export const getMovies = (page = 1, limit = 20, search = '') => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (search) params.append('search', search);
  
  return axios.get(`${API_BASE_URL}/movies?${params}`);
};

export const getMovieById = (id) => 
  axios.get(`${API_BASE_URL}/movies/${id}`);

export const createMovie = (movieData) => 
  adminApi.post('/admin/movies', movieData);

export const updateMovie = (id, movieData) => 
  adminApi.put(`/admin/movies/${id}`, movieData);

export const deleteMovie = (id) => 
  adminApi.delete(`/admin/movies/${id}`);

// Shows
export const getShows = (page = 1, limit = 20, search = '') => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (search) params.append('search', search);
  
  return axios.get(`${API_BASE_URL}/shows?${params}`);
};

export const getShowById = (id) => 
  axios.get(`${API_BASE_URL}/shows/${id}`);

export const createShow = (showData) => 
  adminApi.post('/admin/shows', showData);

export const updateShow = (id, showData) => 
  adminApi.put(`/admin/shows/${id}`, showData);

export const deleteShow = (id) => 
  adminApi.delete(`/admin/shows/${id}`);

// Seasons
export const getSeasons = (showId = null, page = 1, limit = 20, search = '') => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (search) params.append('search', search);
  if (showId) params.append('showId', showId);
  
  return adminApi.get(`/admin/seasons?${params}`);
};

export const getSeasonById = (id) => 
  adminApi.get(`/admin/seasons/${id}`);

export const createSeason = (showId, seasonData) => 
  adminApi.post(`/admin/shows/${showId}/seasons`, seasonData);

export const updateSeason = (id, seasonData) => 
  adminApi.put(`/admin/seasons/${id}`, seasonData);

export const deleteSeason = (id) => 
  adminApi.delete(`/admin/seasons/${id}`);

// Episodes
export const getEpisodes = (seasonId = null, page = 1, limit = 20, search = '') => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (search) params.append('search', search);
  if (seasonId) params.append('seasonId', seasonId);
  
  return adminApi.get(`/admin/episodes?${params}`);
};

export const getEpisodeById = (id) => 
  axios.get(`${API_BASE_URL}/shows/episode/${id}`);

export const createEpisode = (seasonId, episodeData) => 
  adminApi.post(`/admin/seasons/${seasonId}/episodes`, episodeData);

export const updateEpisode = (id, episodeData) => 
  adminApi.put(`/admin/episodes/${id}`, episodeData);

export const deleteEpisode = (id) => 
  adminApi.delete(`/admin/episodes/${id}`);

// Users
export const getUsers = (page = 1, limit = 20, search = '') => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (search) params.append('search', search);
  
  return adminApi.get(`/admin/users?${params}`);
};

export const getUserById = (id) => 
  adminApi.get(`/admin/users/${id}`);

export const updateUser = (id, userData) => 
  adminApi.put(`/admin/users/${id}`, userData);

export const deleteUser = (id) => 
  adminApi.delete(`/admin/users/${id}`);

export default adminApi;