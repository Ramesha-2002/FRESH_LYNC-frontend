import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async googleLogin(accessToken, role) {
    const res = await api.post('/auth/google', { accessToken, role });
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async getSupplierProfile() {
    return this.getMe();
  },

  async updateProfile(data) {
    const config = {};
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const res = await api.put('/auth/profile', data, config);
    return res.data;
  },

  async submitBusinessVerification(data) {
    const config = {};
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const res = await api.put('/auth/verify-details', data, config);
    return res.data;
  },


  async changePassword(currentPassword, newPassword) {
    const res = await api.put('/auth/password', { currentPassword, newPassword });
    return res.data;
  },
};
