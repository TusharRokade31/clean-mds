// src/redux/features/property/propertySlice.ts
// src/redux/features/property/propertySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertyAPI } from './propertyAPI';

// Initial state
const initialState = {
  properties: [],
  draftProperties:[],
  currentProperty: null,
  currentMedia:[],
  featuredProperties: [],
  stateProperties: {},
  cityProperties: {},
  userProperties: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const initializeProperty = createAsyncThunk(
  'property/initializeProperty',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.initializeProperty();
      return response.data;
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


export const getUserProperties = createAsyncThunk(
  'property/getUserProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getUserProperties();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user properties');
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


export const updateBasicInfo = createAsyncThunk(
  'property/updateBasicInfo',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateBasicInfo(id, data);
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data;
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
      return response.data;
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
  async ({id, status} , { rejectWithValue }) => {
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
  },
  extraReducers: (builder) => {
    // Initialize property
    builder.addCase(initializeProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(initializeProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload;
      state.userProperties.push(action.payload);
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
        // Get all properties
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

    // Get user properties
    builder.addCase(getUserProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getUserProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userProperties = action.payload;
    });
    builder.addCase(getUserProperties.rejected, (state, action) => {
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
        handlePropertyUpdate(builder, addRooms);
        handlePropertyUpdate(builder, updateRoom);
        handlePropertyUpdate(builder, completeMediaStep);

        // Specific handlers for media operations
        // uploadPropertyMedia handler
        builder.addCase(uploadPropertyMedia.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        });

        builder.addCase(uploadPropertyMedia.fulfilled, (state, action) => {
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

        builder.addCase(uploadPropertyMedia.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
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

    

    // delete room
      builder.addCase(deleteRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Update current property with the response
        if (action.payload) {
          state.currentProperty = action.payload;
        }
      })
      builder.addCase(deleteRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      builder.addCase(deleteRoom.rejected, (state, action) => {
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

export const { clearPropertyError, resetCurrentProperty } = propertySlice.actions;
export default propertySlice.reducer;