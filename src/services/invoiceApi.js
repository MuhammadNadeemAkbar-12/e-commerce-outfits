import axios from '@/api/axios'

const invoiceApi = {
  /**
   * Get paginated invoices with optional filters
   * @param {object} params - { page, per_page, payment_status, status, search, date_from, date_to }
   */
  getInvoices(params = {}) {
    return axios.get('/sales/invoices', { params })
  },

  /**
   * Get single invoice with items
   * @param {number|string} id
   */
  getInvoice(id) {
    return axios.get(`/sales/invoices/${id}`)
  },

  /**
   * Create a new invoice
   * @param {object} data - { customer_id, items, tax_amount, discount_amount, payment_status, status, notes, invoice_date }
   * items: [{ product_id, quantity, unit_price }]
   */
  createInvoice(data) {
    return axios.post('/sales/invoices', data)
  },

  /**
   * Update invoice payment status
   * @param {number|string} id
   * @param {string} paymentStatus - pending | paid | partial | refunded
   */
  updatePaymentStatus(id, paymentStatus) {
    return axios.patch(`/sales/invoices/${id}/payment-status`, { payment_status: paymentStatus })
  }
}

export default invoiceApi
