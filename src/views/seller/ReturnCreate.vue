<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Create Sale Return</h1>
        <p class="text-sm text-slate-500 mt-1">Load invoice and select items for return request</p>
      </div>
      <q-btn flat icon="arrow_back" label="Back" @click="router.push('/seller/returns')" />
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
      <label class="label-sm">Invoice ID</label>
      <div class="flex flex-col sm:flex-row gap-3">
        <input v-model.number="invoiceId" type="number" min="1" class="input-base sm:max-w-xs" placeholder="Enter invoice ID" />
        <q-btn unelevated color="indigo" label="Load Invoice" :loading="loadingInvoice" @click="loadInvoice" />
      </div>
      <p v-if="invoiceError" class="text-sm text-red-600 mt-2">{{ invoiceError }}</p>
    </div>

    <div v-if="invoice" class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div><span class="text-slate-500">Invoice #:</span> <span class="font-medium">{{ invoice.invoice_number || invoice.id }}</span></div>
        <div><span class="text-slate-500">Customer:</span> <span class="font-medium">{{ invoice.customer_name || '—' }}</span></div>
        <div><span class="text-slate-500">Date:</span> <span class="font-medium">{{ formatDate(invoice.invoice_date || invoice.created_at) }}</span></div>
      </div>
    </div>

    <div v-if="invoiceItems.length" class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">Select</th>
            <th class="text-left px-4 py-3 font-semibold text-slate-600">Product</th>
            <th class="text-center px-4 py-3 font-semibold text-slate-600">Sold Qty</th>
            <th class="text-center px-4 py-3 font-semibold text-slate-600">Return Qty</th>
            <th class="text-right px-4 py-3 font-semibold text-slate-600">Unit Price</th>
            <th class="text-right px-4 py-3 font-semibold text-slate-600">Line Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in invoiceItems" :key="item.id" class="hover:bg-slate-50">
            <td class="px-4 py-3">
              <input type="checkbox" v-model="item.selected" class="w-4 h-4" />
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-slate-800">{{ item.product_name }}</div>
              <div class="text-xs text-slate-400">{{ item.sku || '—' }}</div>
            </td>
            <td class="px-4 py-3 text-center text-slate-600">{{ item.quantity }}</td>
            <td class="px-4 py-3 text-center">
              <input
                v-model.number="item.returnQty"
                type="number"
                min="1"
                :max="item.quantity"
                :disabled="!item.selected"
                class="input-base w-20 text-center mx-auto"
              />
            </td>
            <td class="px-4 py-3 text-right text-slate-600">PKR {{ fmt(item.unit_price) }}</td>
            <td class="px-4 py-3 text-right font-semibold text-slate-800">PKR {{ fmt((item.returnQty || 0) * Number(item.unit_price || 0)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="invoiceItems.length" class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mt-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="label-sm">Reason</label>
          <input v-model="reason" type="text" class="input-base" placeholder="Defective, wrong size, wrong item..." />
        </div>
        <div>
          <label class="label-sm">Notes</label>
          <input v-model="notes" type="text" class="input-base" placeholder="Optional notes" />
        </div>
      </div>
      <div class="flex items-center justify-between mt-4">
        <div class="text-sm text-slate-600">
          Estimated Refund: <span class="font-bold text-slate-900">PKR {{ fmt(estimatedRefund) }}</span>
        </div>
        <q-btn
          unelevated
          color="primary"
          label="Submit Return"
          :loading="submitting"
          :disable="!selectedItems.length"
          @click="submitReturn"
        />
      </div>
      <p v-if="submitError" class="text-sm text-red-600 mt-3">{{ submitError }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import invoiceApi from '@/services/invoiceApi'
import returnsApi from '@/services/returnsApi'

const router = useRouter()

const invoiceId = ref('')
const invoice = ref(null)
const invoiceItems = ref([])
const loadingInvoice = ref(false)
const invoiceError = ref(null)

const reason = ref('')
const notes = ref('')
const submitting = ref(false)
const submitError = ref(null)

const selectedItems = computed(() =>
  invoiceItems.value.filter(i => i.selected).map(i => ({
    invoice_item_id: i.id,
    quantity: Math.min(Math.max(1, Number(i.returnQty || 1)), Number(i.quantity || 1))
  }))
)

const estimatedRefund = computed(() =>
  invoiceItems.value
    .filter(i => i.selected)
    .reduce((sum, i) => sum + (Number(i.returnQty || 0) * Number(i.unit_price || 0)), 0)
)

const loadInvoice = async () => {
  if (!invoiceId.value) return
  loadingInvoice.value = true
  invoiceError.value = null
  submitError.value = null
  try {
    const res = await invoiceApi.getInvoice(invoiceId.value)
    const data = res.data?.data ?? res.data
    invoice.value = data
    invoiceItems.value = (data.items || []).map(item => ({
      ...item,
      selected: false,
      returnQty: 1,
    }))
  } catch (e) {
    invoice.value = null
    invoiceItems.value = []
    invoiceError.value = e?.response?.data?.message || 'Unable to load invoice'
  } finally {
    loadingInvoice.value = false
  }
}

const submitReturn = async () => {
  submitError.value = null
  submitting.value = true
  try {
    await returnsApi.createReturn({
      invoice_id: invoiceId.value,
      reason: reason.value,
      notes: notes.value,
      items: selectedItems.value,
    })
    router.push('/seller/returns')
  } catch (e) {
    submitError.value = e?.response?.data?.message || 'Failed to create return'
  } finally {
    submitting.value = false
  }
}

const fmt = (v) => Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
</script>

<style scoped>
.input-base { @apply px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full; }
.label-sm { @apply block text-xs font-semibold text-slate-600 mb-1; }
</style>
