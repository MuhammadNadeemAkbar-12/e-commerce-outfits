<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold dark:text-white">Audit Logs</div>
        <div class="text-caption text-grey-6 dark:text-grey-4">Track who changed what and when across the platform</div>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md dark:bg-gray-800">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-6 col-sm-3 col-md-2">
            <q-select v-model="filters.action" :options="actionOpts" label="Action" dense outlined emit-value map-options @update:model-value="fetchLogs" />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-input v-model="filters.entity_type" label="Entity Type" placeholder="invoice, supplier…" dense outlined clearable @update:model-value="fetchLogs" />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-input v-model="filters.from_date" type="date" label="From" dense outlined @update:model-value="fetchLogs" />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-input v-model="filters.to_date" type="date" label="To" dense outlined @update:model-value="fetchLogs" />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn flat icon="restart_alt" label="Reset" @click="resetFilters" dense />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered class="dark:bg-gray-800">
      <q-table
        :rows="logs"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 20 }"
        flat bordered
      >
        <template v-slot:loading><q-inner-loading showing color="primary" /></template>

        <template v-slot:body-cell-when="props">
          <q-td :props="props">
            <span class="text-caption text-grey-7 whitespace-nowrap">{{ formatDate(props.row.created_at) }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-user="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.user?.name || 'System' }}</div>
            <div class="text-caption text-grey-6">{{ props.row.user?.email || '—' }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-badge :color="actionColor(props.row.action)" class="text-uppercase q-px-sm q-py-xs">
              {{ props.row.action }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-entity="props">
          <q-td :props="props">
            <div class="text-weight-medium text-capitalize">{{ props.row.entity_type }}</div>
            <div class="text-caption text-grey-6">ID: {{ props.row.entity_id || '—' }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-old_values="props">
          <q-td :props="props">
            <pre class="text-xs bg-grey-1 rounded q-pa-xs" style="max-width:200px;overflow:hidden;white-space:pre-wrap;word-break:break-all">{{ formatJson(props.row.old_values) }}</pre>
          </q-td>
        </template>

        <template v-slot:body-cell-new_values="props">
          <q-td :props="props">
            <pre class="text-xs bg-grey-1 rounded q-pa-xs" style="max-width:200px;overflow:hidden;white-space:pre-wrap;word-break:break-all">{{ formatJson(props.row.new_values) }}</pre>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-lg text-grey-6">
            <q-icon name="history" size="md" class="q-mr-sm" />No audit logs found
          </div>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import auditLogsApi from '@/services/auditLogsApi'

const logs = ref([])
const loading = ref(false)
const filters = ref({ action: '', entity_type: '', from_date: '', to_date: '' })

const actionOpts = [
  { label: 'All Actions', value: '' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
]

const columns = [
  { name: 'when', label: 'When', field: 'created_at', align: 'left', sortable: true },
  { name: 'user', label: 'User', field: 'user', align: 'left' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' },
  { name: 'entity', label: 'Entity', field: 'entity_type', align: 'left' },
  { name: 'old_values', label: 'Old Values', field: 'old_values', align: 'left' },
  { name: 'new_values', label: 'New Values', field: 'new_values', align: 'left' },
]

async function fetchLogs() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.action) params.action = filters.value.action
    if (filters.value.entity_type) params.entity_type = filters.value.entity_type
    if (filters.value.from_date) params.from_date = filters.value.from_date
    if (filters.value.to_date) params.to_date = filters.value.to_date
    params.per_page = 300
    const res = await auditLogsApi.getLogs(params)
    const d = res.data?.data ?? res.data
    logs.value = Array.isArray(d) ? d : (d?.data ?? [])
  } catch { logs.value = [] }
  finally { loading.value = false }
}

function resetFilters() {
  filters.value = { action: '', entity_type: '', from_date: '', to_date: '' }
  fetchLogs()
}

function actionColor(a) {
  return a === 'create' ? 'positive' : a === 'delete' ? 'negative' : 'warning'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatJson(v) {
  if (!v) return '—'
  try { return JSON.stringify(typeof v === 'string' ? JSON.parse(v) : v, null, 2) }
  catch { return String(v) }
}

onMounted(fetchLogs)
</script>
