import axios from '@/api/axios'

export default {
  list(params = {}) {
    return axios.get('/low-stock-alerts', { params })
  },
  counts() {
    return axios.get('/low-stock-alerts/counts')
  },
  markRead(id) {
    return axios.patch(`/low-stock-alerts/${id}/read`)
  },
  markAllRead() {
    return axios.patch('/low-stock-alerts/read-all')
  },
}
