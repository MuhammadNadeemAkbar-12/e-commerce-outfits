<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md"><div><div class="text-h5 text-weight-bold">Activity Logs</div><div class="text-caption text-grey-7">Administrative audit trail of important system actions.</div></div><q-btn flat icon="refresh" label="Refresh" :loading="loading" @click="fetchLogs" /></div>
    <q-card flat bordered class="q-mb-md"><q-card-section class="row q-col-gutter-sm">
      <div class="col-6 col-sm-3 col-md-2"><q-input v-model="filters.user_id" type="number" min="1" dense outlined label="User ID" @update:model-value="resetAndFetch" /></div>
      <div class="col-6 col-sm-3 col-md-2"><q-input v-model="filters.action" dense outlined label="Action" placeholder="invoice_finalized" @update:model-value="resetAndFetch" /></div>
      <div class="col-6 col-sm-3 col-md-2"><q-input v-model="filters.module" dense outlined label="Module" placeholder="invoice" @update:model-value="resetAndFetch" /></div>
      <div class="col-6 col-sm-3 col-md-2"><q-input v-model="filters.from_date" type="date" dense outlined label="From" @update:model-value="resetAndFetch" /></div>
      <div class="col-6 col-sm-3 col-md-2"><q-input v-model="filters.to_date" type="date" dense outlined label="To" @update:model-value="resetAndFetch" /></div>
      <div class="col-6 col-sm-3 col-md-2"><q-btn flat icon="restart_alt" label="Reset" @click="reset" /></div>
    </q-card-section></q-card>
    <q-banner v-if="error" rounded class="bg-red-1 text-negative q-mb-md">{{ error }}</q-banner>
    <q-card flat bordered><q-table flat :rows="logs" :columns="columns" row-key="id" :loading="loading" hide-pagination :rows-per-page-options="[0]" class="audit-table">
      <template #body-cell-user="props"><q-td :props="props"><div>{{ props.row.user?.name || 'System' }}</div><div class="text-caption text-grey-7">{{ props.row.user?.email || '—' }}</div></q-td></template>
      <template #body-cell-action="props"><q-td :props="props"><q-badge color="primary" class="text-uppercase">{{ props.row.action.replaceAll('_', ' ') }}</q-badge></q-td></template>
      <template #body-cell-reference="props"><q-td :props="props"><div class="text-capitalize">{{ props.row.module }}</div><div class="text-caption text-grey-7">{{ props.row.reference }}</div></q-td></template>
      <template #body-cell-description="props"><q-td :props="props" style="white-space: normal; min-width: 220px">{{ props.value }}</q-td></template>
      <template #body-cell-created_at="props"><q-td :props="props" class="text-caption whitespace-nowrap">{{ formatDate(props.value) }}</q-td></template>
      <template #no-data><div class="full-width row flex-center q-pa-lg text-grey-6"><q-icon name="history" size="md" class="q-mr-sm" />No activity logs found.</div></template>
    </q-table><q-separator /><q-card-actions align="between"><div class="text-caption text-grey-7">{{ pagination.total }} log(s) · Page {{ pagination.current_page }} of {{ pagination.last_page }}</div><q-pagination v-model="pagination.current_page" :max="pagination.last_page" :max-pages="5" direction-links boundary-links color="primary" @update:model-value="changePage" /></q-card-actions></q-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import auditLogsApi from '@/services/auditLogsApi'

const logs = ref([]); const loading = ref(false); const error = ref('')
const filters = reactive({ user_id: '', action: '', module: '', from_date: '', to_date: '', page: 1, per_page: 25 })
const pagination = reactive({ current_page: 1, last_page: 1, total: 0 })
const columns = [
  { name: 'user', label: 'User', field: 'user', align: 'left' }, { name: 'action', label: 'Action', field: 'action', align: 'left' },
  { name: 'reference', label: 'Module / Reference', field: 'reference', align: 'left' }, { name: 'description', label: 'Description', field: 'description', align: 'left' }, { name: 'created_at', label: 'Date / Time', field: 'created_at', align: 'left' },
]
const fetchLogs = async () => { loading.value = true; error.value = ''; try { const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')); const result = (await auditLogsApi.getLogs(params)).data?.data; logs.value = result?.data || []; pagination.current_page = result?.current_page || 1; pagination.last_page = result?.last_page || 1; pagination.total = result?.total || 0 } catch (e) { error.value = e?.response?.data?.message || 'Unable to load activity logs.' } finally { loading.value = false } }
const resetAndFetch = () => { filters.page = 1; fetchLogs() }
const changePage = (page) => { filters.page = page; fetchLogs() }
const reset = () => { Object.assign(filters, { user_id: '', action: '', module: '', from_date: '', to_date: '', page: 1, per_page: 25 }); fetchLogs() }
const formatDate = (value) => value ? new Date(value).toLocaleString('en-PK', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
onMounted(fetchLogs)
</script>
