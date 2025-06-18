    
// Privacy Policy Thunks
export const getPrivacyPolicyTemplate = createAsyncThunk(
  'property/getPrivacyPolicyTemplate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getPrivacyPolicyTemplate();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get privacy policy template');
    }
  }
);

export const getPrivacyPolicy = createAsyncThunk(
  'property/getPrivacyPolicy',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getPrivacyPolicy(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get privacy policy');
    }
  }
);

export const createOrUpdatePrivacyPolicy = createAsyncThunk(
  'property/createOrUpdatePrivacyPolicy',
  async ({ propertyId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.createOrUpdatePrivacyPolicy(propertyId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save privacy policy');
    }
  }
);

export const updatePrivacyPolicySection = createAsyncThunk(
  'property/updatePrivacyPolicySection',
  async ({ propertyId, section, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updatePrivacyPolicySection(propertyId, section, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update privacy policy section');
    }
  }
);
    
    
    
    // Privacy Policy handlers
    builder.addCase(getPrivacyPolicyTemplate.fulfilled, (state, action) => {
      state.isLoading = false;
      state.privacyPolicyTemplate = action.payload;
    });
    
    builder.addCase(getPrivacyPolicy.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentPrivacyPolicy = action.payload;
    });
    
    builder.addCase(createOrUpdatePrivacyPolicy.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentPrivacyPolicy = action.payload;
    });
     
    builder.addCase(updatePrivacyPolicySection.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentPrivacyPolicy = action.payload;
    });
    
    // Handle pending and rejected states for all privacy policy actions
    [getPrivacyPolicyTemplate, getPrivacyPolicy, createOrUpdatePrivacyPolicy, updatePrivacyPolicySection].forEach(thunk => {
      builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    });