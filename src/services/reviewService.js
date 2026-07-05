import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/reviews`
  : 'http://localhost:5000/api/reviews';

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('fl_token')}`
  }
});

export const reviewService = {
  // Public
  getPublicReviews: async (page = 1, limit = 10) => {
    const res = await axios.get(`${API_URL}/public?page=${page}&limit=${limit}`);
    return res.data;
  },
  
  getReviewStats: async () => {
    const res = await axios.get(`${API_URL}/stats`);
    return res.data;
  },

  // User
  createReview: async (reviewData) => {
    const res = await axios.post(`${API_URL}/create`, reviewData, getConfig());
    return res.data;
  },

  // Admin
  getAllReviews: async (page = 1, limit = 20, status = 'all') => {
    const res = await axios.get(`${API_URL}/admin/all?page=${page}&limit=${limit}&status=${status}`, getConfig());
    return res.data;
  },

  getAdminReviewStats: async () => {
    const res = await axios.get(`${API_URL}/admin/stats`, getConfig());
    return res.data;
  },

  updateReviewStatus: async (id, updates) => {
    const res = await axios.put(`${API_URL}/admin/status/${id}`, updates, getConfig());
    return res.data;
  },

  deleteReview: async (id) => {
    const res = await axios.delete(`${API_URL}/admin/${id}`, getConfig());
    return res.data;
  }
};
