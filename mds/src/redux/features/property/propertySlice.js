import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertyAPI } from './propertyAPI';

// Helper functions for localStorage
const saveSearchQueryToLocal = (query) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastSearchQuery', JSON.stringify(query));
  }
};

const getSearchQueryFromLocal = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('lastSearchQuery');
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

// Initial state
const initialState = {
  properties: [],
  draftProperties: [],
  currentProperty: null,
  ViewProperty: {},
  currentFinanceLegal: null,
  currentMedia: [],
  featuredProperties: [],
  stateProperties: {},
  cityProperties: {},
  userProperties: [],
  suggestions: [],
  suggestionsCache: {},
  searchResults: [],
  searchQuery: getSearchQueryFromLocal(), // Load from localStorage on init
  searchPagination: {
    currentPage: 0,
    hasMore: true,
    total: 0
  },
  isSuggestionsLoading: false,
  suggestionsError: null,
  isLoading: false,
  isSearchLoading: false,
  error: null,
  searchError: null,
};


// Async thunks
export const initializeProperty = createAsyncThunk(
  'property/initializeProperty',
  async (forceNew, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.initializeProperty(forceNew);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize property');
    }
  }
);

export const getAllProperties = createAsyncThunk(
  'property/getAllProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getAllProperties();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const getDraftProperties = createAsyncThunk(
  'property/getDraftProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getDraftProperties();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);


export const getProperty = createAsyncThunk(
  'property/getProperty',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getProperty(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property');
    }
  }
);


export const getViewProperty = createAsyncThunk(
  'property/getViewProperty',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getViewProperty(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property');
    }
  }
);



export const fetchSuggestions = createAsyncThunk(
  'property/fetchSuggestions',
  async (query, { getState, rejectWithValue }) => {
    try {
      // Check cache first
      const { property } = getState();
      const cachedResult = property.suggestionsCache[query];
      
      if (cachedResult) {
        return { suggestions: cachedResult, fromCache: true };
      }

      const suggestions = await propertyAPI.getSuggestions(query);
      return { suggestions, query, fromCache: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suggestions');
    }
  }
);


export const getPropertiesByQuery = createAsyncThunk(
  'property/getPropertiesByQuery',
  async (queryParams, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getPropertiesByQuery(queryParams);
      return {
        properties: response,
        queryParams // Include query params for potential caching
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch properties by query');
    }
  }
);


export const sendEmailOTP = createAsyncThunk(
  'property/sendEmailOTP',
  async ({ propertyId, email }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.sendEmailOTP(propertyId, { email });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

// Add new action for checking verification status
export const checkEmailVerificationStatus = createAsyncThunk(
  'property/checkEmailVerificationStatus',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.checkEmailVerificationStatus(propertyId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check verification status');
    }
  }
);

// Update verifyEmailOTP to return property data
export const verifyEmailOTP = createAsyncThunk(
  'property/verifyEmailOTP',
  async ({ propertyId, email, otp }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.verifyEmailOTP(propertyId, { email, otp });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP');
    }
  }
);


export const updateBasicInfo = createAsyncThunk(
  'property/updateBasicInfo',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateBasicInfo(id, data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property basic info');
    }
  }
);


export const updateLocation = createAsyncThunk(
  'property/updateLocation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateLocation(id, data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property Location');
    }
  }
);


export const updateAmenities = createAsyncThunk(
  'property/updateAmenities',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateAmenities(id, data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property Amenities');
    }
  }
);


export const addRooms = createAsyncThunk(
  'property/addRooms',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.addRooms(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property Rooms');
    }
  }
);


export const deleteRoom = createAsyncThunk(
  'property/deleteRoom',
  async ({ propertyId, roomId }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.deleteRoom(propertyId, roomId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete room');
    }
  }
);


export const updateRoom = createAsyncThunk(
  'property/updateRoom',
  async ({ id, roomId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateRoom(id, roomId, data);
      return response.data;
    } catch (error) {
      // return console.log(error ,"new error")
      return rejectWithValue(error.response?.data?.message || 'Failed to update property Rooms');
    }
  }
);


export const uploadPropertyMedia = createAsyncThunk(
  'property/uploadPropertyMedia',
  async ({ propertyId, formData }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.uploadPropertyMedia(propertyId, formData);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload media');
    }
  }
);

export const updateMediaItem = createAsyncThunk(
  'property/updateMediaItem',
  async ({ propertyId, mediaId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateMediaItem(propertyId, mediaId, data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update media item');
    }
  }
);

export const deleteMediaItem = createAsyncThunk(
  'property/deleteMediaItem',
  async ({ propertyId, mediaId }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.deleteMediaItem(propertyId, mediaId);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete media item');
    }
  }
);

// Room Media Thunks
export const uploadRoomMedia = createAsyncThunk(
  'property/uploadRoomMedia',
  async ({ propertyId, roomId, formData }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.uploadRoomMedia(propertyId, roomId, formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload room media');
    }
  }
);

export const updateRoomMediaItem = createAsyncThunk(
  'property/updateRoomMediaItem',
  async ({ propertyId, roomId, mediaId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateRoomMediaItem(propertyId, roomId, mediaId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update room media item');
    }
  }
);

export const deleteRoomMediaItem = createAsyncThunk(
  'property/deleteRoomMediaItem',
  async ({ propertyId, roomId, mediaId }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.deleteRoomMediaItem(propertyId, roomId, mediaId);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete room media item');
    }
  }
);

export const getRoomMedia = createAsyncThunk(
  'property/getRoomMedia',
  async ({ propertyId, roomId, params }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getRoomMedia(propertyId, roomId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get room media');
    }
  }
);

export const getMediaByTags = createAsyncThunk(
  'property/getMediaByTags',
  async ({ propertyId, params }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getMediaByTags(propertyId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get media');
    }
  }
);

export const completeMediaStep = createAsyncThunk(
  'property/completeMediaStep',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.completeMediaStep(propertyId);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete media step');
    }
  }
);

export const completeRoomsStep = createAsyncThunk(
  'property/completeRoomsStep',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.completeRoomsStep(propertyId);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete media step');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (id, { rejectWithValue }) => {
    try {
      await propertyAPI.deleteProperty(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
    }
  }
);

export const finalizeProperty = createAsyncThunk(
  'property/finalizeProperty',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.finalizeProperty(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to finalize property');
    }
  }
);

export const reviewProperty = createAsyncThunk(
  'property/reviewProperty',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.reviewProperty(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to review property');
    }
  }
);

export const getPropertiesByState = createAsyncThunk(
  'property/getPropertiesByState',
  async (state, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getPropertiesByState(state);
      return { state, properties: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties by state');
    }
  }
);

export const getPropertiesByCity = createAsyncThunk(
  'property/getPropertiesByCity',
  async (city, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getPropertiesByCity(city);
      return { city, properties: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties by city');
    }
  }
);

export const searchProperties = createAsyncThunk(
  'property/searchProperties',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.searchProperties(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search properties');
    }
  }
);

export const getFeaturedProperties = createAsyncThunk(
  'property/getFeaturedProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getFeaturedProperties();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured properties');
    }
  }
);

export const checkPropertyAvailability = createAsyncThunk(
  'property/checkPropertyAvailability',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.checkPropertyAvailability(id, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check property availability');
    }
  }
);

// Finance Legal Thunks
export const getFinanceLegal = createAsyncThunk(
  'property/getFinanceLegal',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getFinanceLegal(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get finance legal data');
    }
  }
);

export const updateFinanceDetails = createAsyncThunk(
  'property/updateFinanceDetails',
  async ({ propertyId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateFinanceDetails(propertyId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update finance details');
    }
  }
);

export const updateLegalDetails = createAsyncThunk(
  'property/updateLegalDetails',
  async ({ propertyId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateLegalDetails(propertyId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update legal details');
    }
  }
);

export const uploadRegistrationDocument = createAsyncThunk(
  'property/uploadRegistrationDocument',
  async ({ propertyId, formData }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.uploadRegistrationDocument(propertyId, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

// Add to your propertySlice.js
export const completeFinanceLegalStep = createAsyncThunk(
  'property/completeFinanceLegalStep',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.completeFinanceLegalStep(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Property slice
const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    clearPropertyError: (state) => {
      state.error = null;
    },
    resetCurrentProperty: (state) => {
      state.currentProperty = null;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
      state.suggestionsError = null;
    },
    clearSuggestionsCache: (state) => {
      state.suggestionsCache = {};
    },
    // Add these new reducers
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = null;
      state.searchError = null;
      state.searchPagination = {
        currentPage: 0,
        hasMore: true,
        total: 0
      };
    },
    clearSearchError: (state) => {
      state.searchError = null;
    },
    resetSearchPagination: (state) => {
      state.searchPagination = {
        currentPage: 0,
        hasMore: true,
        total: 0
      };
    },

     // Add action to clear search query
    clearSearchQuery: (state) => {
      state.searchQuery = null;
      state.searchResults = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lastSearchQuery');
      }
    },
    // Add action to set search query manually
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      saveSearchQueryToLocal(action.payload);
    }
  },
  extraReducers: (builder) => {
    // Initialize property
    builder.addCase(initializeProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(initializeProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload.property;
      state.userProperties.push(action.payload.property);
    });
    builder.addCase(initializeProperty.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get all properties
    builder.addCase(getAllProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getAllProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.properties = action.payload;
    });
    builder.addCase(getAllProperties.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });


    // Get Draft properties
    builder.addCase(getDraftProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getDraftProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.draftProperties = action.payload;
    });
    builder.addCase(getDraftProperties.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get property by ID
    builder.addCase(getProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload;
    });
    builder.addCase(getProperty.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
        // Get property by ID
    builder.addCase(getViewProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getViewProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.ViewProperty = action.payload;
    });
    builder.addCase(getViewProperty.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    
     // Fetch suggestions
    builder.addCase(fetchSuggestions.pending, (state) => {
      state.isSuggestionsLoading = true;
      state.suggestionsError = null;
    });
    builder.addCase(fetchSuggestions.fulfilled, (state, action) => {
      state.isSuggestionsLoading = false;
      state.suggestions = action.payload.suggestions;
      
      // Cache the result if it's not from cache
      if (!action.payload.fromCache && action.payload.query) {
        state.suggestionsCache[action.payload.query] = action.payload.suggestions;
      }
    });
    builder.addCase(fetchSuggestions.rejected, (state, action) => {
      state.isSuggestionsLoading = false;
      state.suggestionsError = action.payload;
    });


      builder.addCase(getPropertiesByQuery.pending, (state, action) => {
      state.isSearchLoading = true;
      state.searchError = null;
      
      if (action.meta.arg.skip === 1 || action.meta.arg.skip === '1') {
        state.searchResults = [];
        state.searchPagination.currentPage = 0;
        state.searchPagination.hasMore = true;
      }
    });
    
    builder.addCase(getPropertiesByQuery.fulfilled, (state, action) => {
      state.isSearchLoading = false;
      const { properties, queryParams } = action.payload;
      console.log(queryParams, "queryParams in slice")
      
      // Store current search query in state and localStorage
      state.searchQuery = queryParams;
      saveSearchQueryToLocal(queryParams);
      
      if (queryParams.skip === 1 || queryParams.skip === '1') {
        state.searchResults = properties;
      } else {
        state.searchResults = [...state.searchResults, ...properties];
      }
      
      state.searchPagination.currentPage = Math.floor(queryParams.skip / queryParams.limit);
      state.searchPagination.hasMore = properties.length === queryParams.limit;
      
      if (properties.length < queryParams.limit) {
        state.searchPagination.hasMore = false;
      }
    });
    
    builder.addCase(getPropertiesByQuery.rejected, (state, action) => {
      state.isSearchLoading = false;
      state.searchError = action.payload;
    });

    builder.addCase(sendEmailOTP.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    builder.addCase(sendEmailOTP.fulfilled, (state, action) => {
      state.isLoading = false;
      state.otpSent = true;
    })
    builder.addCase(sendEmailOTP.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.otpSent = false;
    })
    builder.addCase(verifyEmailOTP.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
   builder.addCase(verifyEmailOTP.fulfilled, (state, action) => {
    state.isLoading = false;
    state.emailVerified = true;
    // Update current property if returned
    if (action.payload.property) {
      state.currentProperty = action.payload.property;
    }
  })
  builder.addCase(checkEmailVerificationStatus.fulfilled, (state, action) => {
    state.emailVerified = action.payload.emailVerified;
  });
    builder.addCase(verifyEmailOTP.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.emailVerified = false;
    });


    const handlePropertyUpdate = (builder, thunk) => {
      builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

      builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProperty = action.payload;

        // Update in the user's property list if it exists
        const index = state.userProperties.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.userProperties[index] = action.payload;
        }
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    };


    handlePropertyUpdate(builder, updateBasicInfo);
    handlePropertyUpdate(builder, updateLocation);
    handlePropertyUpdate(builder, updateAmenities);
    // handlePropertyUpdate(builder, addRooms);
    // handlePropertyUpdate(builder, deleteRoom);
    handlePropertyUpdate(builder, updateRoom);
    // handlePropertyUpdate(builder, uploadRoomMedia);
    // handlePropertyUpdate(builder, updateRoomMediaItem);
    handlePropertyUpdate(builder, deleteRoomMediaItem);
    handlePropertyUpdate(builder, completeMediaStep);
    handlePropertyUpdate(builder, completeRoomsStep);

    // Specific handlers for media operations
    // uploadPropertyMedia handler
    builder.addCase(uploadPropertyMedia.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(uploadPropertyMedia.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedProperty = action.payload;

      if (updatedProperty) {
        state.currentProperty = updatedProperty;
        const index = state.userProperties.findIndex(p => p._id === updatedProperty._id);
        if (index !== -1) {
          state.userProperties[index] = updatedProperty;
        }
      }
    });

builder.addCase(uploadPropertyMedia.rejected, (state, action) => {
  state.isLoading = false;
  // Handle both string errors and detailed error objects
  if (action.payload?.invalidFiles) {
    state.error = {
      message: action.payload.message,
      invalidFiles: action.payload.invalidFiles
    };
  } else {
    state.error = action.payload;
  }
});

    // deleteMediaItem handler
    builder.addCase(deleteMediaItem.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(deleteMediaItem.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedProperty = action.payload;
      console.log(updatedProperty)

      if (updatedProperty) {
        state.currentProperty = updatedProperty;
        const index = state.userProperties.findIndex(p => p._id === updatedProperty._id);
        if (index !== -1) {
          state.userProperties[index] = updatedProperty;
        }
      }
    });

    builder.addCase(deleteMediaItem.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // updateMediaItem handler
    builder.addCase(updateMediaItem.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(updateMediaItem.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedProperty = action.payload;
      console.log(updatedProperty)


      if (updatedProperty) {
        state.currentProperty = updatedProperty;
        const index = state.userProperties.findIndex(p => p._id === updatedProperty._id);
        if (index !== -1) {
          state.userProperties[index] = updatedProperty;
        }
      }
    });

    builder.addCase(updateMediaItem.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  
    //getMediaByTags
    builder.addCase(getMediaByTags.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getMediaByTags.fulfilled, (state, action) => {
      state.isLoading = false;
      // Store media items in a separate state property if needed
      state.currentMedia = action.payload;
    });
    builder.addCase(getMediaByTags.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Delete property
    builder.addCase(deleteProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userProperties = state.userProperties.filter(p => p._id !== action.payload);
      state.properties = state.properties.filter(p => p._id !== action.payload);
      if (state.currentProperty && state.currentProperty._id === action.payload) {
        state.currentProperty = null;
      }
    });
    builder.addCase(deleteProperty.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(addRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

    builder.addCase(addRooms.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload.property;

      // Update in the user's property list if it exists
      const index = state.userProperties.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.userProperties[index] = action.payload;
      }
      });
      builder.addCase(addRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });


      builder.addCase(uploadRoomMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

    builder.addCase(uploadRoomMedia.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload.property;

      // Update in the user's property list if it exists
      const index = state.userProperties.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.userProperties[index] = action.payload;
      }
      });
      builder.addCase(uploadRoomMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });


            builder.addCase(updateRoomMediaItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

    builder.addCase(updateRoomMediaItem.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload.property;

      // Update in the user's property list if it exists
      const index = state.userProperties.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.userProperties[index] = action.payload;
      }
      });
      builder.addCase(updateRoomMediaItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });


      builder.addCase(deleteRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

      builder.addCase(deleteRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProperty = action.payload.property;

        // Update in the user's property list if it exists
        const index = state.userProperties.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.userProperties[index] = action.payload;
        }
      });
      builder.addCase(deleteRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

      // Finance Legal handlers
  builder.addCase(getFinanceLegal.fulfilled, (state, action) => {
    state.isLoading = false;
    state.currentFinanceLegal = action.payload;
    console.log('Finance legal data received:', action.payload);
  })
  builder.addCase(updateFinanceDetails.fulfilled, (state, action) => {
    state.isLoading = false;
    state.currentFinanceLegal = action.payload;
  })
  builder.addCase(updateLegalDetails.fulfilled, (state, action) => {
    state.isLoading = false;
    state.currentFinanceLegal = action.payload;
  })
  builder.addCase(uploadRegistrationDocument.fulfilled, (state, action) => {
    state.isLoading = false;
    state.currentFinanceLegal = action.payload;
  });

// Handle pending and rejected states
[getFinanceLegal, updateFinanceDetails, updateLegalDetails, uploadRegistrationDocument].forEach(thunk => {

    builder.addCase(thunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    builder.addCase(thunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    });
     // Get featured properties
    builder.addCase(reviewProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(reviewProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload;
    });
    builder.addCase(reviewProperty.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get properties by state
    builder.addCase(getPropertiesByState.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getPropertiesByState.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stateProperties = {
        ...state.stateProperties,
        [action.payload.state]: action.payload.properties
      };
    });
    builder.addCase(getPropertiesByState.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get properties by city
    builder.addCase(getPropertiesByCity.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getPropertiesByCity.fulfilled, (state, action) => {
      state.isLoading = false;
      state.cityProperties = {
        ...state.cityProperties,
        [action.payload.city]: action.payload.properties
      };
    });
    builder.addCase(getPropertiesByCity.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Search properties
    builder.addCase(searchProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(searchProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.properties = action.payload;
    });
    builder.addCase(searchProperties.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get featured properties
    builder.addCase(getFeaturedProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getFeaturedProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.featuredProperties = action.payload;
    });
    builder.addCase(getFeaturedProperties.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const { clearPropertyError, resetCurrentProperty , clearSuggestions, clearSuggestionsCache, clearSearchResults,clearSearchError, resetSearchPagination, clearSearchQuery, setSearchQuery } = propertySlice.actions;
export default propertySlice.reducer;