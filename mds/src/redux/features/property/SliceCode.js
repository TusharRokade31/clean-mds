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
  ViewProperty: null,
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

  },
    });

export const { clearPropertyError, resetCurrentProperty , clearSuggestions, clearSuggestionsCache, clearSearchResults,clearSearchError, resetSearchPagination, clearSearchQuery, setSearchQuery } = propertySlice.actions;
export default propertySlice.reducer;