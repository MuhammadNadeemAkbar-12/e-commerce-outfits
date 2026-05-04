<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Reports</h1>
      <p class="text-sm text-slate-500 mt-1">Sales, stock & profit-loss analysis</p>
    </div>

    <!-- Tab Bar -->
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 max-w-sm">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="['flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all', activeTab === tab.key ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-700']"
      >{{ tab.label }}</button>
    </div>

    <!-- ================== SALES REPORT ================== -->
    <div v-if="activeTab === 'sales'">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div>
          <label class="label-sm">Type</label>
          <select v-model="salesParams.type" @change="loadSales" class="input-base w-36">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div v-if="salesParams.type !== 'yearly'">
          <label class="label-sm">Year</label>
          <input v-model.number="salesParams.year" type="number" min="2020" :max="currentYear" @change="loadSales" class="input-base w-28" />
        </div>
        <div v-if="salesParams.type === 'daily'">
          <label class="label-sm">Month</label>
          <input v-model.number="salesParams.month" type="number" min="1" max="12" @change="loadSales" class="input-base w-24" />
        </div>
        <q-btn unelevated color="indigo" icon="refresh" size="sm" label="Refresh" @click="loadSales" :loading="salesLoading" />
      </div>

      <!-- KPI Cards -->
      <div v-if="salesData" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <div class="text-xs text-indigo-500 font-medium mb-1">Total Revenue</div>
          <div class="text-xl font-bold text-indigo-900">PKR {{ fmt(salesData.totals.total_revenue) }}</div>
        </div>
        <div class="bg-green-50 border border-green-100 rounded-xl p-4">
          <div class="text-xs text-green-600 font-medium mb-1">Invoices</div>
          <div class="text-xl font-bold text-green-900">{{ salesData.totals.total_invoices }}</div>
        </div>
        <div class="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <div class="text-xs text-yellow-600 font-medium mb-1">Discounts</div>
          <div class="text-xl font-bold text-yellow-900">PKR {{ fmt(salesData.totals.total_discounts) }}</div>
        </div>
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div class="text-xs text-blue-600 font-medium mb-1">Taxes</div>
          <div class="text-xl font-bold text-blue-900">PKR {{ fmt(salesData.totals.total_taxes) }}</div>
        </div>
      </div>

      <div v-if="salesLoading" class="flex justify-center py-10"><q-spinner-dots color="primary" size="40px" /></div>

      <div v-else-if="salesData" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Period</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Invoices</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Revenue</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Discounts</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Taxes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="!salesData.rows.length">
              <td colspan="5" class="px-4 py-10 text-center text-slate-400">No data for this period</td>
            </tr>
            <tr v-for="row in salesData.rows" :key="row.period" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-medium text-slate-800">{{ row.period }}</td>
              <td class="px-4 py-3 text-right text-slate-600">{{ row.invoice_count }}</td>
              <td class="px-4 py-3 text-right font-semibold text-green-700">PKR {{ fmt(row.revenue) }}</td>
              <td class="px-4 py-3 text-right text-yellow-600">PKR {{ fmt(row.discounts) }}</td>
              <td class="px-4 py-3 text-right text-blue-600">PKR {{ fmt(row.taxes) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================== STOCK REPORT ================== -->
    <div v-if="activeTab === 'stock'">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input type="checkbox" v-model="stockParams.low_stock_only" @change="loadStock" class="w-4 h-4" />
          Show low stock only
        </label>
        <q-btn unelevated color="indigo" icon="refresh" size="sm" label="Refresh" @click="loadStock" :loading="stockLoading" />
      </div>

      <!-- Summary Cards -->
      <div v-if="stockData" class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div class="text-xs text-slate-500 mb-1">Total Products</div>
          <div class="text-xl font-bold text-slate-900">{{ stockData.summary.total_products }}</div>
        </div>
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div class="text-xs text-slate-500 mb-1">Total Units</div>
          <div class="text-xl font-bold text-slate-900">{{ stockData.summary.total_units }}</div>
        </div>
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div class="text-xs text-blue-500 mb-1">Cost Value</div>
          <div class="text-xl font-bold text-blue-900">PKR {{ fmt(stockData.summary.total_cost_value) }}</div>
        </div>
        <div class="bg-green-50 border border-green-100 rounded-xl p-4">
          <div class="text-xs text-green-600 mb-1">Sale Value</div>
          <div class="text-xl font-bold text-green-900">PKR {{ fmt(stockData.summary.total_sale_value) }}</div>
        </div>
        <div class="bg-red-50 border border-red-100 rounded-xl p-4">
          <div class="text-xs text-red-500 mb-1">Low Stock Items</div>
          <div class="text-xl font-bold text-red-700">{{ stockData.summary.low_stock_count }}</div>
        </div>
      </div>

      <div v-if="stockLoading" class="flex justify-center py-10"><q-spinner-dots color="primary" size="40px" /></div>

      <div v-else-if="stockData" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-4 py-3 font-semibold text-slate-600">Product</th>
                <th class="text-left px-4 py-3 font-semibold text-slate-600">SKU</th>
                <th class="text-center px-4 py-3 font-semibold text-slate-600">Stock</th>
                <th class="text-center px-4 py-3 font-semibold text-slate-600">Reorder</th>
                <th class="text-right px-4 py-3 font-semibold text-slate-600">Cost Price</th>
                <th class="text-right px-4 py-3 font-semibold text-slate-600">Sale Price</th>
                <th class="text-center px-4 py-3 font-semibold text-slate-600">Alert</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="p in stockData.products.data" :key="p.id" class="hover:bg-slate-50">
                <td class="px-4 py-3 font-medium text-slate-800">{{ p.name }}</td>
                <td class="px-4 py-3 font-mono text-xs text-slate-500">{{ p.sku || '—' }}</td>
                <td class="px-4 py-3 text-center font-bold" :class="p.stock <= p.reorder_level ? 'text-red-600' : 'text-green-700'">{{ p.stock }}</td>
                <td class="px-4 py-3 text-center text-slate-500">{{ p.reorder_level }}</td>
                <td class="px-4 py-3 text-right text-slate-600">PKR {{ fmt(p.cost_price) }}</td>
                <td class="px-4 py-3 text-right text-slate-700">PKR {{ fmt(p.sale_price || p.price) }}</td>
                <td class="px-4 py-3 text-center">
                  <span v-if="p.stock <= p.reorder_level" class="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">Low</span>
                  <span v-else class="text-slate-300 text-xs">OK</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ================== PROFIT & LOSS ================== -->
    <div v-if="activeTab === 'pl'">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div>
          <label class="label-sm">Type</label>
          <select v-model="plParams.type" @change="loadPL" class="input-base w-36">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div v-if="plParams.type !== 'yearly'">
          <label class="label-sm">Year</label>
          <input v-model.number="plParams.year" type="number" min="2020" :max="currentYear" @change="loadPL" class="input-base w-28" />
        </div>
        <div v-if="plParams.type === 'daily'">
          <label class="label-sm">Month</label>
          <input v-model.number="plParams.month" type="number" min="1" max="12" @change="loadPL" class="input-base w-24" />
        </div>
        <q-btn unelevated color="indigo" icon="refresh" size="sm" label="Refresh" @click="loadPL" :loading="plLoading" />
      </div>

      <!-- P&L KPI -->
      <div v-if="plData" class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div class="bg-green-50 border border-green-100 rounded-xl p-4">
          <div class="text-xs text-green-600 mb-1">Revenue</div>
          <div class="text-xl font-bold text-green-900">PKR {{ fmt(plData.totals.total_revenue) }}</div>
        </div>
        <div class="bg-red-50 border border-red-100 rounded-xl p-4">
          <div class="text-xs text-red-500 mb-1">Cost</div>
          <div class="text-xl font-bold text-red-800">PKR {{ fmt(plData.totals.total_cost) }}</div>
        </div>
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <div class="text-xs text-indigo-500 mb-1">Gross Profit</div>
          <div class="text-xl font-bold text-indigo-900">PKR {{ fmt(plData.totals.gross_profit) }}</div>
        </div>
        <div class="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <div class="text-xs text-yellow-600 mb-1">Returns Deducted</div>
          <div class="text-xl font-bold text-yellow-800">PKR {{ fmt(plData.totals.returns_deducted) }}</div>
        </div>
        <div :class="plData.totals.net_profit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-200'" class="border rounded-xl p-4">
          <div :class="plData.totals.net_profit >= 0 ? 'text-emerald-600' : 'text-red-500'" class="text-xs font-medium mb-1">Net Profit</div>
          <div :class="plData.totals.net_profit >= 0 ? 'text-emerald-900' : 'text-red-700'" class="text-xl font-bold">PKR {{ fmt(plData.totals.net_profit) }}</div>
        </div>
      </div>

      <div v-if="plLoading" class="flex justify-center py-10"><q-spinner-dots color="primary" size="40px" /></div>

      <div v-else-if="plData" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-slate-600">Period</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Revenue</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Cost</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Gross Profit</th>
              <th class="text-right px-4 py-3 font-semibold text-slate-600">Margin %</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="!plData.rows.length">
              <td colspan="5" class="px-4 py-10 text-center text-slate-400">No data for this period</td>
            </tr>
            <tr v-for="row in plData.rows" :key="row.period" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-medium text-slate-800">{{ row.period }}</td>
              <td class="px-4 py-3 text-right text-green-700">PKR {{ fmt(row.revenue) }}</td>
              <td class="px-4 py-3 text-right text-red-600">PKR {{ fmt(row.cost) }}</td>
              <td class="px-4 py-3 text-right font-semibold" :class="row.gross_profit >= 0 ? 'text-indigo-700' : 'text-red-600'">
                PKR {{ fmt(row.gross_profit) }}
              </td>
              <td class="px-4 py-3 text-right text-slate-500">
                {{ row.revenue > 0 ? ((row.gross_profit / row.revenue) * 100).toFixed(1) + '%' : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import reportsApi from '@/services/reportsApi'

const activeTab = ref('sales')
const currentYear = new Date().getFullYear()

const tabs = [
  { key: 'sales', label: 'Sales' },
  { key: 'stock', label: 'Stock' },
  { key: 'pl', label: 'Profit & Loss' },
]

// Sales
const salesLoading = ref(false)
const salesData = ref(null)
const salesParams = reactive({ type: 'monthly', year: currentYear, month: new Date().getMonth() + 1 })

const loadSales = async () => {
  salesLoading.value = true
  try {
    const res = await reportsApi.getSalesReport({ ...salesParams })
    salesData.value = res.data?.data ?? res.data
  } catch (e) { salesData.value = null }
  finally { salesLoading.value = false }
}

// Stock
const stockLoading = ref(false)
const stockData = ref(null)
const stockParams = reactive({ low_stock_only: false, per_page: 100 })

const loadStock = async () => {
  stockLoading.value = true
  try {
    const res = await reportsApi.getStockReport({ ...stockParams })
    stockData.value = res.data?.data ?? res.data
  } catch (e) { stockData.value = null }
  finally { stockLoading.value = false }
}

// P&L
const plLoading = ref(false)
const plData = ref(null)
const plParams = reactive({ type: 'monthly', year: currentYear, month: new Date().getMonth() + 1 })

const loadPL = async () => {
  plLoading.value = true
  try {
    const res = await reportsApi.getProfitLoss({ ...plParams })
    plData.value = res.data?.data ?? res.data
  } catch (e) { plData.value = null }
  finally { plLoading.value = false }
}

const fmt = (v) => Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

onMounted(() => { loadSales(); loadStock(); loadPL() })
</script>

<style scoped>
.input-base { @apply px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500; }
.label-sm { @apply block text-xs font-semibold text-slate-600 mb-1; }
</style>
