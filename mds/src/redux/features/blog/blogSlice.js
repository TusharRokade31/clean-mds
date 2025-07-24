// src/redux/features/blog/blogSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogAPI } from './blogAPI';


// Initial state
const initialState = {
  blogs: [],
  currentBlog: null,
  blogsByTag: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 10,
    status: '',
    tag: '',
    search: '',
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const fetchAllBlogs = createAsyncThunk(
  'blog/fetchAllBlogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getAllBlogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

export const fetchBlogBySlug = createAsyncThunk(
  'blog/fetchBlogBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getBlogBySlug(slug);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog');
    }
  }
);

export const fetchBlogsByTag = createAsyncThunk(
  'blog/fetchBlogsByTag',
  async (tag, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getBlogsByTag(tag);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs by tag');
    }
  }
);

export const createBlog = createAsyncThunk(
  'blog/createBlog',
  async (blogData, { rejectWithValue }) => {
    try {
      const response = await blogAPI.createBlog(blogData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create blog');
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blog/updateBlog',
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await blogAPI.updateBlog(id, blogData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update blog');
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogAPI.deleteBlog(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog');
    }
  }
);

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    clearBlogError: (state) => {
      state.error = null;
    },
    setCurrentBlog: (state, action) => {
      state.currentBlog = action.payload;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        status: '',
        tag: '',
        search: '',
      };
    },
    clearBlogsByTag: (state) => {
      state.blogsByTag = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch all blogs
    builder
      .addCase(fetchAllBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Fetch blog by slug
    builder
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBlog = action.payload.data;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Fetch blogs by tag
    builder
      .addCase(fetchBlogsByTag.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogsByTag.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogsByTag = action.payload.data;
      })
      .addCase(fetchBlogsByTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Create blog
    builder
      .addCase(createBlog.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isCreating = false;
        state.blogs.unshift(action.payload.data);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

    // Update blog
    builder
      .addCase(updateBlog.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.blogs.findIndex(blog => blog._id === action.payload.data._id);
        if (index !== -1) {
          state.blogs[index] = action.payload.data;
        }
        if (state.currentBlog && state.currentBlog._id === action.payload.data._id) {
          state.currentBlog = action.payload.data;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

    // Delete blog
    builder
      .addCase(deleteBlog.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.blogs = state.blogs.filter(blog => blog._id !== action.payload.id);
        if (state.currentBlog && state.currentBlog._id === action.payload.id) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearBlogError,
  setCurrentBlog,
  clearCurrentBlog,
  updateFilters,
  resetFilters,
  clearBlogsByTag,
} = blogSlice.actions;

export default blogSlice.reducer;