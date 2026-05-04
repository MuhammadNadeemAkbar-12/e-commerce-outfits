<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <router-link to="/seller/invoices">
        <q-btn flat round icon="arrow_back" dense />
      </router-link>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Create Invoice</h1>
        <p class="text-sm text-slate-500">Fill in the details below to generate a new sales invoice</p>
      </div>
    </div>

    <form @submit.prevent="submitInvoice" class="space-y-5">
      <!-- Customer + Date Row -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Customer Name</label>
          <input
            v-model="form.customer_name"
            type="text"
            placeholder="Customer name or leave blank for walk-in"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Invoice Date</label>
          <input
            v-model="form.invoice_date"
            type="date"
            required
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Payment Status</label>
          <select
            v-model="form.payment_status"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Invoice Status</label>
          <select
            v-model="form.status"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
          </select>
        </div>
      </div>

      <!-- Line Items -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-slate-800">Items</h2>
          <q-btn unelevated color="indigo" icon="add" label="Add Item" size="sm" @click="addItem" />
        </div>

        <div v-if="!form.items.length" class="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
          No items yet. Click "Add Item" to start.
        </div>

        <div v-for="(item, idx) in form.items" :key="idx" class="border border-slate-200 rounded-lg p-4 mb-3 relative">
          <button
            type="button"
            @click="removeItem(idx)"
            class="absolute top-3 right-3 text-red-400 hover:text-red-600"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Product selector -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-600 mb-1">Product</label>
              <select
                v-model="item.product_id"
                @change="onProductChange(item)"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select product...</option>
                <option
                  v-for="p in products"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.name }} — SKU: {{ p.sku || '—' }} (Stock: {{ p.stock }})
                </option>
              </select>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Quantity</label>
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                required
                @input="calcLine(item)"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Unit Price -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Unit Price (PKR)</label>
              <input
                v-model.number="item.unit_price"
                type="number"
                min="0"
                step="0.01"
                required
                @input="calcLine(item)"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Line total (read-only) -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-600 mb-1">Line Total</label>
              <div class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800">
                PKR {{ formatAmount(item.line_total) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Totals & Notes -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <!-- Left: notes -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Notes (optional)</label>
          <textarea
            v-model="form.notes"
            rows="4"
            placeholder="Any additional notes..."
            class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          ></textarea>
        </div>

        <!-- Right: totals -->
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Tax Amount (PKR)</label>
            <input
              v-model.number="form.tax_amount"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Discount Amount (PKR)</label>
            <input
              v-model.number="form.discount_amount"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
            <div class="flex justify-between text-sm text-slate-600 mb-1">
              <span>Subtotal</span><span>PKR {{ formatAmount(subtotal) }}</span>
            </div>
            <div v-if="form.tax_amount" class="flex justify-between text-sm text-slate-600 mb-1">
              <span>Tax</span><span>PKR {{ formatAmount(form.tax_amount) }}</span>
            </div>
            <div v-if="form.discount_amount" class="flex justify-between text-sm text-green-700 mb-1">
              <span>Discount</span><span>-PKR {{ formatAmount(form.discount_amount) }}</span>
            </div>
            <div class="flex justify-between font-bold text-slate-900 text-base border-t border-indigo-200 pt-2 mt-1">
              <span>Grand Total</span><span>PKR {{ formatAmount(grandTotal) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="submitError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        {{ submitError }}
      </div>

      <!-- Submit -->
      <div class="flex items-center justify-end gap-3">
        <router-link to="/seller/invoices">
          <q-btn flat label="Cancel" color="grey-7" />
        </router-link>
        <q-btn
          type="submit"
          unelevated
          color="primary"
          :loading="submitting"
          :disable="!form.items.length"
          icon="save"
          label="Create Invoice"
        />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import invoiceApi from '@/services/invoiceApi'
import axios from '@/api/axios'

const router = useRouter()

const products = ref([])
const submitting = ref(false)
const submitError = ref(null)

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  customer_name: '',
  invoice_date: today,
  payment_status: 'pending',
  status: 'finalized',
  tax_amount: 0,
  discount_amount: 0,
  notes: '',
  items: []
})

const subtotal = computed(() =>
  form.items.reduce((sum, i) => sum + (i.line_total || 0), 0)
)

const grandTotal = computed(() =>
  subtotal.value + (form.tax_amount || 0) - (form.discount_amount || 0)
)

const fetchProducts = async () => {
  try {
    const res = await axios.get('/seller/products')
    const d = res.data?.data ?? res.data
    products.value = Array.isArray(d) ? d : (d?.data ?? [])
  } catch (e) {
    // products list optional
  }
}

const addItem = () => {
  form.items.push({ product_id: '', quantity: 1, unit_price: 0, line_total: 0 })
}

const removeItem = (idx) => {
  form.items.splice(idx, 1)
}

const onProductChange = (item) => {
  const product = products.value.find(p => p.id === item.product_id)
  if (product) {
    item.unit_price = product.sale_price ?? product.price ?? 0
    calcLine(item)
  }
}

const calcLine = (item) => {
  item.line_total = (item.quantity || 0) * (item.unit_price || 0)
}

const formatAmount = (v) =>
  Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const submitInvoice = async () => {
  submitError.value = null

  if (!form.items.length) {
    submitError.value = 'Please add at least one item'
    return
  }

  submitting.value = true
  try {
    const payload = {
      invoice_date: form.invoice_date,
      payment_status: form.payment_status,
      status: form.status,
      tax_amount: form.tax_amount || 0,
      discount_amount: form.discount_amount || 0,
      notes: form.notes || null,
      items: form.items.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price
      }))
    }

    await invoiceApi.createInvoice(payload)
    router.push('/seller/invoices')
  } catch (e) {
    const err = e?.response?.data
    if (err?.errors) {
      submitError.value = Object.values(err.errors).flat().join(' ')
    } else {
      submitError.value = err?.message || 'Failed to create invoice'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(fetchProducts)
</script>
