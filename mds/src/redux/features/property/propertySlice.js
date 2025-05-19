// src/redux/features/property/propertySlice.ts
// src/redux/features/property/propertySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertyAPI } from './propertyAPI';

// Initial state
const initialState = {
  properties: [],
  draftProperties:[],
  currentProperty: null,
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

export const updatePropertyStep1 = createAsyncThunk(
  'property/updatePropertyStep1',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updatePropertyStep1(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property');
    }
  }
);

export const updatePropertyStep2 = createAsyncThunk(
  'property/updatePropertyStep2',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updatePropertyStep2(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property location');
    }
  }
);

export const updatePropertyStep3 = createAsyncThunk(
  'property/updatePropertyStep3',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updatePropertyStep3(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property size');
    }
  }
);

export const updatePropertyStep4 = createAsyncThunk(
  'property/updatePropertyStep4',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updatePropertyStep4(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property amenities');
    }
  }
);

export const updatePropertyStep5 = createAsyncThunk(
  'property/updatePropertyStep5',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updatePropertyStep5(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property rules');
    }
  }
);

export const updatePropertyStep6 = createAsyncThunk(
  'property/updatePropertyStep6',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updatePropertyStep6(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property description');
    }
  }
);

export const updatePropertyStep7 = createAsyncThunk(
  'property/updatePropertyStep7',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updatePropertyStep7(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload property images');
    }
  }
);

export const updatePropertyStep8 = createAsyncThunk(
  'property/updatePropertyStep8',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updatePropertyStep8(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property pricing');
    }
  }
);

export const updatePropertyStep9 = createAsyncThunk(
  'property/updatePropertyStep9',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updatePropertyStep9(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property availability');
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

    // Update property step handlers (common pattern for steps 1-9)
    const handleStepUpdate = (builder, thunk) => {
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

    // Apply the pattern to all step update thunks
    handleStepUpdate(builder, updatePropertyStep1);
    handleStepUpdate(builder, updatePropertyStep2);
    handleStepUpdate(builder, updatePropertyStep3);
    handleStepUpdate(builder, updatePropertyStep4);
    handleStepUpdate(builder, updatePropertyStep5);
    handleStepUpdate(builder, updatePropertyStep6);
    handleStepUpdate(builder, updatePropertyStep7);
    handleStepUpdate(builder, updatePropertyStep8);
    handleStepUpdate(builder, updatePropertyStep9);
    handleStepUpdate(builder, finalizeProperty);

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