<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Sale Returns</h1>
        <p class="text-sm text-slate-500 mt-1">Process and track returned sales with stock adjustments</p>
      </div>
      <q-btn unelevated color="primary" icon="assignment_return" label="New Return" to="/seller/returns/create" />
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <select v-model="filters.status" @change="fetchReturns" class="input-base">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <input v-model="filters.search" @input="fetchReturns" type="text" placeholder="Invoice ID..." class="input-base" />
      <button @click="() => { filters.status = ''; filters.search = ''; fetchReturns() }" class="text-sm text-indigo-600 hover:underline text-left">Reset</button>
    </div>

    <div v-if="loading" class="flex justify-center py-16"><q-spinner-dots color="primary" size="48px" /></div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
      {{ error }} <button @click="fetchReturns" class="ml-2 underline">Retry</button>
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div v-if="!returns.length" class="text-center py-16 text-slate-400">
        <q-icon name="assignment_return" size="48px" class="mb-2 opacity-30" />
        <p>No returns found</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Return #</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Invoice</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Reason</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Refund</th>
              <th class="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              <th class="text-center px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="r in returns" :key="r.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-mono font-medium text-indigo-700">{{ r.return_number }}</td>
              <td class="px-4 py-3 text-slate-600">{{ r.invoice?.invoice_number || '#' + r.invoice_id }}</td>
              <td class="px-4 py-3 text-slate-500 text-xs">{{ r.reason || '—' }}</td>
              <td class="px-4 py-3 text-right font-semibold text-slate-800">PKR {{ fmt(r.total_refund) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="statusBadge(r.status)" class="px-2 py-1 rounded-full text-xs font-medium capitalize">{{ r.status }}</span>
              </td>
              <td class="px-4 py-3 text-xs text-slate-500">{{ fmtDate(r.created_at) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex gap-2 justify-center">
                  <button @click="viewReturn(r)" class="text-indigo-600 hover:underline text-xs">View</button>
                  <template v-if="r.status === 'pending'">
                    <button @click="processReturn(r, 'approved')" class="text-green-600 hover:underline text-xs">Approve</button>
                    <button @click="processReturn(r, 'rejected')" class="text-red-500 hover:underline text-xs">Reject</button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Dialog -->
    <q-dialog v-model="showDetail" max-width="560px">
      <q-card v-if="selected" style="min-width: 500px">
        <q-card-section class="border-b flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-900">{{ selected.return_number }}</div>
            <div class="text-xs text-slate-400">{{ fmtDate(selected.created_at) }}</div>
          </div>
          <q-btn flat round icon="close" @click="showDetail = false" />
        </q-card-section>
        <q-card-section>
          <table class="w-full text-sm mb-3">
            <thead class="bg-slate-50">
              <tr>
                <th class="text-left px-2 py-2">Product</th>
                <th class="text-center px-2 py-2">Qty</th>
                <th class="text-right px-2 py-2">Unit Price</th>
                <th class="text-right px-2 py-2">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in selected.items" :key="item.id">
                <td class="px-2 py-2">{{ item.product_name }}</td>
                <td class="px-2 py-2 text-center">{{ item.quantity }}</td>
                <td class="px-2 py-2 text-right">PKR {{ fmt(item.unit_price) }}</td>
                <td class="px-2 py-2 text-right font-medium">PKR {{ fmt(item.line_total) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="flex justify-end font-bold text-slate-900 border-t pt-2">
            Total Refund: PKR {{ fmt(selected.total_refund) }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Create Return Dialog -->
    <q-dialog v-model="showCreate" persistent>
      <q-card style="min-width: 480px">
        <q-card-section class="border-b">
          <div class="text-lg font-bold">New Sale Return</div>
        </q-card-section>
        <q-card-section>
          <div class="space-y-3">
            <div>
              <label class="label-sm">Invoice ID</label>
              <div class="flex gap-2">
                <input v-model.number="newReturn.invoice_id" type="number" min="1" class="input-base" placeholder="Enter invoice ID" />
                <q-btn unelevated size="sm" color="indigo" label="Load" @click="loadInvoice" :loading="loadingInvoice" />
              </div>
            </div>

            <div v-if="invoiceItems.length">
              <label class="label-sm">Select Items to Return</label>
              <div v-for="item in invoiceItems" :key="item.id" class="flex items-center gap-3 border border-slate-200 rounded-lg p-3 mb-2">
                <input type="checkbox" v-model="item.selected" class="w-4 h-4" />
                <div class="flex-1">
                  <div class="text-sm font-medium">{{ item.product_name }}</div>
                  <div class="text-xs text-slate-400">Sold qty: {{ item.quantity }} × PKR {{ fmt(item.unit_price) }}</div>
                </div>
                <div v-if="item.selected">
                  <input v-model.number="item.returnQty" type="number" min="1" :max="item.quantity" class="w-16 input-base text-center" />
                </div>
              </div>
            </div>

            <div>
              <label class="label-sm">Reason</label>
              <input v-model="newReturn.reason" type="text" class="input-base" placeholder="Defective, wrong item, etc." />
            </div>
            <div v-if="createError" class="text-red-600 text-sm">{{ createError }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeCreate" />
          <q-btn unelevated color="primary" label="Submit Return" :loading="creating" @click="submitReturn" :disable="!invoiceItems.some(i => i.selected)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import returnsApi from '@/services/returnsApi'
import invoiceApi from '@/services/invoiceApi'

const returns = ref([])
const loading = ref(false)
const error = ref(null)
const showDetail = ref(false)
const selected = ref(null)
const showCreate = ref(false)
const creating = ref(false)
const createError = ref(null)
const loadingInvoice = ref(false)
const invoiceItems = ref([])

const filters = reactive({ status: '', search: '', page: 1 })
const newReturn = reactive({ invoice_id: '', reason: '' })

const fetchReturns = async () => {
  loading.value = true; error.value = null
  try {
    const res = await returnsApi.getReturns({ ...filters })
    const d = res.data?.data ?? res.data
    returns.value = Array.isArray(d) ? d : (d?.data ?? [])
  } catch (e) {
    error.value = e?.response?.data?.message || 'Failed to load returns'
  } finally {
    loading.value = false }
}

const viewReturn = async (r) => {
  try {
    const res = await returnsApi.getReturn(r.id)
    selected.value = res.data?.data ?? res.data
  } catch { selected.value = r }
  showDetail.value = true
}

const processReturn = async (r, status) => {
  try {
    await returnsApi.updateStatus(r.id, status)
    r.status = status
  } catch (e) {
    alert(e?.response?.data?.message || 'Failed to update return')
  }
}

const loadInvoice = async () => {
  if (!newReturn.invoice_id) return
  loadingInvoice.value = true
  try {
    const res = await invoiceApi.getInvoice(newReturn.invoice_id)
    const inv = res.data?.data ?? res.data
    invoiceItems.value = (inv.items || []).map(i => ({ ...i, selected: false, returnQty: 1 }))
  } catch (e) {
    alert(e?.response?.data?.message || 'Invoice not found')
  } finally {
    loadingInvoice.value = false
  }
}

const submitReturn = async () => {
  createError.value = null; creating.value = true
  try {
    const selectedItems = invoiceItems.value
      .filter(i => i.selected)
      .map(i => ({ invoice_item_id: i.id, quantity: i.returnQty || 1 }))

    await returnsApi.createReturn({
      invoice_id: newReturn.invoice_id,
      reason: newReturn.reason,
      items: selectedItems
    })
    closeCreate()
    fetchReturns()
  } catch (e) {
    createError.value = e?.response?.data?.message || 'Failed to create return'
  } finally {
    creating.value = false
  }
}

const closeCreate = () => {
  showCreate.value = false
  newReturn.invoice_id = ''; newReturn.reason = ''
  invoiceItems.value = []; createError.value = null
}

const fmt = (v) => Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const statusBadge = (s) => ({
  'bg-yellow-100 text-yellow-700': s === 'pending',
  'bg-green-100 text-green-700': s === 'approved',
  'bg-red-100 text-red-700': s === 'rejected',
})

onMounted(fetchReturns)
</script>

<style scoped>
.input-base { @apply px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full; }
.label-sm { @apply block text-xs font-semibold text-slate-600 mb-1; }
</style>
