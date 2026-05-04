<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Stock Ledger</h1>
        <p class="text-sm text-slate-500 mt-1">Every stock in/out movement tracked automatically</p>
      </div>
      <q-btn unelevated color="primary" icon="add" label="Manual Adjustment" @click="showAdjust = true" />
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
      <select v-model="filters.movement_type" @change="fetch" class="input-base">
        <option value="">All Types</option>
        <option value="in">Stock In</option>
        <option value="out">Stock Out</option>
        <option value="return">Return</option>
        <option value="adjustment">Adjustment</option>
      </select>
      <input v-model="filters.from_date" type="date" @change="fetch" class="input-base" placeholder="From date" />
      <input v-model="filters.to_date" type="date" @change="fetch" class="input-base" placeholder="To date" />
      <button @click="resetFilters" class="text-sm text-indigo-600 hover:underline text-left">Reset filters</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <q-spinner-dots color="primary" size="48px" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
      {{ error }} <button @click="fetch" class="ml-2 underline">Retry</button>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div v-if="!movements.length" class="text-center py-16 text-slate-400">
        <q-icon name="inventory" size="48px" class="mb-2 opacity-30" />
        <p>No stock movements found</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Product</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
              <th class="text-center px-4 py-3 font-semibold text-slate-600">Qty</th>
              <th class="text-center px-4 py-3 font-semibold text-slate-600">Before</th>
              <th class="text-center px-4 py-3 font-semibold text-slate-600">After</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Reference</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Notes</th>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">By / Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="m in movements" :key="m.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <div class="font-medium text-slate-800">{{ m.product?.name }}</div>
                <div class="text-xs text-slate-400">{{ m.product?.sku }}</div>
              </td>
              <td class="px-4 py-3">
                <span :class="typeBadge(m.movement_type)" class="px-2 py-1 rounded-full text-xs font-medium capitalize">
                  {{ m.movement_type }}
                </span>
              </td>
              <td class="px-4 py-3 text-center font-mono" :class="m.quantity > 0 ? 'text-green-700' : 'text-red-600'">
                {{ m.quantity > 0 ? '+' : '' }}{{ m.quantity }}
              </td>
              <td class="px-4 py-3 text-center text-slate-500">{{ m.stock_before }}</td>
              <td class="px-4 py-3 text-center font-semibold text-slate-800">{{ m.stock_after }}</td>
              <td class="px-4 py-3 text-xs text-slate-500">
                <span v-if="m.reference_type" class="capitalize">{{ m.reference_type }} #{{ m.reference_id }}</span>
                <span v-else class="text-slate-300">—</span>
              </td>
              <td class="px-4 py-3 text-xs text-slate-500">{{ m.notes || '—' }}</td>
              <td class="px-4 py-3 text-xs text-slate-500">
                <div>{{ m.creator?.name || '—' }}</div>
                <div class="text-slate-400">{{ formatDate(m.created_at) }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <span class="text-sm text-slate-500">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
        <div class="flex gap-2">
          <q-btn dense flat icon="chevron_left" :disable="pagination.current_page <= 1" @click="changePage(pagination.current_page - 1)" />
          <q-btn dense flat icon="chevron_right" :disable="pagination.current_page >= pagination.last_page" @click="changePage(pagination.current_page + 1)" />
        </div>
      </div>
    </div>

    <!-- Manual Adjustment Dialog -->
    <q-dialog v-model="showAdjust">
      <q-card style="min-width: 400px">
        <q-card-section class="border-b">
          <div class="text-lg font-bold">Manual Stock Adjustment</div>
        </q-card-section>
        <q-card-section>
          <div class="space-y-3">
            <div>
              <label class="label-sm">Product ID</label>
              <input v-model.number="adj.product_id" type="number" min="1" class="input-base w-full" placeholder="Product ID" />
            </div>
            <div>
              <label class="label-sm">Type</label>
              <select v-model="adj.movement_type" class="input-base w-full">
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label class="label-sm">Quantity</label>
              <input v-model.number="adj.quantity" type="number" min="1" class="input-base w-full" />
            </div>
            <div>
              <label class="label-sm">Notes</label>
              <input v-model="adj.notes" type="text" class="input-base w-full" placeholder="Reason / notes" />
            </div>
            <div v-if="adjError" class="text-red-600 text-sm">{{ adjError }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showAdjust = false" />
          <q-btn unelevated color="primary" label="Save" :loading="adjLoading" @click="submitAdj" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import stockLedgerApi from '@/services/stockLedgerApi'

const movements = ref([])
const loading = ref(false)
const error = ref(null)
const showAdjust = ref(false)
const adjLoading = ref(false)
const adjError = ref(null)

const filters = reactive({ movement_type: '', from_date: '', to_date: '', page: 1, per_page: 20 })
const pagination = reactive({ current_page: 1, last_page: 1 })
const adj = reactive({ product_id: '', movement_type: 'in', quantity: 1, notes: '' })

const fetch = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await stockLedgerApi.getMovements({ ...filters })
    const d = res.data?.data ?? res.data
    movements.value = Array.isArray(d) ? d : (d?.data ?? [])
    if (d?.current_page) {
      pagination.current_page = d.current_page
      pagination.last_page = d.last_page
    }
  } catch (e) {
    error.value = e?.response?.data?.message || 'Failed to load movements'
  } finally {
    loading.value = false
  }
}

const changePage = (page) => { filters.page = page; fetch() }

const resetFilters = () => {
  filters.movement_type = ''; filters.from_date = ''; filters.to_date = ''; filters.page = 1
  fetch()
}

const submitAdj = async () => {
  adjError.value = null
  adjLoading.value = true
  try {
    await stockLedgerApi.addMovement({ ...adj })
    showAdjust.value = false
    adj.product_id = ''; adj.quantity = 1; adj.notes = ''
    fetch()
  } catch (e) {
    adjError.value = e?.response?.data?.message || 'Failed to save adjustment'
  } finally {
    adjLoading.value = false
  }
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const typeBadge = (t) => ({
  'bg-green-100 text-green-700': t === 'in',
  'bg-red-100 text-red-700': t === 'out',
  'bg-blue-100 text-blue-700': t === 'return',
  'bg-yellow-100 text-yellow-700': t === 'adjustment',
})

onMounted(fetch)
</script>

<style scoped>
.input-base {
  @apply px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full;
}
.label-sm {
  @apply block text-xs font-semibold text-slate-600 mb-1;
}
</style>
