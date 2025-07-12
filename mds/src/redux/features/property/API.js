import axiosInstance from '../../../services/axios.config';

export const propertyAPI = {
    
   getSuggestions: async (query) => {
    const response = await axiosInstance.get(`/properties/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  },


   getPropertiesByQuery: async (queryParams) => {
    const { location, checkin, checkout, persons, skip = 0, limit = 10 } = queryParams;
     const response = await axiosInstance.get(`/properties/property-listing?location=${encodeURIComponent(location)}&checkin=${checkin}&checkout=${checkout}&persons=${persons}&skip=${skip}&limit=${limit}`);
     return response.data
  },
};