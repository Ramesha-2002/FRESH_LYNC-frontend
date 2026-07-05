import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const res = await api.get('/products', { params });
    return res.data;
  },

  async getProduct(id) {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  async getSupplierInventory(supplierId) {
    return this.getProducts({ supplierId, limit: 100 });
  },

  async createProduct(formData) {
    const res = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async addProduct(formData) {
    return this.createProduct(formData);
  },

  async updateProduct(id, data) {
    const isFormData = data instanceof FormData;
    const res = await api.put(`/products/${id}`, data, isFormData ? {
      headers: { 'Content-Type': 'multipart/form-data' },
    } : {});
    return res.data;
  },

  async deleteProduct(id) {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  async updateStock(id, stock) {
    const res = await api.patch(`/products/${id}/stock`, { stock });
    return res.data;
  },

  async appealProduct(id, reason) {
    const res = await api.post(`/products/${id}/appeal`, { reason });
    return res.data;
  },
};
