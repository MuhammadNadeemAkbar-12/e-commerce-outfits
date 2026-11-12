<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold dark:text-white">Sales Invoices</div>
        <div class="text-caption text-grey-6 dark:text-grey-4">All sales invoices across the platform</div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6 col-sm-3">
        <q-card flat bordered class="dark:bg-gray-800">
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Total</div>
            <div class="text-h6 text-weight-bold text-primary">{{ kpi.total }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered class="dark:bg-gray-800">
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Paid</div>
            <div class="text-h6 text-weight-bold text-positive">{{ kpi.paid }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered class="dark:bg-gray-800">
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Pending</div>
            <div class="text-h6 text-weight-bold text-warning">{{ kpi.pending }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered class="dark:bg-gray-800">
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Total Value</div>
            <div class="text-h6 text-weight-bold text-info">{{ formatAmt(kpi.value) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md dark:bg-gray-800">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-4 col-md-3">
            <q-input v-model="filters.search" placeholder="Invoice # or customer…" dense outlined clearable @update:model-value="fetchInvoices">
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-select v-model="filters.payment_status" :options="payStatusOpts" label="Payment" dense outlined emit-value map-options @update:model-value="fetchInvoices" />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-select v-model="filters.status" :options="statusOpts" label="Status" dense outlined emit-value map-options @update:model-value="fetchInvoices" />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-input v-model="filters.from_date" type="date" label="From" dense outlined @update:model-value="fetchInvoices" />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-input v-model="filters.to_date" type="date" label="To" dense outlined @update:model-value="fetchInvoices" />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-input v-model.number="filters.product_id" type="number" min="1" label="Product ID" dense outlined clearable @update:model-value="fetchInvoices" />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-input v-model.number="filters.biz_customer_id" type="number" min="1" label="Customer ID" dense outlined clearable @update:model-value="fetchInvoices" />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn flat icon="restart_alt" label="Reset" @click="resetFilters" dense />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered class="dark:bg-gray-800 invoice-table-card">
      <q-table
        class="invoice-table"
        :rows="invoices"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 15 }"
        flat bordered
        wrap-cells
      >
        <template v-slot:loading><q-inner-loading showing color="primary" /></template>

        <template v-slot:body-cell-invoice_number="props">
          <q-td :props="props">
            <span class="text-weight-medium text-primary">#{{ props.row.invoice_number }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-customer="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ customerLabel(props.row) }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-total="props">
          <q-td :props="props">
            <span class="text-weight-medium">{{ formatAmt(invoiceTotal(props.row)) }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-payment_status="props">
          <q-td :props="props">
            <q-badge :color="payColor(props.row.payment_status)" class="text-capitalize q-px-sm q-py-xs">
              {{ props.row.payment_status }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="statusColor(props.row.status)" outline class="text-capitalize q-px-sm q-py-xs">
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-date="props">
          <q-td :props="props">
            <span class="text-grey-7 text-sm">{{ formatDate(props.row.invoice_date) }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn icon="visibility" flat round dense size="sm" color="primary" @click="viewInvoice(props.row)">
              <q-tooltip>View Invoice</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-lg text-grey-6">
            <q-icon name="receipt_long" size="md" class="q-mr-sm" />No invoices found
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- View Dialog -->
    <q-dialog v-model="showDetail" maximized>
      <q-card v-if="selectedInvoice">
        <q-card-section class="row items-center bg-primary text-white q-pa-md">
          <div class="text-h6">Invoice #{{ selectedInvoice.invoice_number }}</div>
          <q-space />
          <q-btn
            class="q-mr-sm"
            icon="print"
            flat
            round
            dense
            :to="`/admin/invoices/${selectedInvoice.id}/print`"
          >
            <q-tooltip>Print / Save PDF (PKR)</q-tooltip>
          </q-btn>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6 col-sm-3">
              <div class="text-caption text-grey-6">Customer</div>
              <div class="text-weight-medium">{{ customerLabel(selectedInvoice) }}</div>
            </div>
            <div class="col-6 col-sm-3">
              <div class="text-caption text-grey-6">Date</div>
              <div class="text-weight-medium">{{ formatDate(selectedInvoice.invoice_date) }}</div>
            </div>
            <div class="col-6 col-sm-3">
              <div class="text-caption text-grey-6">Payment</div>
              <q-badge :color="payColor(selectedInvoice.payment_status)" class="text-capitalize">{{ selectedInvoice.payment_status }}</q-badge>
            </div>
            <div class="col-6 col-sm-3">
              <div class="text-caption text-grey-6">Status</div>
              <q-badge :color="statusColor(selectedInvoice.status)" outline class="text-capitalize">{{ selectedInvoice.status }}</q-badge>
            </div>
          </div>

          <q-table
            :rows="selectedInvoice.items || []"
            :columns="itemColumns"
            row-key="id"
            flat bordered
            :pagination="{ rowsPerPage: 50 }"
          />

          <div class="row justify-end q-mt-md">
            <div class="col-12 col-sm-4">
              <div class="row justify-between q-mb-xs">
                <span class="text-grey-6">Subtotal (PKR)</span>
                <span>{{ formatAmt(selectedInvoice.subtotal) }}</span>
              </div>
              <div class="row justify-between q-mb-xs">
                <span class="text-grey-6">Tax (PKR)</span>
                <span>{{ formatAmt(selectedInvoice.tax_amount) }}</span>
              </div>
              <div class="row justify-between q-mb-xs">
                <span class="text-grey-6">Discount (PKR)</span>
                <span class="text-negative">- {{ formatAmt(selectedInvoice.discount_amount) }}</span>
              </div>
              <q-separator class="q-my-sm" />
              <div class="row justify-between text-weight-bold text-h6">
                <span>Grand Total (PKR)</span>
                <span class="text-primary">{{ formatAmt(invoiceTotal(selectedInvoice)) }}</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { formatMoney as formatAmt } from '@/utils/currency'
import { ref, computed, onMounted } from 'vue'
import invoiceApi from '@/services/invoiceApi'

const invoices = ref([])
const loading = ref(false)
const showDetail = ref(false)
const selectedInvoice = ref(null)

const filters = ref({ search: '', payment_status: '', status: '', from_date: '', to_date: '', product_id: null, biz_customer_id: null })

const payStatusOpts = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Refunded', value: 'refunded' },
]
const statusOpts = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Finalized', value: 'finalized' },
  { label: 'Cancelled', value: 'cancelled' },
]

const columns = [
  { name: 'invoice_number', label: 'Invoice #', field: 'invoice_number', align: 'left', sortable: true },
  { name: 'customer', label: 'Customer', field: row => customerLabel(row), align: 'left', sortable: true },
  { name: 'total', label: 'Grand Total (PKR)', field: row => invoiceTotal(row), align: 'right', sortable: true },
  { name: 'payment_status', label: 'Payment', field: 'payment_status', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'date', label: 'Date', field: 'invoice_date', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'center' },
]

function customerLabel(row) {
  return row?.biz_customer?.name
    || row?.bizCustomer?.name
    || row?.customer?.name
    || row?.customer_name
    || 'Walk-in'
}

function invoiceTotal(row) {
  const value = row?.grand_total ?? row?.total_amount ?? 0
  return Number(value) || 0
}

const itemColumns = [
  { name: 'product', label: 'Product', field: row => row.product?.name || row.product_name || '—', align: 'left' },
  { name: 'qty', label: 'Qty', field: 'quantity', align: 'center' },
  { name: 'price', label: 'Unit Price', field: row => formatAmt(row.unit_price), align: 'right' },
  { name: 'subtotal', label: 'Subtotal', field: row => formatAmt((row.unit_price || 0) * (row.quantity || 0)), align: 'right' },
]

const kpi = computed(() => {
  const total = invoices.value.length
  const paid = invoices.value.filter(i => i.payment_status === 'paid').length
  const pending = invoices.value.filter(i => i.payment_status === 'pending').length
  const value = invoices.value.reduce((s, i) => s + invoiceTotal(i), 0)
  return { total, paid, pending, value }
})

async function fetchInvoices() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.payment_status) params.payment_status = filters.value.payment_status
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.from_date) params.from_date = filters.value.from_date
    if (filters.value.to_date) params.to_date = filters.value.to_date
    if (filters.value.product_id) params.product_id = filters.value.product_id
    if (filters.value.biz_customer_id) params.biz_customer_id = filters.value.biz_customer_id
    params.per_page = 200
    const res = await invoiceApi.getInvoices(params)
    const d = res.data?.data ?? res.data
    invoices.value = Array.isArray(d) ? d : (d?.data ?? [])
  } catch (e) {
    invoices.value = []
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.value = { search: '', payment_status: '', status: '', from_date: '', to_date: '', product_id: null, biz_customer_id: null }
  fetchInvoices()
}

async function viewInvoice(row) {
  try {
    const res = await invoiceApi.getInvoice(row.id)
    selectedInvoice.value = res.data?.data ?? res.data ?? row
  } catch {
    selectedInvoice.value = row
  }
  showDetail.value = true
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}
function payColor(s) {
  return s === 'paid' ? 'positive' : s === 'partial' ? 'warning' : s === 'refunded' ? 'grey' : 'orange'
}
function statusColor(s) {
  return s === 'finalized' ? 'positive' : s === 'cancelled' ? 'negative' : 'grey'
}

onMounted(fetchInvoices)
</script>

<style scoped>
.invoice-table-card {
  overflow-x: auto;
}
.invoice-table :deep(.q-table__middle) {
  overflow-x: auto;
}
@media (max-width: 640px) {
  .text-h5 {
    font-size: 1.15rem;
  }
}
</style>
