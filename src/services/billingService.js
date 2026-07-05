import api from './api';

export const billingService = {
  /**
   * Retrieves the B2B credit line summary and invoices.
   * @returns {Promise<object>} Billing dashboard data
   */
  getBillingData: async () => {
    const res = await api.get('/billing');
    return res.data;
  },

  /**
   * Requests a credit limit increase.
   * @param {number} requestAmount - Target credit limit
   * @returns {Promise<object>} Approval response with new credit limit
   */
  requestCreditIncrease: async (requestAmount) => {
    const res = await api.post('/billing/credit-request', { requestAmount });
    return res.data;
  },

  /**
   * Pays a B2B invoice.
   * @param {string} id - Invoice ObjectId
   * @returns {Promise<object>} Payment confirmation response
   */
  payInvoice: async (id) => {
    const res = await api.post(`/billing/invoices/${id}/pay`);
    return res.data;
  }
};
