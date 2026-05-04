import axios from '@/api/axios'

const auditLogsApi = {
  getLogs(params = {}) {
    return axios.get('/audit-logs', { params })
  },
}

export default auditLogsApi
