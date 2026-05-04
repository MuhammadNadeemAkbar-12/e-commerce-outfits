import axios from '@/api/axios'

const stockLedgerApi = {
  getMovements(params = {}) {
    return axios.get('/stock-movements', { params })
  },
  addMovement(data) {
    // data: { product_id, movement_type: 'in'|'out'|'adjustment', quantity, notes }
    return axios.post('/stock-movements', data)
  }
}

export default stockLedgerApi
