<template>
  <div class="invoice-page">
    <div class="invoice-shell p-4 sm:p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <section class="hero-panel mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="hero-title">Sales Invoices</h1>
            <p class="hero-subtitle">Track, filter and close billing records.</p>
          </div>
          <router-link :to="`${panelBase}/invoices/create`">
            <q-btn unelevated color="primary" icon="add" label="New Invoice" class="hero-btn" />
          </router-link>
        </div>
      </section>

      <!-- KPI row -->
      <section class="kpi-grid mb-5">
        <article class="kpi-card">
          <p class="kpi-label">Visible Invoices</p>
          <p class="kpi-value">{{ pageStats.total }}</p>
        </article>
        <article class="kpi-card">
          <p class="kpi-label">Paid</p>
          <p class="kpi-value text-emerald-700">{{ pageStats.paid }}</p>
        </article>
        <article class="kpi-card">
          <p class="kpi-label">Pending</p>
          <p class="kpi-value text-amber-700">{{ pageStats.pending }}</p>
        </article>
        <article class="kpi-card">
          <p class="kpi-label">Page Total</p>
          <p class="kpi-value">PKR {{ formatAmount(pageStats.value) }}</p>
        </article>
      </section>

      <!-- Filters -->
      <section class="filter-panel mb-5">
        <div class="filter-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <input
        v-model="filters.search"
        @input="applyFilters"
        type="text"
        placeholder="Search invoice/customer..."
        class="input-polish"
      />
      <input
        v-model.number="filters.product_id"
        @input="applyFilters"
        type="number"
        min="1"
        placeholder="Product ID"
        class="input-polish"
      />
      <input
        v-model="filters.from_date"
        @change="applyFilters"
        type="date"
        class="input-polish"
      />
      <input
        v-model="filters.to_date"
        @change="applyFilters"
        type="date"
        class="input-polish"
      />
      <select
        v-model="filters.payment_status"
        @change="applyFilters"
        class="input-polish"
      >
        <option value="">All Payment Status</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="partial">Partial</option>
        <option value="refunded">Refunded</option>
      </select>
      <select
        v-model="filters.status"
        @change="applyFilters"
        class="input-polish"
      >
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="finalized">Finalized</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <q-btn flat icon="restart_alt" label="Reset" @click="resetFilters" class="justify-self-start reset-btn" />
        </div>
      </section>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <q-spinner-dots color="primary" size="48px" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-center">
      {{ error }}
      <button @click="fetchInvoices" class="ml-2 underline font-medium">Retry</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!invoices.length" class="text-center py-16 text-slate-400 panel-muted rounded-2xl">
      <q-icon name="receipt_long" size="56px" class="mb-3 opacity-30" />
      <p class="text-lg font-medium">No invoices found</p>
      <p class="text-sm mt-1">Create your first invoice to get started</p>
    </div>

    <!-- Table -->
    <div v-else class="ledger-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="ledger-head border-b border-slate-200">
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
              class="ledger-row transition-colors"
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
                    class="table-action"
                  >
                    View
                  </button>
                  <button
                    @click="openPrint(inv)"
                    class="table-action"
                  >
                    Print
                  </button>
                  <button
                    v-if="inv.payment_status !== 'paid'"
                    @click="markPaid(inv)"
                    class="table-action table-action-ok"
                  >
                    Mark Paid
                  </button>
                  <button v-if="inv.status === 'draft'" @click="finalizeInvoice(inv)" class="table-action table-action-ok">Finalize</button>
                  <button v-if="inv.status !== 'cancelled'" @click="cancelInvoice(inv)" class="table-action text-red-600">Cancel</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white/80">
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
      <q-card v-if="selectedInvoice" class="dialog-polish" style="min-width: 560px">
        <q-card-section class="border-b">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-lg font-bold text-slate-900">{{ selectedInvoice.invoice_number }}</div>
              <div class="text-sm text-slate-500 mt-1">{{ formatDate(selectedInvoice.invoice_date) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <q-btn flat icon="print" label="Print" @click="printInvoice" class="dialog-btn" />
              <q-btn flat icon="download" label="Download" @click="downloadInvoice" class="dialog-btn" />
              <q-btn flat round icon="close" @click="showDetail = false" />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
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
          <table class="w-full text-sm mb-4 rounded-xl overflow-hidden">
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
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import invoiceApi from '@/services/invoiceApi'

const router = useRouter()
const panelBase = router.currentRoute.value.path.startsWith('/sales') ? '/sales' : '/seller'

const invoices = ref([])
const loading = ref(false)
const error = ref(null)
const showDetail = ref(false)
const selectedInvoice = ref(null)

const filters = reactive({
  search: '',
  product_id: null,
  from_date: '',
  to_date: '',
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

const pageStats = computed(() => {
  const paid = invoices.value.filter((i) => i.payment_status === 'paid').length
  const pending = invoices.value.filter((i) => i.payment_status === 'pending').length
  const value = invoices.value.reduce((sum, i) => sum + Number(i.grand_total || 0), 0)

  return {
    total: invoices.value.length,
    paid,
    pending,
    value,
  }
})

const fetchInvoices = async () => {
  loading.value = true
  error.value = null
  try {
    const params = {
      ...filters,
      product_id: filters.product_id || undefined,
      from_date: filters.from_date || undefined,
      to_date: filters.to_date || undefined,
      search: filters.search || undefined,
      payment_status: filters.payment_status || undefined,
      status: filters.status || undefined,
    }

    const res = await invoiceApi.getInvoices(params)
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

const applyFilters = () => {
  filters.page = 1
  fetchInvoices()
}

const resetFilters = () => {
  filters.search = ''
  filters.product_id = null
  filters.from_date = ''
  filters.to_date = ''
  filters.payment_status = ''
  filters.status = ''
  filters.page = 1
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

const finalizeInvoice = async (inv) => {
  if (!confirm(`Finalize ${inv.invoice_number}? This will deduct stock.`)) return
  try { await invoiceApi.finalizeInvoice(inv.id); inv.status = 'finalized' }
  catch (e) { alert(e?.response?.data?.message || 'Unable to finalize invoice') }
}

const cancelInvoice = async (inv) => {
  if (!confirm(`Cancel ${inv.invoice_number}? Finalized invoices will restore stock.`)) return
  try { await invoiceApi.cancelInvoice(inv.id); inv.status = 'cancelled' }
  catch (e) { alert(e?.response?.data?.message || 'Unable to cancel invoice') }
}

const printInvoice = () => {
  if (!selectedInvoice.value) return
  const id = selectedInvoice.value.id
  showDetail.value = false
  router.push(`${panelBase}/invoices/${id}/print`)
}

const downloadInvoice = () => {
  if (!selectedInvoice.value) return
  const id = selectedInvoice.value.id
  showDetail.value = false
  router.push(`${panelBase}/invoices/${id}/print`)
}

const openPrint = (inv) => {
  router.push(`${panelBase}/invoices/${inv.id}/print`)
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

<style scoped>
.invoice-page {
  --ink-1: #0f172a;
  --ink-2: #334155;
  min-height: 100%;
  background: #f8fafc;
}

.hero-panel {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  padding: 22px 24px;
}

.hero-title {
  margin: 0 0 4px;
  color: #0f172a;
  font-size: 1.65rem;
  font-weight: 700;
  line-height: 1.2;
}

.hero-subtitle {
  color: #64748b;
  font-size: 0.88rem;
}

.hero-btn {
  border-radius: 10px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.75rem;
}

.kpi-card {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 16px;
  padding: 0.8rem 0.95rem;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
}

.kpi-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.kpi-value {
  margin-top: 0.2rem;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--ink-1);
}

.filter-panel {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  padding: 0.9rem;
}

.input-polish {
  width: 100%;
  border-radius: 11px;
  border: 1px solid #cbd5e1;
  background: #fff;
  padding: 0.56rem 0.72rem;
  font-size: 0.84rem;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-polish:focus {
  border-color: #0e7490;
  box-shadow: 0 0 0 3px rgba(14, 116, 144, 0.14);
}

.reset-btn {
  color: #0e7490;
  border-radius: 10px;
}

.panel-muted {
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.72);
}

.ledger-card {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(255, 255, 255, 0.93);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.ledger-head {
  background: linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%);
}

.ledger-row:nth-child(even) {
  background: rgba(248, 250, 252, 0.62);
}

.ledger-row:hover {
  background: rgba(224, 242, 254, 0.35);
}

.table-action {
  font-size: 0.74rem;
  font-weight: 700;
  color: #0e7490;
}

.table-action-ok {
  color: #047857;
}

.dialog-polish {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.dialog-btn {
  color: #0e7490;
}

@media (min-width: 640px) {
  .hero-panel {
    padding: 1.2rem 1.35rem;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
