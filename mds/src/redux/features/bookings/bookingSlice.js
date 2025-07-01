// src/redux/features/bookings/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from './bookingAPI';

// Initial state
const initialState = {
  bookings: [],
  currentBooking: null,
  bookingStats: null,
  pagination: {
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
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
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

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
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
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all bookings
    builder.addCase(fetchAllBookings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllBookings.fulfilled, (state, action) => {
      state.isLoading = false;
      state.bookings = action.payload.bookings;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchAllBookings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch booking by ID
    builder.addCase(fetchBookingById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBookingById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentBooking = action.payload;
    });
    builder.addCase(fetchBookingById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Create booking
    builder.addCase(createBooking.pending, (state) => {
      state.isCreating = true;
      state.error = null;
    });
    builder.addCase(createBooking.fulfilled, (state, action) => {
      state.isCreating = false;
      state.bookings.unshift(action.payload.data);
      state.currentBooking = action.payload.data;
    });
    builder.addCase(createBooking.rejected, (state, action) => {
      state.isCreating = false;
      state.error = action.payload;
    });

    // Update booking
    builder.addCase(updateBooking.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(updateBooking.fulfilled, (state, action) => {
      state.isUpdating = false;
      const updatedBooking = action.payload.data;
      const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
      if (index !== -1) {
        state.bookings[index] = updatedBooking;
      }
      if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
        state.currentBooking = updatedBooking;
      }
    });
    builder.addCase(updateBooking.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    });

    // Update payment
    builder.addCase(updatePayment.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(updatePayment.fulfilled, (state, action) => {
      state.isUpdating = false;
      const updatedBooking = action.payload.data;
      const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
      if (index !== -1) {
        state.bookings[index] = updatedBooking;
      }
      if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
        state.currentBooking = updatedBooking;
      }
    });
    builder.addCase(updatePayment.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    });

    // Check-in guest
    builder.addCase(checkInGuest.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(checkInGuest.fulfilled, (state, action) => {
      state.isUpdating = false;
      const updatedBooking = action.payload.data;
      const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
      if (index !== -1) {
        state.bookings[index] = updatedBooking;
      }
      if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
        state.currentBooking = updatedBooking;
      }
    });
    builder.addCase(checkInGuest.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    });

    // Check-out guest
    builder.addCase(checkOutGuest.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(checkOutGuest.fulfilled, (state, action) => {
      state.isUpdating = false;
      const updatedBooking = action.payload.data;
      const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
      if (index !== -1) {
        state.bookings[index] = updatedBooking;
      }
      if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
        state.currentBooking = updatedBooking;
      }
    });
    builder.addCase(checkOutGuest.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    });

    // Cancel booking
    builder.addCase(cancelBooking.pending, (state) => {
      state.isUpdating = true;
      state.error = null;
    });
    builder.addCase(cancelBooking.fulfilled, (state, action) => {
      state.isUpdating = false;
      const updatedBooking = action.payload.data;
      const index = state.bookings.findIndex(booking => booking._id === updatedBooking._id);
      if (index !== -1) {
        state.bookings[index] = updatedBooking;
      }
      if (state.currentBooking && state.currentBooking._id === updatedBooking._id) {
        state.currentBooking = updatedBooking;
      }
    });
    builder.addCase(cancelBooking.rejected, (state, action) => {
      state.isUpdating = false;
      state.error = action.payload;
    });

    // Fetch booking stats
    builder.addCase(fetchBookingStats.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBookingStats.fulfilled, (state, action) => {
      state.isLoading = false;
      state.bookingStats = action.payload;
    });
    builder.addCase(fetchBookingStats.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const {
  clearBookingError,
  setCurrentBooking,
  updateFilters,
  resetFilters,
  clearCurrentBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;