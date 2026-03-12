// src/redux/features/bookings/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from './bookingAPI';

// Initial state
const initialState = {
  bookings: [],
  selfBookings: [], // Add this for user's own bookings
  currentBooking: null,
  bookingStats: null,
  selfBookingStats: null, // Add this for user's booking stats
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalBookings: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  selfPagination: { // Add separate pagination for self bookings
    currentPage: 1,
    totalPages: 0,
    totalBookings: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    page: 1,
    limit: 10,
    status: '',
    propertyId: '',
    checkIn: '',
    checkOut: '',
    guestName: '',
    bookingId: '',
    paymentStatus: '',
  },
  selfFilters: { // Add separate filters for self bookings
    page: 1,
    limit: 10,
    status: '',
    propertyId: '',
    checkIn: '',
    checkOut: '',
    guestName: '',
    bookingId: '',
    paymentStatus: '',
  },
  isLoading: false,
  isSelfLoading: false, // Add separate loading state for self bookings
  isCreating: false,
  isUpdating: false,
  error: null,
  selfError: null, // Add separate error state for self bookings
};

// Async thunks
export const fetchAllBookings = createAsyncThunk(
  'booking/fetchAllBookings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getAllBookings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

// Add fetchSelfBookings thunk
export const fetchSelfBookings = createAsyncThunk(
  'booking/fetchSelfBookings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getSelfBookings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your bookings');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'booking/fetchBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getBookingById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.createBooking(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const updateBooking = createAsyncThunk(
  'booking/updateBooking',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.updateBooking(id, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update booking');
    }
  }
);

export const updatePayment = createAsyncThunk(
  'booking/updatePayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.updatePayment(id, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment');
    }
  }
);

export const updateStatus = createAsyncThunk(
  'booking/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.updateStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const checkInGuest = createAsyncThunk(
  'booking/checkInGuest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.checkIn(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in guest');
    }
  }
);

export const checkOutGuest = createAsyncThunk(
  'booking/checkOutGuest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.checkOut(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check out guest');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async ({ id, cancellationData }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.cancelBooking(id, cancellationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

export const fetchBookingStats = createAsyncThunk(
  'booking/fetchBookingStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getBookingStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking stats');
    }
  }
);

// Add fetchSelfBookingStats thunk
export const fetchSelfBookingStats = createAsyncThunk(
  'booking/fetchSelfBookingStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getSelfBookingStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your booking stats');
    }
  }
);

export const createBookingWithValidation = createAsyncThunk(
  'booking/createBookingWithValidation',
  async (bookingData, { rejectWithValue }) => {
    try {
      // Validate required fields
      const requiredFields = ['propertyId', 'roomId', 'primaryGuest', 'checkIn', 'checkOut', 'guestCount']
      const missingFields = requiredFields.filter(field => !bookingData[field])
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Validate guest details
      const guestRequiredFields = ['firstName', 'lastName', 'email', 'phone', 'idType', 'idNumber']
      const missingGuestFields = guestRequiredFields.filter(field => !bookingData.primaryGuest[field])
      
      if (missingGuestFields.length > 0) {
        throw new Error(`Missing guest details: ${missingGuestFields.join(', ')}`)
      }

      // Validate dates
      const checkIn = new Date(bookingData.checkIn)
      const checkOut = new Date(bookingData.checkOut)
      const today = new Date()
      
      if (checkIn < today) {
        throw new Error('Check-in date cannot be in the past')
      }
      
      if (checkOut <= checkIn) {
        throw new Error('Check-out date must be after check-in date')
      }

      const response = await bookingAPI.createBooking(bookingData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create booking')
    }
  }
)

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    clearSelfBookingError: (state) => {
      state.selfError = null;
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateSelfFilters: (state, action) => {
      state.selfFilters = { ...state.selfFilters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        status: '',
        propertyId: '',
        checkIn: '',
        checkOut: '',
        guestName: '',
        bookingId: '',
        paymentStatus: '',
      };
    },
    resetSelfFilters: (state) => {
      state.selfFilters = {
        page: 1,
        limit: 10,
        status: '',
        propertyId: '',
        checkIn: '',
        checkOut: '',
        guestName: '',
        bookingId: '',
        paymentStatus: '',
      };
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all bookings
    builder
      .addCase(fetchAllBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Fetch self bookings
      .addCase(fetchSelfBookings.pending, (state) => {
        state.isSelfLoading = true;
        state.selfError = null;
      })
      .addCase(fetchSelfBookings.fulfilled, (state, action) => {
        state.isSelfLoading = false;
        state.selfBookings = action.payload.bookings;
        state.selfPagination = action.payload.pagination;
      })
      .addCase(fetchSelfBookings.rejected, (state, action) => {
        state.isSelfLoading = false;
        state.selfError = action.payload;
      })

    // Fetch booking by ID
      .addCase(fetchBookingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch booking" 
      })

    // Create booking
      .addCase(createBooking.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isCreating = false;
        state.bookings.unshift(action.payload);
        state.selfBookings.unshift(action.payload); // Also add to self bookings
        state.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

    // Update booking
      .addCase(updateBooking.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedBooking = action.payload;
        
        // Update in bookings array
        const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
        
        // Update in self bookings array
        const selfIndex = state.selfBookings.findIndex(booking => booking._id === updatedBooking._id);
        if (selfIndex !== -1) {
          state.selfBookings[selfIndex] = updatedBooking;
        }
        
        if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
          state.currentBooking = updatedBooking;
        }
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

    // Update payment
      .addCase(updatePayment.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedBooking = action.payload;
        
        // Update in bookings array
        const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
        
        // Update in self bookings array
        const selfIndex = state.selfBookings.findIndex(booking => booking._id === updatedBooking._id);
        if (selfIndex !== -1) {
          state.selfBookings[selfIndex] = updatedBooking;
        }
        
        if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
          state.currentBooking = updatedBooking;
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Update status
      .addCase(updateStatus.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedBooking = action.payload;
        
        // Update in bookings array
        const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
        
        // Update in self bookings array
        const selfIndex = state.selfBookings.findIndex(booking => booking._id === updatedBooking._id);
        if (selfIndex !== -1) {
          state.selfBookings[selfIndex] = updatedBooking;
        }
        
        if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
          state.currentBooking = updatedBooking;
        }
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

    // Check-in guest
      .addCase(checkInGuest.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(checkInGuest.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedBooking = action.payload;
        
        // Update in bookings array
        const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
        
        // Update in self bookings array
        const selfIndex = state.selfBookings.findIndex(booking => booking._id === updatedBooking._id);
        if (selfIndex !== -1) {
          state.selfBookings[selfIndex] = updatedBooking;
        }
        
        if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
          state.currentBooking = updatedBooking;
        }
      })
      .addCase(checkInGuest.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

    // Check-out guest
      .addCase(checkOutGuest.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(checkOutGuest.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedBooking = action.payload;
        
        // Update in bookings array
        const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
        
        // Update in self bookings array
        const selfIndex = state.selfBookings.findIndex(booking => booking._id === updatedBooking._id);
        if (selfIndex !== -1) {
          state.selfBookings[selfIndex] = updatedBooking;
        }
        
        if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
          state.currentBooking = updatedBooking;
        }
      })
      .addCase(checkOutGuest.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

    // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedBooking = action.payload;
        
        // Update in bookings array
        const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
        }
        
        // Update in self bookings array
        const selfIndex = state.selfBookings.findIndex(booking => booking._id === updatedBooking._id);
        if (selfIndex !== -1) {
          state.selfBookings[selfIndex] = updatedBooking;
        }
        
        if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
          state.currentBooking = updatedBooking;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
    // Fetch booking stats
      .addCase(fetchBookingStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookingStats = action.payload;
      })
      .addCase(fetchBookingStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
    // Fetch self booking stats
      .addCase(fetchSelfBookingStats.pending, (state) => {
        state.isSelfLoading = true;
        state.selfError = null;
      })
      .addCase(fetchSelfBookingStats.fulfilled, (state, action) => {
        state.isSelfLoading = false;
        state.selfBookingStats = action.payload;
      })
      .addCase(fetchSelfBookingStats.rejected, (state, action) => {
        state.isSelfLoading = false;
        state.selfError = action.payload;
      });
  },
});

export const {
  clearBookingError,
  clearSelfBookingError,
  setCurrentBooking,
  updateFilters,
  updateSelfFilters,
  resetFilters,
  resetSelfFilters,
  clearCurrentBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;