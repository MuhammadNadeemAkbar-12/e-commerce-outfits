import axios from '@/api/axios'

const reportsApi = {
  getSalesReport(params = {}) {
    // params: { type: 'daily'|'monthly'|'yearly', year, month }
    return axios.get('/reports/sales', { params })
  },
  getStockReport(params = {}) {
    // params: { low_stock_only, per_page }
    return axios.get('/reports/stock', { params })
  },
  getProfitLoss(params = {}) {
    // params: { type, year, month }
    return axios.get('/reports/profit-loss', { params })
  },
  getStockMovements(params = {}) {
    return axios.get('/reports/stock-movements', { params })
  }
}

export default reportsApi
