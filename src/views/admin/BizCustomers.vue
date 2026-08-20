<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold dark:text-white">Business Customers</div>
        <div class="text-caption text-grey-6 dark:text-grey-4">All registered business customers</div>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md dark:bg-gray-800">
      <q-card-section>
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-sm-5 col-md-4">
            <q-input v-model="search" placeholder="Search name, phone or email…" dense outlined clearable @update:model-value="fetchList">
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-auto q-ml-auto">
            <q-btn unelevated color="primary" icon="person_add" label="Add Customer" @click="openForm()" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered class="dark:bg-gray-800">
      <q-table
        :rows="items"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 15 }"
        flat bordered
      >
        <template v-slot:loading><q-inner-loading showing color="primary" /></template>

        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.name }}</div>
            <div class="text-caption text-grey-6">{{ props.row.email || '—' }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-balance="props">
          <q-td :props="props">
            <span :class="props.row.balance >= 0 ? 'text-positive' : 'text-negative'" class="text-weight-medium">
              PKR {{ formatAmt(props.row.balance) }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.is_active ? 'positive' : 'grey'" class="text-capitalize q-px-sm">
              {{ props.row.is_active ? 'Active' : 'Inactive' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn icon="history" flat round dense size="sm" color="info" @click="openHistory(props.row)">
              <q-tooltip>Transaction History</q-tooltip>
            </q-btn>
            <q-btn icon="edit" flat round dense size="sm" color="warning" @click="openForm(props.row)">
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
            <q-btn icon="delete" flat round dense size="sm" color="negative" @click="deleteItem(props.row)">
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-lg text-grey-6">
            <q-icon name="people" size="md" class="q-mr-sm" />No customers found
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 480px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ editing ? 'Edit Customer' : 'Add Customer' }}</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input v-model="form.name" label="Name *" outlined dense :rules="[v => !!v || 'Required']" />
            </div>
            <div class="col-6">
              <q-input v-model="form.phone" label="Phone" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="form.email" label="Email" outlined dense type="email" />
            </div>
            <div class="col-12">
              <q-input v-model="form.address" label="Address" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="form.city" label="City" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model.number="form.credit_limit" label="Credit Limit" outlined dense type="number" />
            </div>
            <div class="col-12">
              <q-toggle v-model="form.is_active" label="Active" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated color="primary" :label="editing ? 'Update' : 'Create'" @click="saveItem" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Transaction History Dialog -->
    <q-dialog v-model="showHistory">
      <q-card style="min-width: 560px; max-width: 700px">
        <q-card-section class="row items-center bg-grey-2 q-pa-md">
          <div class="text-h6">Transaction History — {{ historyCustomer?.name }}</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div v-if="historyLoading" class="row justify-center q-pa-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
          <q-table v-else :rows="transactions" :columns="txColumns" row-key="id" flat bordered :pagination="{ rowsPerPage: 10 }" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import bizCustomersApi from '@/services/bizCustomersApi'

const $q = useQuasar()
const items = ref([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const showForm = ref(false)
const showHistory = ref(false)
const editing = ref(null)
const historyCustomer = ref(null)
const transactions = ref([])
const historyLoading = ref(false)

const form = ref({ name: '', phone: '', email: '', address: '', city: '', credit_limit: 0, is_active: true })

const columns = [
  { name: 'name', label: 'Customer', field: 'name', align: 'left', sortable: true },
  { name: 'phone', label: 'Phone', field: 'phone', align: 'left' },
  { name: 'city', label: 'City', field: 'city', align: 'left' },
  { name: 'balance', label: 'Balance', field: 'balance', align: 'right', sortable: true },
  { name: 'status', label: 'Status', field: 'is_active', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' },
]

const txColumns = [
  { name: 'date', label: 'Date', field: row => formatDate(row.created_at), align: 'left' },
  { name: 'type', label: 'Type', field: 'type', align: 'left' },
  { name: 'amount', label: 'Amount', field: row => `PKR ${formatAmt(row.amount)}`, align: 'right' },
  { name: 'ref', label: 'Reference', field: 'reference', align: 'left' },
  { name: 'notes', label: 'Notes', field: 'notes', align: 'left' },
]

async function fetchList() {
  loading.value = true
  try {
    const res = await bizCustomersApi.getCustomers({ search: search.value, per_page: 100 })
    const d = res.data?.data ?? res.data
    items.value = Array.isArray(d) ? d : (d?.data ?? [])
  } catch { items.value = [] }
  finally { loading.value = false }
}

function openForm(c = null) {
  editing.value = c
  form.value = c
    ? { name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', city: c.city || '', credit_limit: c.credit_limit || 0, is_active: c.is_active ?? true }
    : { name: '', phone: '', email: '', address: '', city: '', credit_limit: 0, is_active: true }
  showForm.value = true
}

async function saveItem() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    if (editing.value) {
      await bizCustomersApi.updateCustomer(editing.value.id, { ...form.value })
      $q.notify({ type: 'positive', message: 'Customer updated' })
    } else {
      await bizCustomersApi.createCustomer({ ...form.value })
      $q.notify({ type: 'positive', message: 'Customer created' })
    }
    showForm.value = false
    fetchList()
  } catch (e) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || 'Failed to save' })
  } finally { saving.value = false }
}

async function deleteItem(c) {
  $q.dialog({ title: 'Delete Customer', message: `Delete "${c.name}"?`, cancel: true, persistent: true }).onOk(async () => {
    try {
      await bizCustomersApi.deleteCustomer(c.id)
      $q.notify({ type: 'positive', message: 'Deleted' })
      fetchList()
    } catch { $q.notify({ type: 'negative', message: 'Failed to delete' }) }
  })
}

async function openHistory(c) {
  historyCustomer.value = c
  showHistory.value = true
  historyLoading.value = true
  try {
    const res = await bizCustomersApi.getTransactions(c.id)
    const td = res.data?.data ?? res.data
    transactions.value = Array.isArray(td) ? td : (td?.data ?? [])
  } catch { transactions.value = [] }
  finally { historyLoading.value = false }
}

function formatAmt(v) { return new Intl.NumberFormat('en-PK').format(Math.round(parseFloat(v) || 0)) }
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(fetchList)
</script>
