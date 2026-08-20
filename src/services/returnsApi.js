import axios from '@/api/axios'

const returnsApi = {
  getReturns(params = {}) {
    return axios.get('/sale-returns', { params })
  },
  getReturn(id) {
    return axios.get(`/sale-returns/${id}`)
  },
  createReturn(data) {
    // data: { invoice_id, reason, notes, items: [{ invoice_item_id, quantity }] }
    return axios.post('/sale-returns', data)
  },
  updateStatus(id, status, notes = null) {
    return axios.patch(`/sale-returns/${id}/status`, { status, notes })
  },
  getReturnableInvoices() {
    return axios.get('/customer/returnable-invoices')
  },
  getCustomerReturns(params = {}) {
    return axios.get('/customer/returns', { params })
  },
  createCustomerReturn(data) {
    return axios.post('/customer/returns', data)
  }
}

export default returnsApi
