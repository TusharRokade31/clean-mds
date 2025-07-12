// src/redux/features/property/propertyAPI.js
import axiosInstance from '../../../services/axios.config';

export const propertyAPI = {
  // Initialize a new property
  initializeProperty: async (forceNew) => {
    const response = await axiosInstance.post('/properties', {forceNew} );
    return response.data;
  },


  // Update property basic-info
  updateBasicInfo: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/basic-info`, data);
    return response.data;
  },

  sendEmailOTP : async (propertyId, data) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/send-otp`, data);
  return response.data;
  },

  checkEmailVerificationStatus: async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}/email-verification-status`);
  return response.data;
 },

  verifyEmailOTP: async (propertyId, data) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/verify-otp`, data);
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
    const response = await axiosInstance.delete(`/properties/${propertyId}/rooms/${roomId}`);
    return response.data;
  },

  // Update property rooms
  updateRoom: async (id, roomId, data) => {
    const response = await axiosInstance.put(`/properties/${id}/rooms/${roomId}`, data);
    return response.data;
  },


 uploadRoomMedia: async (propertyId, roomId, formData) => {
    const response = await axiosInstance.post(`/properties/${propertyId}/rooms/${roomId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRoomMediaItem: async (propertyId, roomId, mediaId, data) => {
    const response = await axiosInstance.put(`/properties/${propertyId}/rooms/${roomId}/media/${mediaId}`, data);
    return response.data;
  },

  deleteRoomMediaItem: async (propertyId, roomId, mediaId) => {
    const response = await axiosInstance.delete(`/properties/${propertyId}/rooms/${roomId}/media/${mediaId}`);
    return response.data;
  },

  getRoomMedia: async (propertyId, roomId, params = {}) => {
    const response = await axiosInstance.get(`/properties/${propertyId}/rooms/${roomId}/media`, { params });
    return response.data;
  },


    // Media upload methods
  uploadPropertyMedia: async (propertyId, formData) => {
    const response = await axiosInstance.post(`/properties/${propertyId}/media/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateMediaItem: async (propertyId, mediaId, data) => {
    const response = await axiosInstance.put(`/properties/${propertyId}/media/${mediaId}`, data);
    return response.data;
  },

  deleteMediaItem: async (propertyId, mediaId) => {
    const response = await axiosInstance.delete(`/properties/${propertyId}/media/${mediaId}`);
    return response.data;
  },

  getMediaByTags: async (propertyId, params) => {
    const response = await axiosInstance.get(`/properties/${propertyId}/media`, { params });
    return response.data;
  },

  completeMediaStep: async (propertyId) => {
    const response = await axiosInstance.put(`/properties/${propertyId}/media/complete`);
    return response.data;
  },


  completeRoomsStep: async (propertyId) => {
    const response = await axiosInstance.put(`/properties/${propertyId}/rooms/complete`);
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

   getSuggestions: async (query) => {
    const response = await axiosInstance.get(`/properties/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  },


   getPropertiesByQuery: async (queryParams) => {
    const { location, checkin, checkout, persons, skip = 0, limit = 10 } = queryParams;
     const response = await axiosInstance.get(`/properties/property-listing?location=${encodeURIComponent(location)}&checkin=${checkin}&checkout=${checkout}&persons=${persons}&skip=${skip}&limit=${limit}`);
     return response.data
  },


  // Finalize property
  reviewProperty: async (id, status) => {
    const response = await axiosInstance.put(`/properties/${id}/review`, status);
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
  

  // Custom Policy APIs
addCustomPolicy : async (propertyId, data) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/custom-policies`, data);
  return response.data;
},

updateCustomPolicy : async (propertyId, policyId, data) => {
  const response = await axiosInstance.put(`/properties/${propertyId}/custom-policies/${policyId}`, data);
  return response.data;
},

deleteCustomPolicy : async (propertyId, policyId) => {
  const response = await axiosInstance.delete(`/properties/${propertyId}/custom-policies/${policyId}`);
  return response.data;
},

// Privacy Policy APIs
getPrivacyPolicyTemplate: async () => {
  const response = await axiosInstance.get('/properties/template/privacy-policy');
  return response.data;
},

getPrivacyPolicy: async (propertyId) => {
  const response = await axiosInstance.get(`/properties/${propertyId}/privacy-policy`);
  return response.data;
},

createOrUpdatePrivacyPolicy: async (propertyId, data) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/privacy-policy`, data);
  return response.data;
},

updatePrivacyPolicySection: async (propertyId, section, data) => {
  const response = await axiosInstance.put(`/properties/${propertyId}/privacy-policy/section`, {
    section,
    data
  });
  return response.data;
},


completePrivacyPolicyStep: async (propertyId) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/privacy-policy/complete-step`);
  return response.data;
},


getPrivacyPolicyHistory: async (propertyId) => {
  const response = await axiosInstance.get(`/properties/${propertyId}/privacy-policy/history`);
  return response.data;
},

deletePrivacyPolicy: async (propertyId) => {
  const response = await axiosInstance.delete(`/properties/${propertyId}/privacy-policy`);
  return response.data;
},


getFinanceLegal: async (propertyId) => {
  const response = await axiosInstance.get(`/properties/${propertyId}/finance-legal`);
  return response.data;
},

updateFinanceDetails: async (propertyId, data) => {
  const response = await axiosInstance.put(`/properties/${propertyId}/finance`, data);
  return response.data;
},

updateLegalDetails: async (propertyId, data) => {
  const response = await axiosInstance.put(`/properties/${propertyId}/legal`, data);
  return response.data;
},

uploadRegistrationDocument: async (propertyId, formData) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/legal/upload-document`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
},

completeFinanceLegalStep: async (propertyId) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/legal/complete-step`);
  return response.data;
},


deleteFinanceLegal: async (propertyId) => {
  const response = await axiosInstance.delete(`/properties/${propertyId}/finance-legal`);
  return response.data;
},
};