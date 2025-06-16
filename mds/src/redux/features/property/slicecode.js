
// Room Media Thunks
export const uploadRoomMedia = createAsyncThunk(
  'property/uploadRoomMedia',
  async ({ propertyId, roomId, formData }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.uploadRoomMedia(propertyId, roomId, formData);
      return response.property;
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
      return response.property;
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
        handlePropertyUpdate(builder, uploadRoomMedia);
        handlePropertyUpdate(builder, updateRoomMediaItem);
        handlePropertyUpdate(builder, deleteRoomMediaItem);
        handlePropertyUpdate(builder, completeMediaStep);