import axios from '@/api/axios'

export default {
  getPurchases(params = {}) { return axios.get('/purchases', { params }) },
  getPurchase(id) { return axios.get(`/purchases/${id}`) },
  createPurchase(data) { return axios.post('/purchases', data) },
  updateStatus(id, data) { return axios.patch(`/purchases/${id}/status`, data) },
}
