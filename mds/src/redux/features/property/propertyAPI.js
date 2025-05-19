// src/redux/features/property/propertyAPI.js
import axiosInstance from '../../../services/axios.config';

export const propertyAPI = {
  // Initialize a new property
  initializeProperty: async () => {
    const response = await axiosInstance.post('/properties');
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
  
  // Update property steps
  updatePropertyStep1: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/step1`, data);
    return response.data;
  },
  
  updatePropertyStep2: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/step2`, data);
    return response.data;
  },
  
  updatePropertyStep3: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/step3`, data);
    return response.data;
  },
  
  updatePropertyStep4: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/step4`, data);
    return response.data;
  },
  
  updatePropertyStep5: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/step5`, data);
    return response.data;
  },
  
  updatePropertyStep6: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/step6`, data);
    return response.data;
  },
  
  updatePropertyStep7: async (id, formData) => {
    const response = await axiosInstance.put(
      `/properties/${id}/step7`, 
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
  
  updatePropertyStep8: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/step8`, data);
    return response.data;
  },
  
  updatePropertyStep9: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/step9`, data);
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