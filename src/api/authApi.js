import axios from 'axios';

// Simple function to verify the admin API key
export const verifyApiKey = async (apiKey) => {
  try {
    const response = await axios.get('https://odeluapi.onrender.com/api/admin/users?limit=1', {
      headers: {
        'x-api-key': apiKey
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Invalid API key or server error'
    };
  }
};