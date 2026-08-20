import axios from '@/api/axios'

const reportsApi = {
  getSalesReport(params = {}) {
    // params: { type: 'daily'|'monthly'|'yearly'|'custom', date, year, month, from_date, to_date, customer_id, product_id, invoice_number }
    return axios.get('/reports/sales', { params })
  },
  getStockReport(params = {}) {
    // params: { category_id, product, stock_status, per_page }
    return axios.get('/reports/stock', { params })
  },
  getProfitLoss(params = {}) {
    // params: same date and product/customer filters as getSalesReport
    return axios.get('/reports/profit-loss', { params })
  },
  getStockMovements(params = {}) {
    return axios.get('/reports/stock-movements', { params })
  }
}

export default reportsApi
