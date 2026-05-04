<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Audit Logs</h1>
      <p class="text-sm text-slate-500 mt-1">Track who changed what and when</p>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 grid grid-cols-1 sm:grid-cols-5 gap-3">
      <input v-model="filters.user_id" type="number" min="1" placeholder="User ID" class="input-base" @change="fetchLogs" />
      <select v-model="filters.action" class="input-base" @change="fetchLogs">
        <option value="">All Actions</option>
        <option value="create">Create</option>
        <option value="update">Update</option>
        <option value="delete">Delete</option>
      </select>
      <input v-model="filters.entity_type" type="text" placeholder="Entity Type (invoice, supplier...)" class="input-base" @change="fetchLogs" />
      <input v-model="filters.from_date" type="date" class="input-base" @change="fetchLogs" />
      <input v-model="filters.to_date" type="date" class="input-base" @change="fetchLogs" />
    </div>

    <div v-if="loading" class="flex justify-center py-16"><q-spinner-dots color="primary" size="48px" /></div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
      {{ error }} <button class="underline ml-2" @click="fetchLogs">Retry</button>
    </div>

    <div v-else class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="!logs.length" class="text-center py-16 text-slate-400">No audit logs found.</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">When</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">User</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Action</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Entity</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Old Values</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">New Values</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50 align-top">
              <td class="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-800">{{ log.user?.name || 'System' }}</div>
                <div class="text-xs text-slate-400">{{ log.user?.email || '—' }}</div>
              </td>
              <td class="px-4 py-3">
                <span :class="actionBadge(log.action)" class="px-2 py-1 rounded-full text-xs font-medium uppercase">{{ log.action }}</span>
              </td>
              <td class="px-4 py-3 text-xs text-slate-600">
                <div class="font-medium">{{ log.entity_type }}</div>
                <div>ID: {{ log.entity_id || '—' }}</div>
              </td>
              <td class="px-4 py-3 text-xs text-slate-600">
                <pre class="json-box">{{ formatJson(log.old_values) }}</pre>
              </td>
              <td class="px-4 py-3 text-xs text-slate-600">
                <pre class="json-box">{{ formatJson(log.new_values) }}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <span class="text-sm text-slate-500">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
        <div class="flex gap-2">
          <q-btn dense flat icon="chevron_left" :disable="pagination.current_page <= 1" @click="changePage(pagination.current_page - 1)" />
          <q-btn dense flat icon="chevron_right" :disable="pagination.current_page >= pagination.last_page" @click="changePage(pagination.current_page + 1)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import auditLogsApi from '@/services/auditLogsApi'

const logs = ref([])
const loading = ref(false)
const error = ref(null)

const filters = reactive({
  user_id: '',
  action: '',
  entity_type: '',
  from_date: '',
  to_date: '',
  page: 1,
  per_page: 20,
})

const pagination = reactive({ current_page: 1, last_page: 1 })

const fetchLogs = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await auditLogsApi.getLogs({ ...filters })
    const d = res.data?.data ?? res.data
    logs.value = Array.isArray(d) ? d : (d?.data ?? [])
    pagination.current_page = d?.current_page || 1
    pagination.last_page = d?.last_page || 1
  } catch (e) {
    error.value = e?.response?.data?.message || 'Failed to load audit logs'
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  filters.page = page
  fetchLogs()
}

const actionBadge = (action) => ({
  'bg-green-100 text-green-700': action === 'create',
  'bg-blue-100 text-blue-700': action === 'update',
  'bg-red-100 text-red-700': action === 'delete',
})

const formatDate = (d) => d ? new Date(d).toLocaleString('en-PK') : '—'
const formatJson = (obj) => obj ? JSON.stringify(obj, null, 2) : '—'

onMounted(fetchLogs)
</script>

<style scoped>
.input-base {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
}
.input-base:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}
.json-box {
  max-width: 240px;
  max-height: 140px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
}
</style>
