import axios from '@/api/axios'

const suppliersApi = {
  getSuppliers(params = {}) {
    return axios.get('/suppliers', { params })
  },
  getSupplier(id) {
    return axios.get(`/suppliers/${id}`)
  },
  getTransactions(id, params = {}) {
    return axios.get(`/suppliers/${id}/transactions`, { params })
  },
  createSupplier(data) {
    return axios.post('/suppliers', data)
  },
  updateSupplier(id, data) {
    return axios.patch(`/suppliers/${id}`, data)
  },
  deleteSupplier(id) {
    return axios.delete(`/suppliers/${id}`)
  }
}

export default suppliersApi
