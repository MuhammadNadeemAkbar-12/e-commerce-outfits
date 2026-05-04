<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Sales Invoices</h1>
        <p class="text-sm text-slate-500 mt-1">Manage and view all sales invoices</p>
      </div>
      <router-link to="/seller/invoices/create">
        <q-btn unelevated color="primary" icon="add" label="New Invoice" />
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <input
        v-model="filters.search"
        @input="fetchInvoices"
        type="text"
        placeholder="Search invoice number..."
        class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select
        v-model="filters.payment_status"
        @change="fetchInvoices"
        class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Payment Status</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="partial">Partial</option>
        <option value="refunded">Refunded</option>
      </select>
      <select
        v-model="filters.status"
        @change="fetchInvoices"
        class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="finalized">Finalized</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <q-spinner-dots color="primary" size="48px" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
      {{ error }}
      <button @click="fetchInvoices" class="ml-2 underline font-medium">Retry</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!invoices.length" class="text-center py-16 text-slate-400">
      <q-icon name="receipt_long" size="56px" class="mb-3 opacity-30" />
      <p class="text-lg font-medium">No invoices found</p>
      <p class="text-sm mt-1">Create your first invoice to get started</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Invoice #</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Customer</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Total</th>
              <th class="text-center px-4 py-3 font-semibold text-slate-600">Payment</th>
              <th class="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
              <th class="text-center px-4 py-3 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="inv in invoices"
              :key="inv.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-4 py-3 font-mono font-medium text-indigo-700">{{ inv.invoice_number }}</td>
              <td class="px-4 py-3 text-slate-700">{{ inv.customer?.name || '—' }}</td>
              <td class="px-4 py-3 text-slate-500">{{ formatDate(inv.invoice_date) }}</td>
              <td class="px-4 py-3 text-right font-semibold text-slate-800">
                PKR {{ formatAmount(inv.grand_total) }}
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="paymentBadge(inv.payment_status)" class="px-2 py-1 rounded-full text-xs font-medium capitalize">
                  {{ inv.payment_status }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="statusBadge(inv.status)" class="px-2 py-1 rounded-full text-xs font-medium capitalize">
                  {{ inv.status }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="viewInvoice(inv)"
                    class="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                  >
                    View
                  </button>
                  <button
                    v-if="inv.payment_status !== 'paid'"
                    @click="markPaid(inv)"
                    class="text-green-600 hover:text-green-800 font-medium text-xs"
                  >
                    Mark Paid
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <span class="text-sm text-slate-500">
          Page {{ pagination.current_page }} of {{ pagination.last_page }}
        </span>
        <div class="flex gap-2">
          <q-btn
            dense flat
            icon="chevron_left"
            :disable="pagination.current_page <= 1"
            @click="changePage(pagination.current_page - 1)"
          />
          <q-btn
            dense flat
            icon="chevron_right"
            :disable="pagination.current_page >= pagination.last_page"
            @click="changePage(pagination.current_page + 1)"
          />
        </div>
      </div>
    </div>

    <!-- Invoice Detail Dialog -->
    <q-dialog v-model="showDetail" max-width="640px">
      <q-card v-if="selectedInvoice" style="min-width: 560px">
        <q-card-section class="border-b">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-lg font-bold text-slate-900">{{ selectedInvoice.invoice_number }}</div>
              <div class="text-sm text-slate-500 mt-1">{{ formatDate(selectedInvoice.invoice_date) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <q-btn flat icon="print" label="Print" @click="printInvoice" />
              <q-btn flat icon="download" label="Download" @click="downloadInvoice" />
              <q-btn flat round icon="close" @click="showDetail = false" />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <div class="text-slate-500">Customer</div>
              <div class="font-medium">{{ selectedInvoice.customer?.name || '—' }}</div>
            </div>
            <div>
              <div class="text-slate-500">Created by</div>
              <div class="font-medium">{{ selectedInvoice.creator?.name || '—' }}</div>
            </div>
          </div>

          <!-- Items -->
          <table class="w-full text-sm mb-4">
            <thead class="bg-slate-50">
              <tr>
                <th class="text-left px-2 py-2 font-semibold text-slate-600">Product</th>
                <th class="text-center px-2 py-2 font-semibold text-slate-600">Qty</th>
                <th class="text-right px-2 py-2 font-semibold text-slate-600">Unit Price</th>
                <th class="text-right px-2 py-2 font-semibold text-slate-600">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in selectedInvoice.items" :key="item.id">
                <td class="px-2 py-2">
                  <div class="font-medium">{{ item.product_name }}</div>
                  <div class="text-xs text-slate-400">SKU: {{ item.sku }}</div>
                </td>
                <td class="px-2 py-2 text-center">{{ item.quantity }}</td>
                <td class="px-2 py-2 text-right">PKR {{ formatAmount(item.unit_price) }}</td>
                <td class="px-2 py-2 text-right font-medium">PKR {{ formatAmount(item.line_total) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals -->
          <div class="border-t pt-3 space-y-1 text-sm">
            <div class="flex justify-between text-slate-600">
              <span>Subtotal</span><span>PKR {{ formatAmount(selectedInvoice.subtotal) }}</span>
            </div>
            <div v-if="selectedInvoice.tax_amount > 0" class="flex justify-between text-slate-600">
              <span>Tax</span><span>PKR {{ formatAmount(selectedInvoice.tax_amount) }}</span>
            </div>
            <div v-if="selectedInvoice.discount_amount > 0" class="flex justify-between text-green-600">
              <span>Discount</span><span>-PKR {{ formatAmount(selectedInvoice.discount_amount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-slate-900 text-base border-t pt-2 mt-2">
              <span>Grand Total</span><span>PKR {{ formatAmount(selectedInvoice.grand_total) }}</span>
            </div>
          </div>

          <div v-if="selectedInvoice.notes" class="mt-3 bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
            <span class="font-medium">Notes:</span> {{ selectedInvoice.notes }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import invoiceApi from '@/services/invoiceApi'

const invoices = ref([])
const loading = ref(false)
const error = ref(null)
const showDetail = ref(false)
const selectedInvoice = ref(null)

const filters = reactive({
  search: '',
  payment_status: '',
  status: '',
  page: 1,
  per_page: 15
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0
})

const fetchInvoices = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await invoiceApi.getInvoices({ ...filters })
    const d = res.data?.data ?? res.data
    if (Array.isArray(d)) {
      invoices.value = d
    } else {
      invoices.value = d?.data ?? []
      pagination.current_page = d?.current_page ?? 1
      pagination.last_page = d?.last_page ?? 1
      pagination.total = d?.total ?? 0
    }
  } catch (e) {
    error.value = e?.response?.data?.message || 'Failed to load invoices'
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  filters.page = page
  fetchInvoices()
}

const viewInvoice = async (inv) => {
  try {
    const res = await invoiceApi.getInvoice(inv.id)
    selectedInvoice.value = res.data?.data ?? res.data
    showDetail.value = true
  } catch (e) {
    selectedInvoice.value = inv
    showDetail.value = true
  }
}

const markPaid = async (inv) => {
  try {
    await invoiceApi.updatePaymentStatus(inv.id, 'paid')
    inv.payment_status = 'paid'
  } catch (e) {
    alert(e?.response?.data?.message || 'Failed to update payment status')
  }
}

const printInvoice = () => {
  window.print()
}

const downloadInvoice = () => {
  if (!selectedInvoice.value) return
  const payload = JSON.stringify(selectedInvoice.value, null, 2)
  const blob = new Blob([payload], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${selectedInvoice.value.invoice_number || 'invoice'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
const formatAmount = (v) => Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const paymentBadge = (s) => ({
  'bg-yellow-100 text-yellow-700': s === 'pending',
  'bg-green-100 text-green-700': s === 'paid',
  'bg-blue-100 text-blue-700': s === 'partial',
  'bg-red-100 text-red-700': s === 'refunded',
})

const statusBadge = (s) => ({
  'bg-slate-100 text-slate-600': s === 'draft',
  'bg-indigo-100 text-indigo-700': s === 'finalized',
  'bg-red-100 text-red-600': s === 'cancelled',
})

onMounted(fetchInvoices)
</script>
