// src/redux/features/property/propertyAPI.js
import axiosInstance from '../../../services/axios.config';

export const propertyAPI = {
  // Initialize a new property
  initializeProperty: async () => {
    const response = await axiosInstance.post('/properties');
    return response.data;
  },


  // Update property basic-info
  updateBasicInfo: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/basic-info`, data);
    return response.data;
  },
  
  // Update property location
  updateLocation: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/location`, data);
    return response.data;
  },

  // Update property amenities
  updateAmenities: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/amenities`, data);
    return response.data;
  },

  // add property rooms
  addRooms: async (id, data) => {
    const response = await axiosInstance.post(`/properties/${id}/rooms`, data);
    return response.data;
  },

   deleteRoom: async (propertyId, roomId) => {
    return await axiosInstance.delete(`/properties/${propertyId}/rooms/${roomId}`);
  },

  // Update property rooms
  updateRoom: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/rooms/${roomId}`, data);
    return response.data;
  },
  
  // Get all properties (for admin or host)
  getAllProperties: async () => {
    const response = await axiosInstance.get('/properties');
    return response.data;
  },

  getDraftProperties: async () => {
    const response = await axiosInstance.get('/properties/draft');
    return response.data;
  },
  
  // Get single property
  getProperty: async (id) => {
    const response = await axiosInstance.get(`/properties/${id}`);
    return response.data;
  },

  // Finalize property
  finalizeProperty: async (id) => {
    const response = await axiosInstance.put(`/properties/${id}/finalize`);
    return response.data;
  },
  
  // Delete property
  deleteProperty: async (id) => {
    const response = await axiosInstance.delete(`/properties/${id}`);
    return response.data;
  },
  
  // Get properties by state
  getPropertiesByState: async (state) => {
    const response = await axiosInstance.get(`/properties/state/${state}`);
    return response.data;
  },
  
  // Get properties by city
  getPropertiesByCity: async (city) => {
    const response = await axiosInstance.get(`/properties/city/${city}`);
    return response.data;
  },
  
  // Search properties with filters
  searchProperties: async (filters) => {
    const response = await axiosInstance.get('/properties/search', { params: filters });
    return response.data;
  },
  
  // Get featured properties
  getFeaturedProperties: async () => {
    const response = await axiosInstance.get('/properties/featured');
    return response.data;
  },
  
  // Check property availability
  checkPropertyAvailability: async (id, params) => {
    const response = await axiosInstance.get(`/properties/${id}/availability`, { params });
    return response.data;
  },
  
  // Get user's properties
  getUserProperties: async () => {
    const response = await axiosInstance.get('/properties/my-properties');
    return response.data;
  }
};