<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Business Customers</h1>
        <p class="text-sm text-slate-500 mt-1">Manage customer master data and credit balances</p>
      </div>
      <q-btn unelevated color="primary" icon="person_add" label="Add Customer" @click="openForm()" />
    </div>

    <!-- Search -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5">
      <input v-model="search" @input="fetchList" type="text" placeholder="Search by name, phone or email..." class="input-base max-w-sm" />
    </div>

    <div v-if="loading" class="flex justify-center py-16"><q-spinner-dots color="primary" size="48px" /></div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">{{ error }}</div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div v-if="!items.length" class="text-center py-16 text-slate-400">
        <q-icon name="people" size="48px" class="mb-2 opacity-30" />
        <p>No customers yet. Add your first customer.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Phone</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">City</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Balance</th>
              <th class="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
              <th class="text-center px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="c in items" :key="c.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-medium text-slate-800">{{ c.name }}</td>
              <td class="px-4 py-3 text-slate-500">{{ c.phone || '—' }}</td>
              <td class="px-4 py-3 text-slate-500">{{ c.email || '—' }}</td>
              <td class="px-4 py-3 text-slate-500">{{ c.city || '—' }}</td>
              <td class="px-4 py-3 text-right font-mono" :class="c.balance >= 0 ? 'text-slate-800' : 'text-red-600'">
                PKR {{ fmt(c.balance) }}
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ c.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex gap-2 justify-center">
                  <button @click="openHistory(c)" class="text-slate-600 hover:underline text-xs">History</button>
                  <button @click="openForm(c)" class="text-indigo-600 hover:underline text-xs">Edit</button>
                  <button @click="deleteItem(c)" class="text-red-500 hover:underline text-xs">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 460px">
        <q-card-section class="border-b">
          <div class="text-lg font-bold">{{ editing ? 'Edit Customer' : 'Add Customer' }}</div>
        </q-card-section>
        <q-card-section>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="label-sm">Name *</label>
              <input v-model="form.name" type="text" class="input-base" required />
            </div>
            <div>
              <label class="label-sm">Phone</label>
              <input v-model="form.phone" type="text" class="input-base" />
            </div>
            <div>
              <label class="label-sm">Email</label>
              <input v-model="form.email" type="email" class="input-base" />
            </div>
            <div>
              <label class="label-sm">City</label>
              <input v-model="form.city" type="text" class="input-base" />
            </div>
            <div>
              <label class="label-sm">Address</label>
              <input v-model="form.address" type="text" class="input-base" />
            </div>
            <div class="col-span-2">
              <label class="label-sm">Notes</label>
              <input v-model="form.notes" type="text" class="input-base" />
            </div>
          </div>
          <div v-if="formError" class="mt-3 text-red-600 text-sm">{{ formError }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showForm = false" />
          <q-btn unelevated color="primary" :label="editing ? 'Update' : 'Create'" :loading="saving" @click="saveForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showHistory">
      <q-card style="min-width: 760px; max-width: 92vw;">
        <q-card-section class="border-b">
          <div class="text-lg font-bold">Customer Transactions: {{ historyTitle }}</div>
        </q-card-section>
        <q-card-section>
          <div v-if="historyLoading" class="flex justify-center py-8"><q-spinner-dots color="primary" size="32px" /></div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="text-left px-3 py-2">Invoice #</th>
                  <th class="text-left px-3 py-2">Date</th>
                  <th class="text-right px-3 py-2">Total</th>
                  <th class="text-center px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in historyRows" :key="tx.id" class="border-b border-slate-100">
                  <td class="px-3 py-2">{{ tx.invoice_number || '-' }}</td>
                  <td class="px-3 py-2">{{ tx.invoice_date || '-' }}</td>
                  <td class="px-3 py-2 text-right">PKR {{ fmt(tx.total_amount) }}</td>
                  <td class="px-3 py-2 text-center">{{ tx.payment_status || '-' }}</td>
                </tr>
                <tr v-if="!historyRows.length">
                  <td colspan="4" class="px-3 py-8 text-center text-slate-400">No transactions found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" @click="showHistory = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import bizCustomersApi from '@/services/bizCustomersApi'

const items = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')
const showForm = ref(false)
const showHistory = ref(false)
const historyLoading = ref(false)
const historyRows = ref([])
const historyTitle = ref('')
const editing = ref(null)
const saving = ref(false)
const formError = ref(null)
const form = reactive({ name: '', phone: '', email: '', city: '', address: '', notes: '' })

const fetchList = async () => {
  loading.value = true; error.value = null
  try {
    const res = await bizCustomersApi.getCustomers({ search: search.value })
    const d = res.data?.data ?? res.data
    items.value = Array.isArray(d) ? d : (d?.data ?? [])
  } catch (e) {
    error.value = e?.response?.data?.message || 'Failed to load customers'
  } finally { loading.value = false }
}

const openForm = (c = null) => {
  editing.value = c
  formError.value = null
  if (c) { Object.assign(form, { name: c.name, phone: c.phone || '', email: c.email || '', city: c.city || '', address: c.address || '', notes: c.notes || '' }) }
  else { Object.assign(form, { name: '', phone: '', email: '', city: '', address: '', notes: '' }) }
  showForm.value = true
}

const saveForm = async () => {
  if (!form.name.trim()) { formError.value = 'Name is required'; return }
  saving.value = true; formError.value = null
  try {
    if (editing.value) {
      await bizCustomersApi.updateCustomer(editing.value.id, { ...form })
    } else {
      await bizCustomersApi.createCustomer({ ...form })
    }
    showForm.value = false
    fetchList()
  } catch (e) {
    formError.value = e?.response?.data?.message || 'Failed to save'
  } finally { saving.value = false }
}

const deleteItem = async (c) => {
  if (!confirm(`Delete customer "${c.name}"?`)) return
  try {
    await bizCustomersApi.deleteCustomer(c.id)
    fetchList()
  } catch (e) { alert(e?.response?.data?.message || 'Delete failed') }
}

const openHistory = async (c) => {
  showHistory.value = true
  historyTitle.value = c.name
  historyRows.value = []
  historyLoading.value = true
  try {
    const res = await bizCustomersApi.getTransactions(c.id)
    const payload = res.data?.data ?? res.data
    historyRows.value = payload?.transactions?.data || payload?.transactions || []
  } catch (e) {
    alert(e?.response?.data?.message || 'Failed to load transactions')
  } finally {
    historyLoading.value = false
  }
}

const fmt = (v) => Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

onMounted(fetchList)
</script>

<style scoped>
.input-base { @apply px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full; }
.label-sm { @apply block text-xs font-semibold text-slate-600 mb-1; }
</style>
