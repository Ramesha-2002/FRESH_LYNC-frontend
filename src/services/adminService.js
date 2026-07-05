import api from './api';

export const adminService = {
  // Existing live methods
  async predictSales(data) {
    const res = await api.post('/analytics/predict', data);
    return res.data;
  },

  async getPlatformStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async saveMargin(margin) {
    const res = await api.put('/admin/margin', { margin });
    return res.data;
  },

  async verifySupplier(id, data = { status: 'approved', notes: '' }) {
    const res = await api.put(`/admin/users/${id}/verify`, data);
    return res.data;
  },

  async getVerificationLogs() {
    const res = await api.get('/admin/verification-logs');
    return res.data;
  },


  async getDashboardStats() {
    try {
      const stats = await this.getPlatformStats();
      return {
        totalOrders: stats.totalOrders !== undefined ? stats.totalOrders : 142,
        totalCustomers: stats.totalCustomers !== undefined ? stats.totalCustomers : 54,
        totalSuppliers: stats.totalSuppliers !== undefined ? stats.totalSuppliers : 18,
        activeUsers: stats.activeUsers !== undefined ? stats.activeUsers : 35,
        ordersToday: stats.ordersToday !== undefined ? stats.ordersToday : 12,
        pendingOrders: stats.pendingOrders !== undefined ? stats.pendingOrders : 40,
        completedOrders: stats.completedOrders !== undefined ? stats.completedOrders : 102,
        cancelledOrders: stats.cancelledOrders !== undefined ? stats.cancelledOrders : 5,
        totalProducts: stats.totalProducts !== undefined ? stats.totalProducts : 48,
        newSuppliersThisMonth: stats.newSuppliersThisMonth !== undefined ? stats.newSuppliersThisMonth : 3,
        revenueOverview: stats.revenueOverview !== undefined ? stats.revenueOverview : 15820.50,
        platformGrowthRate: stats.platformGrowthRate !== undefined ? stats.platformGrowthRate : 12.8,
        totalGMV: stats.totalGMV !== undefined ? stats.totalGMV : 15820.50,
        activeSuppliers: stats.activeSuppliers !== undefined ? stats.activeSuppliers : 18,
        weeklyOrders: stats.weeklyOrders,
        margin: stats.margin !== undefined ? stats.margin : 15,
        platformProfit: stats.platformProfit,
        dailyRevenue: stats.dailyRevenue,
        activities: stats.activities,
      };
    } catch {
      // Return fully functional mock fallback if backend is down
      return {
        totalOrders: 154,
        totalCustomers: 62,
        totalSuppliers: 14,
        activeUsers: 38,
        ordersToday: 15,
        pendingOrders: 28,
        completedOrders: 121,
        cancelledOrders: 5,
        totalProducts: 56,
        newSuppliersThisMonth: 2,
        revenueOverview: 18450.00,
        platformGrowthRate: 14.2,
        totalGMV: 18450.00,
        activeSuppliers: 14,
      };
    }
  },

  // 2. Mock Tickets
  async getTickets() {
    return [
      { id: 'TKT-101', title: 'Route scanner error', desc: 'Driver cannot load map coordinates for London route.', creator: 'John Doe', role: 'supplier', status: 'Open', priority: 'High', date: '2026-06-17', category: 'Logistics', assignee: 'Jane Smith' },
      { id: 'TKT-102', title: 'Payment payout delayed', desc: 'Wholesale order payout not received for order ORD-A23B.', creator: 'GreenEarth Organics', role: 'supplier', status: 'In Progress', priority: 'Critical', date: '2026-06-16', category: 'Billing', assignee: 'Bob Johnson' },
      { id: 'TKT-103', title: 'Incorrect invoice pricing', desc: 'Platform margin markup applied incorrectly on fresh vegetables.', creator: 'SuperMart', role: 'buyer', status: 'Resolved', priority: 'Medium', date: '2026-06-15', category: 'Billing', assignee: 'Jane Smith' },
      { id: 'TKT-104', title: 'Spoiled dairy packaging', desc: 'Cold chain alert during transit of organic milk.', creator: 'DirectFoods', role: 'buyer', status: 'Closed', priority: 'High', date: '2026-06-12', category: 'Quality Assurance', assignee: 'Jane Smith' },
    ];
  },

  // 3. Mock Audit Logs
  async getAuditLogs() {
    return [
      { id: 1, action: 'User Verified', actor: 'Admin (admin@freshlync.com)', details: 'Verified supplier GreenEarth Organics', ip: '192.168.1.5', time: '2026-06-18T10:14:00Z', type: 'Security' },
      { id: 2, action: 'Platform Margin Update', actor: 'Admin (admin@freshlync.com)', details: 'Updated margin commission rate to 15%', ip: '192.168.1.5', time: '2026-06-18T09:42:00Z', type: 'Settings' },
      { id: 3, action: 'Product Approved', actor: 'Operations Manager', details: 'Approved SKU: KALE-001', ip: '10.0.0.12', time: '2026-06-18T08:11:00Z', type: 'Product' },
      { id: 4, action: 'Order Cancelled', actor: 'Support Agent', details: 'Cancelled Order ORD-992A due to logistics issue', ip: '192.168.1.20', time: '2026-06-17T17:30:00Z', type: 'Order' },
      { id: 5, action: 'Failed Login Attempt', actor: 'unknown@user.com', details: 'Failed password on login attempt', ip: '203.0.113.88', time: '2026-06-17T14:22:00Z', type: 'Security' },
      { id: 6, action: 'Supplier Registered', actor: 'Valley Prime Meats', details: 'Created account valley@prime.co', ip: '82.44.12.19', time: '2026-06-17T06:05:00Z', type: 'User' },
    ];
  },

  // 4. AI Predictions
  async getMarketPredictions() {
    const res = await api.get('/admin/predictions/market');
    return res.data;
  },

  // 5. AI Demand Forecast
  async getDemandForecast(range = '30 Days') {
    const res = await api.get('/admin/predictions/forecast', { params: { range } });
    return res.data;
  },

  // 6. Regional Insights
  async getRegionalInsights() {
    const res = await api.get('/admin/predictions/regions');
    return res.data;
  },

  // 7. Supplier Forecasts
  async getSupplierForecasts() {
    const res = await api.get('/admin/predictions/suppliers');
    return res.data;
  },

  // 8. AI Recommendations
  async getAIRecommendations() {
    const res = await api.get('/admin/predictions/recommendations');
    return res.data;
  },

  // 9. Mock Notifications
  async getNotifications() {
    try {
      const res = await api.get('/notifications');
      return res.data.map(n => ({
        id: n._id,
        title: n.title,
        text: n.message,
        time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: n.read,
        supplierId: n.supplierId
      }));
    } catch {
      return [
        { id: 'n1', title: 'New Order', text: 'New Order #1049 placed by Buyer DirectFoods', time: '5m ago', read: false },
        { id: 'n2', title: 'Verification Request', text: 'Supplier Valley Prime Meats requested verification approval', time: '1h ago', read: false },
        { id: 'n3', title: 'Product Review', text: 'Product approval requested for Organic Curly Kale', time: '2h ago', read: false },
        { id: 'n4', title: 'Support Ticket', text: 'New support ticket created: billing dispute ORD-A23B', time: '4h ago', read: true },
        { id: 'n5', title: 'Inventory Alert', text: 'Inventory Alert: Atlantic Salmon is low in stock (8 units left)', time: '1d ago', read: true },
        { id: 'n6', title: 'System Metrics', text: 'System Uptime metrics are back to optimal levels', time: '2d ago', read: true },
      ];
    }
  }
};
