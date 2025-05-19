// src/redux/features/auth/authAPI.js
import axiosInstance from '../../../services/axios.config';

export const authAPI = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  signup: async (userData) => {
    const response = await axiosInstance.post('/auth/signup', userData);
    return response.data;
  },

  googleLogin: async (token) => {
    const response = await axiosInstance.post('/auth/google', { token });
    return response.data;
  },
  
  authMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/users/update-profile', userData);
    return response.data;
  },
  
  logout: async () => {
    await axiosInstance.post('/auth/logout');
    localStorage.removeItem('token');
  }
};