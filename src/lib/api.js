import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Development
export const API_BASE = 'http://localhost:4000'; // for local testing

// Production (after deploying to Vercel)
// export const API_BASE = 'https://your-ecommerce-backend.vercel.app';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add token to requests automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage
      await AsyncStorage.multiRemove(['token', 'user']);
      // You can navigate to login screen here
    }
    return Promise.reject(error);
  }
);