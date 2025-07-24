// src/redux/features/blog/blogAPI.js
import axiosInstance from '../../../services/axios.config';

export const blogAPI = {
  // Get all blogs with pagination and filtering
  getAllBlogs: async (params = {}) => {
    const response = await axiosInstance.get('/blogs/', { params });
    return response.data;
  },

  // Get single blog by slug
  getBlogBySlug: async (slug) => {
    const response = await axiosInstance.get(`/blogs/${slug}`);
    return response.data;
  },

  // Get blogs by tag
  getBlogsByTag: async (tag) => {
    const response = await axiosInstance.get(`/blogs/tag/${tag}`);
    return response.data;
  },

  // Create new blog (protected route)
  createBlog: async (blogData) => {
    const response = await axiosInstance.post('/blogs/', blogData);
    return response.data;
  },

  // Update blog (protected route)
  updateBlog: async (id, blogData) => {
    const response = await axiosInstance.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  // Delete blog (protected route)
  deleteBlog: async (id) => {
    const response = await axiosInstance.delete(`/blogs/${id}`);
    return response.data;
  },
};