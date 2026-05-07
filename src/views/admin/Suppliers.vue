<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold dark:text-white">Suppliers</div>
        <div class="text-caption text-grey-6 dark:text-grey-4">Manage supplier master data and purchase records</div>
      </div>
    </div>

    <!-- Filters + Actions -->
    <q-card flat bordered class="q-mb-md dark:bg-gray-800">
      <q-card-section>
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-sm-5 col-md-4">
            <q-input v-model="search" placeholder="Search name, phone or company…" dense outlined clearable @update:model-value="fetchList">
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-auto q-ml-auto">
            <q-btn unelevated color="primary" icon="add_business" label="Add Supplier" @click="openForm()" />
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
            <div class="text-caption text-grey-6">{{ props.row.company || '—' }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-contact="props">
          <q-td :props="props">
            <div>{{ props.row.contact_person || '—' }}</div>
            <div class="text-caption text-grey-6">{{ props.row.phone || '—' }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.is_active ? 'positive' : 'grey'" class="q-px-sm">
              {{ props.row.is_active ? 'Active' : 'Inactive' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn icon="history" flat round dense size="sm" color="info" @click="openHistory(props.row)">
              <q-tooltip>Purchase History</q-tooltip>
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
            <q-icon name="storefront" size="md" class="q-mr-sm" />No suppliers found
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">{{ editing ? 'Edit Supplier' : 'Add Supplier' }}</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.name" label="Name *" outlined dense :rules="[v => !!v || 'Required']" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.company" label="Company" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.contact_person" label="Contact Person" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.phone" label="Phone" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.email" label="Email" outlined dense type="email" />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.city" label="City" outlined dense />
            </div>
            <div class="col-12">
              <q-input v-model="form.address" label="Address" outlined dense />
            </div>
            <div class="col-12">
              <q-input v-model="form.notes" label="Notes" outlined dense type="textarea" rows="2" />
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
          <div class="text-h6">Purchase History — {{ historySupplier?.name }}</div>
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
import suppliersApi from '@/services/suppliersApi'

const $q = useQuasar()
const items = ref([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const showForm = ref(false)
const showHistory = ref(false)
const editing = ref(null)
const historySupplier = ref(null)
const transactions = ref([])
const historyLoading = ref(false)

const form = ref({ name: '', company: '', contact_person: '', phone: '', email: '', city: '', address: '', notes: '', is_active: true })

const columns = [
  { name: 'name', label: 'Supplier', field: 'name', align: 'left', sortable: true },
  { name: 'contact', label: 'Contact', field: 'contact_person', align: 'left' },
  { name: 'city', label: 'City', field: 'city', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'status', label: 'Status', field: 'is_active', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' },
]

const txColumns = [
  { name: 'date', label: 'Date', field: row => formatDate(row.created_at), align: 'left' },
  { name: 'type', label: 'Type', field: 'type', align: 'left' },
  { name: 'amount', label: 'Amount', field: row => `PKR ${formatAmt(row.amount)}`, align: 'right' },
  { name: 'ref', label: 'Reference', field: 'reference', align: 'left' },
]

async function fetchList() {
  loading.value = true
  try {
    const res = await suppliersApi.getSuppliers({ search: search.value, per_page: 200 })
    const d = res.data?.data ?? res.data
    items.value = Array.isArray(d) ? d : (d?.data ?? [])
  } catch { items.value = [] }
  finally { loading.value = false }
}

function openForm(s = null) {
  editing.value = s
  form.value = s
    ? { name: s.name, company: s.company || '', contact_person: s.contact_person || '', phone: s.phone || '', email: s.email || '', city: s.city || '', address: s.address || '', notes: s.notes || '', is_active: s.is_active ?? true }
    : { name: '', company: '', contact_person: '', phone: '', email: '', city: '', address: '', notes: '', is_active: true }
  showForm.value = true
}

async function saveItem() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    if (editing.value) {
      await suppliersApi.updateSupplier(editing.value.id, { ...form.value })
      $q.notify({ type: 'positive', message: 'Supplier updated' })
    } else {
      await suppliersApi.createSupplier({ ...form.value })
      $q.notify({ type: 'positive', message: 'Supplier created' })
    }
    showForm.value = false
    fetchList()
  } catch (e) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || 'Failed to save' })
  } finally { saving.value = false }
}

async function deleteItem(s) {
  $q.dialog({ title: 'Delete Supplier', message: `Delete "${s.name}"?`, cancel: true, persistent: true }).onOk(async () => {
    try {
      await suppliersApi.deleteSupplier(s.id)
      $q.notify({ type: 'positive', message: 'Deleted' })
      fetchList()
    } catch { $q.notify({ type: 'negative', message: 'Failed to delete' }) }
  })
}

async function openHistory(s) {
  historySupplier.value = s
  showHistory.value = true
  historyLoading.value = true
  try {
    const res = await suppliersApi.getTransactions(s.id)
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
