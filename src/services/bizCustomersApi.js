import axios from '@/api/axios'

const bizCustomersApi = {
  getCustomers(params = {}) {
    return axios.get('/biz-customers', { params })
  },
  getCustomer(id) {
    return axios.get(`/biz-customers/${id}`)
  },
  getTransactions(id, params = {}) {
    return axios.get(`/biz-customers/${id}/transactions`, { params })
  },
  createCustomer(data) {
    return axios.post('/biz-customers', data)
  },
  updateCustomer(id, data) {
    return axios.patch(`/biz-customers/${id}`, data)
  },
  deleteCustomer(id) {
    return axios.delete(`/biz-customers/${id}`)
  }
}

export default bizCustomersApi
