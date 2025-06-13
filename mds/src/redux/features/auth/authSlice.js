// src/redux/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from './authAPI';

// Initial state
const initialState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.token);
      document.cookie = `token=${response.token}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=lax`;
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(userData);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.authMe();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);


export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);


export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      return;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  'auth/googleLogin',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.googleLogin(token);
      localStorage.setItem('token', response.token);
      document.cookie = `token=${response.token}; path=/; max-age=${30 * 24 * 60 * 60}; secure; samesite=lax`;
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google login failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.token = action.payload.token;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Signup cases
    builder.addCase(signupUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.token = action.payload.token;
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    
    //google Auth
    builder.addCase(googleLoginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(googleLoginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.token = action.payload.token;
    });
    builder.addCase(googleLoginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch current user cases
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.token = action.payload.token;
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      localStorage.removeItem('token');
    });

    //update profile 
     builder.addCase(updateUserProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.data;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Logout cases
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;