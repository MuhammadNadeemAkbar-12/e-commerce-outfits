<template>
  <div class="print-root">
    <!-- Screen toolbar (hidden when printing) -->
    <div class="screen-toolbar no-print">
      <div class="toolbar-inner">
        <router-link :to="`${panelBase}/invoices`">
          <q-btn flat dense icon="arrow_back" label="Back to Invoices" color="primary" />
        </router-link>
        <div class="toolbar-actions">
          <q-btn unelevated icon="print" label="Print Invoice" color="primary" @click="triggerPrint" />
          <q-btn outline icon="download" label="Save as PDF" color="slate" @click="savePdf" class="ml-2" />
        </div>
      </div>
    </div>

    <!-- Loading / error state -->
    <div v-if="loading" class="flex justify-center items-center py-24 no-print">
      <q-spinner-dots color="primary" size="52px" />
    </div>
    <div v-else-if="error" class="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 no-print">
      <div class="font-semibold mb-2">Failed to load invoice</div>
      <div class="text-sm">{{ error }}</div>
      <q-btn class="mt-4" label="Retry" color="primary" @click="loadInvoice" />
    </div>

    <!-- Printable Invoice -->
    <div v-else-if="invoice" id="invoice-printable" class="invoice-paper">
      <!-- Header -->
      <header class="invoice-header">
        <div class="company-block">
          <div class="company-name">StyleHub</div>
          <div class="company-tagline">Stock, Inventory &amp; Sales Management System</div>
          <div class="company-meta">
            <span>info@stylehub.com</span>
            <span>·</span>
            <span>www.stylehub.com</span>
          </div>
        </div>
        <div class="invoice-title-block">
          <div class="invoice-label">INVOICE</div>
          <div class="invoice-number">{{ invoice.invoice_number }}</div>
          <div class="invoice-badge" :class="paymentClass">
            {{ invoice.payment_status?.toUpperCase() }}
          </div>
        </div>
      </header>

      <div class="divider"></div>

      <!-- Invoice Meta -->
      <section class="invoice-meta-grid">
        <div class="meta-group">
          <div class="meta-label">Bill To</div>
          <div class="meta-value strong">{{ invoice.customer?.name || invoice.biz_customer?.name || 'Walk-in Customer' }}</div>
          <div v-if="invoice.customer?.phone || invoice.biz_customer?.phone" class="meta-value">{{ invoice.customer?.phone || invoice.biz_customer?.phone }}</div>
          <div v-if="invoice.customer?.email || invoice.biz_customer?.email" class="meta-value">{{ invoice.customer?.email || invoice.biz_customer?.email }}</div>
          <div v-if="invoice.customer?.customer_profile?.address || invoice.biz_customer?.address" class="meta-value">{{ invoice.customer?.customer_profile?.address || invoice.biz_customer?.address }}</div>
        </div>
        <div class="meta-group text-right">
          <div class="meta-row">
            <span class="meta-label">Invoice Date</span>
            <span class="meta-value">{{ fmtDate(invoice.invoice_date) }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Invoice #</span>
            <span class="meta-value strong">{{ invoice.invoice_number }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Status</span>
            <span class="meta-value capitalize">{{ invoice.status }}</span>
          </div>
          <div v-if="invoice.creator?.name" class="meta-row">
            <span class="meta-label">Created by</span>
            <span class="meta-value">{{ invoice.creator.name }}</span>
          </div>
        </div>
      </section>

      <!-- Line Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th class="col-num">#</th>
            <th class="col-product">Product</th>
            <th class="col-sku">SKU</th>
            <th class="col-qty">Qty</th>
            <th class="col-price">Unit Price</th>
            <th class="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in invoice.items" :key="item.id">
            <td class="col-num">{{ idx + 1 }}</td>
            <td class="col-product">{{ item.product_name || item.product?.name }}</td>
            <td class="col-sku muted">{{ item.sku || item.product?.sku || '—' }}</td>
            <td class="col-qty center">{{ item.quantity }}</td>
            <td class="col-price right">PKR {{ fmt(item.unit_price) }}</td>
            <td class="col-total right strong">PKR {{ fmt(item.line_total) }}</td>
          </tr>
          <tr v-if="!invoice.items?.length">
            <td colspan="6" class="center muted py-4">No items</td>
          </tr>
        </tbody>
      </table>

      <!-- Totals -->
      <section class="totals-block">
        <div class="totals-inner">
          <div class="total-row">
            <span>Subtotal</span>
            <span>PKR {{ fmt(invoice.subtotal) }}</span>
          </div>
          <div v-if="Number(invoice.tax_amount) > 0" class="total-row">
            <span>Tax</span>
            <span>PKR {{ fmt(invoice.tax_amount) }}</span>
          </div>
          <div v-if="Number(invoice.discount_amount) > 0" class="total-row discount">
            <span>Discount</span>
            <span>– PKR {{ fmt(invoice.discount_amount) }}</span>
          </div>
          <div class="total-row grand">
            <span>Grand Total</span>
            <span>PKR {{ fmt(invoice.grand_total) }}</span>
          </div>
          <div class="total-row payment-status">
            <span>Payment Status</span>
            <span class="capitalize" :class="paymentClass">{{ invoice.payment_status }}</span>
          </div>
        </div>
      </section>

      <!-- Notes -->
      <section v-if="invoice.notes" class="notes-block">
        <div class="notes-label">Notes</div>
        <div class="notes-text">{{ invoice.notes }}</div>
      </section>

      <!-- Footer -->
      <footer class="invoice-footer">
        <div>Thank you for your business!</div>
        <div class="muted">Generated by StyleHub – Stock, Inventory &amp; Sales Management System</div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import invoiceApi from '@/services/invoiceApi'

const route = useRoute()
const panelBase = route.path.startsWith('/sales') ? '/sales' : '/seller'
const invoice = ref(null)
const loading = ref(true)
const error = ref(null)

const loadInvoice = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await invoiceApi.getInvoice(route.params.id)
    invoice.value = res.data?.data ?? res.data
  } catch (e) {
    error.value = e?.response?.data?.message || 'Could not load invoice'
  } finally {
    loading.value = false
  }
}

onMounted(loadInvoice)

const paymentClass = computed(() => {
  const s = invoice.value?.payment_status
  if (s === 'paid') return 'status-paid'
  if (s === 'pending') return 'status-pending'
  if (s === 'partial') return 'status-partial'
  return 'status-default'
})

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

const fmt = (v) =>
  Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const triggerPrint = () => window.print()

const savePdf = () => {
  // Guide user to use browser's Save as PDF option
  alert('In the print dialog, choose "Save as PDF" as the destination to download the invoice.')
  window.print()
}
</script>

<style scoped>
/* ============================================================
   SCREEN STYLES
   ============================================================ */
.print-root {
  min-height: 100vh;
  background: #f1f5f9;
}

.screen-toolbar {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}
.toolbar-inner {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Paper */
.invoice-paper {
  max-width: 860px;
  margin: 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.1);
  padding: 3rem;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #0f172a;
  font-size: 0.92rem;
}

/* Header */
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
.company-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1e40af;
  letter-spacing: -0.5px;
}
.company-tagline {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 2px;
  font-weight: 500;
}
.company-meta {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 6px;
  display: flex;
  gap: 0.4rem;
}
.invoice-title-block {
  text-align: right;
}
.invoice-label {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
}
.invoice-number {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e40af;
  margin: 2px 0;
}
.invoice-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.status-paid { background: #dcfce7; color: #166534; }
.status-pending { background: #fef9c3; color: #854d0e; }
.status-partial { background: #dbeafe; color: #1d4ed8; }
.status-default { background: #f1f5f9; color: #475569; }

.divider {
  border-top: 2px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

/* Meta grid */
.invoice-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}
.meta-group { }
.meta-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 4px;
}
.meta-value { font-size: 0.88rem; color: #334155; line-height: 1.5; }
.meta-value.strong { font-weight: 700; color: #0f172a; }
.meta-row {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  font-size: 0.88rem;
  line-height: 1.8;
}
.meta-row .meta-label { text-transform: none; letter-spacing: 0; }

/* Items Table */
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  font-size: 0.88rem;
}
.items-table thead tr {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}
.items-table th {
  padding: 0.6rem 0.75rem;
  text-align: left;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  font-weight: 700;
}
.items-table td {
  padding: 0.7rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}
.items-table tbody tr:last-child td { border-bottom: none; }
.col-num { width: 40px; color: #94a3b8; font-size: 0.8rem; }
.col-product { }
.col-sku { width: 100px; }
.col-qty { width: 60px; }
.col-price { width: 120px; }
.col-total { width: 130px; }
.center { text-align: center; }
.right { text-align: right; }
.strong { font-weight: 700; color: #0f172a; }
.muted { color: #94a3b8; }

/* Totals */
.totals-block {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}
.totals-inner {
  min-width: 280px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}
.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  font-size: 0.88rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}
.total-row:last-child { border-bottom: none; }
.total-row.discount { color: #16a34a; }
.total-row.grand {
  background: #1e40af;
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
  padding: 0.75rem 1rem;
}
.total-row.payment-status { background: #f8fafc; font-size: 0.82rem; }
.total-row.payment-status .status-paid { color: #16a34a; font-weight: 700; }
.total-row.payment-status .status-pending { color: #d97706; font-weight: 700; }
.total-row.payment-status .status-partial { color: #2563eb; font-weight: 700; }

/* Notes */
.notes-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 2rem;
}
.notes-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 4px;
}
.notes-text { font-size: 0.88rem; color: #475569; line-height: 1.6; }

/* Footer */
.invoice-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  text-align: center;
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ============================================================
   PRINT STYLES
   ============================================================ */
@media print {
  .no-print {
    display: none !important;
  }

  .print-root {
    background: #fff !important;
    min-height: unset;
  }

  .invoice-paper {
    max-width: 100%;
    margin: 0;
    padding: 1.5cm 2cm;
    box-shadow: none;
    border-radius: 0;
    font-size: 11pt;
  }

  .invoice-header { page-break-inside: avoid; }
  .items-table { page-break-inside: auto; }
  .items-table tr { page-break-inside: avoid; page-break-after: auto; }
  .totals-block { page-break-inside: avoid; }
  .notes-block { page-break-inside: avoid; }

  @page {
    size: A4;
    margin: 1.5cm 2cm;
  }
}

/* ============================================================
   RESPONSIVE SCREEN
   ============================================================ */
@media (max-width: 900px) {
  .invoice-paper {
    margin: 1rem;
    padding: 1.5rem;
  }
  .invoice-header {
    flex-direction: column;
    gap: 1rem;
  }
  .invoice-title-block {
    text-align: left;
  }
  .invoice-meta-grid {
    grid-template-columns: 1fr;
  }
  .meta-row {
    justify-content: flex-start;
  }
  .totals-block {
    justify-content: stretch;
  }
  .totals-inner {
    min-width: unset;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .invoice-paper {
    margin: 0.5rem;
    padding: 1rem;
  }
  .items-table th, .items-table td {
    padding: 0.5rem 0.4rem;
    font-size: 0.8rem;
  }
  .col-sku { display: none; }
  .screen-toolbar { padding: 0.5rem 1rem; }
  .toolbar-inner { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
}
</style>
