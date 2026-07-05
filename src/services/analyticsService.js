import api from './api';

export const analyticsService = {
  async getSummary() {
    const res = await api.get('/analytics/summary');
    return res.data;
  },

  async getChartData() {
    const res = await api.get('/analytics/chart');
    return res.data;
  },

  async getEarnings() {
    const res = await api.get('/analytics/earnings');
    return res.data;
  },

  async getNotifications() {
    try {
      const res = await api.get('/notifications');
      return res.data.map(n => ({
        ...n,
        id: n._id
      }));
    } catch {
      return [
        { id: '1', title: 'New Order Received', message: 'You have a new order ORD-9019 for Organic Curly Kale.', type: 'order', read: false, createdAt: new Date(Date.now() - 15 * 60 * 1000) },
        { id: '2', title: 'Low Stock Alert', message: 'Your stock for Mixed Bell Peppers is below 50 units (currently 42).', type: 'stock', read: false, createdAt: new Date(Date.now() - 2 * 3600 * 1000) },
        { id: '3', title: 'Profile Verified', message: 'Your supplier profile verification has been approved by Admin.', type: 'system', read: true, createdAt: new Date(Date.now() - 24 * 3600 * 1000) },
        { id: '4', title: 'Payout Scheduled', message: 'Your payout of £1,540.00 is scheduled for processing.', type: 'payout', read: true, createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000) }
      ];
    }
  },

  async markNotificationAsRead(id) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllNotificationsAsRead() {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },

  async deleteNotification(id) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  }

};
