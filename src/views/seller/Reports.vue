<template>
  <div class="reports-root">
    <!-- Page Header -->
    <div class="rpt-header">
      <div>
        <h1 class="rpt-title">Reports &amp; Analytics</h1>
        <p class="rpt-subtitle">Sales, stock &amp; profit-loss analysis for your store</p>
      </div>
      <select v-model="activeTab" class="tab-select-mobile">
        <option value="sales">Sales Report</option>
        <option value="stock">Stock Report</option>
        <option value="pl">Profit &amp; Loss</option>
      </select>
    </div>

    <!-- Tab Pills -->
    <div class="tab-pills">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        :class="['tab-pill', activeTab === tab.key ? 'tab-pill--active' : '']">
        <span class="tab-pill-icon">{{ tab.icon }}</span>{{ tab.label }}
      </button>
    </div>

    <!-- ===== SALES ===== -->
    <div v-if="activeTab === 'sales'" class="tab-body">
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">Interval</label>
          <select v-model="salesParams.type" @change="loadSales" class="filter-select">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div v-if="salesParams.type !== 'yearly'" class="filter-group">
          <label class="filter-label">Year</label>
          <input v-model.number="salesParams.year" type="number" min="2020" :max="currentYear" @change="loadSales" class="filter-input w-28" />
        </div>
        <div v-if="salesParams.type === 'daily'" class="filter-group">
          <label class="filter-label">Month</label>
          <input v-model.number="salesParams.month" type="number" min="1" max="12" @change="loadSales" class="filter-input w-20" />
        </div>
        <button @click="loadSales" :disabled="salesLoading" class="btn-refresh">
          <span v-if="salesLoading" class="btn-spinner"></span><span v-else>↻</span> Refresh
        </button>
      </div>

      <div v-if="salesLoading" class="loading-state"><div class="loading-ring"></div><p>Loading sales data…</p></div>

      <template v-else-if="salesData">
        <div class="kpi-grid">
          <div class="kpi-card kpi-indigo"><div class="kpi-icon">💰</div><div><div class="kpi-label">Total Revenue</div><div class="kpi-value">PKR {{ fmt(salesData.totals.total_revenue) }}</div></div></div>
          <div class="kpi-card kpi-green"><div class="kpi-icon">🧾</div><div><div class="kpi-label">Total Invoices</div><div class="kpi-value">{{ salesData.totals.total_invoices }}</div></div></div>
          <div class="kpi-card kpi-yellow"><div class="kpi-icon">🏷️</div><div><div class="kpi-label">Discounts Given</div><div class="kpi-value">PKR {{ fmt(salesData.totals.total_discounts) }}</div></div></div>
          <div class="kpi-card kpi-blue"><div class="kpi-icon">📊</div><div><div class="kpi-label">Taxes Collected</div><div class="kpi-value">PKR {{ fmt(salesData.totals.total_taxes) }}</div></div></div>
        </div>

        <div v-if="salesData.rows.length" class="chart-card">
          <div class="chart-card-header">
            <span class="chart-title">Revenue by Period</span>
            <span class="chart-badge">{{ salesData.rows.length }} periods</span>
          </div>
          <div class="chart-wrap"><canvas ref="salesChartRef" height="240"></canvas></div>
        </div>

        <div class="data-card">
          <div class="data-card-header">Breakdown</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Period</th><th class="tr">Invoices</th><th class="tr">Revenue</th><th class="tr">Discounts</th><th class="tr">Taxes</th></tr></thead>
              <tbody>
                <tr v-if="!salesData.rows.length"><td colspan="5" class="empty-row">No data for this period</td></tr>
                <tr v-for="row in salesData.rows" :key="row.period">
                  <td class="fw5">{{ row.period }}</td>
                  <td class="tr c-slate">{{ row.invoice_count }}</td>
                  <td class="tr c-green fw6">PKR {{ fmt(row.revenue) }}</td>
                  <td class="tr c-yellow">PKR {{ fmt(row.discounts) }}</td>
                  <td class="tr c-blue">PKR {{ fmt(row.taxes) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <div v-else class="empty-state"><div class="empty-icon">📂</div><p>No sales data. Try adjusting filters.</p></div>
    </div>

    <!-- ===== STOCK ===== -->
    <div v-if="activeTab === 'stock'" class="tab-body">
      <div class="filter-bar">
        <label class="filter-toggle">
          <input type="checkbox" v-model="stockParams.low_stock_only" @change="loadStock" />
          <span class="toggle-track"></span>
          Show Low Stock Only
        </label>
        <button @click="loadStock" :disabled="stockLoading" class="btn-refresh">
          <span v-if="stockLoading" class="btn-spinner"></span><span v-else>↻</span> Refresh
        </button>
      </div>

      <div v-if="stockLoading" class="loading-state"><div class="loading-ring"></div><p>Loading stock data…</p></div>

      <template v-else-if="stockData">
        <div class="kpi-grid">
          <div class="kpi-card kpi-slate"><div class="kpi-icon">📦</div><div><div class="kpi-label">Total Products</div><div class="kpi-value">{{ stockData.summary.total_products }}</div></div></div>
          <div class="kpi-card kpi-slate"><div class="kpi-icon">🔢</div><div><div class="kpi-label">Total Units</div><div class="kpi-value">{{ Number(stockData.summary.total_units||0).toLocaleString() }}</div></div></div>
          <div class="kpi-card kpi-blue"><div class="kpi-icon">💵</div><div><div class="kpi-label">Cost Value</div><div class="kpi-value">PKR {{ fmt(stockData.summary.total_cost_value) }}</div></div></div>
          <div class="kpi-card kpi-green"><div class="kpi-icon">💹</div><div><div class="kpi-label">Sale Value</div><div class="kpi-value">PKR {{ fmt(stockData.summary.total_sale_value) }}</div></div></div>
          <div class="kpi-card kpi-red"><div class="kpi-icon">⚠️</div><div><div class="kpi-label">Low Stock Items</div><div class="kpi-value">{{ stockData.summary.low_stock_count }}</div></div></div>
        </div>

        <div class="data-card">
          <div class="data-card-header">Product Stock Levels</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Product</th><th>SKU</th><th class="tc">Stock</th><th class="tc">Reorder</th><th class="tr">Cost</th><th class="tr">Sale</th><th class="tc">Alert</th></tr></thead>
              <tbody>
                <tr v-for="p in stockData.products.data" :key="p.id" :class="p.stock <= p.reorder_level ? 'row-danger' : ''">
                  <td class="fw5">{{ p.name }}</td>
                  <td class="mono c-muted text-xs">{{ p.sku || '—' }}</td>
                  <td class="tc fw7" :class="p.stock <= p.reorder_level ? 'c-red' : 'c-green'">{{ p.stock }}</td>
                  <td class="tc c-muted">{{ p.reorder_level }}</td>
                  <td class="tr c-slate">PKR {{ fmt(p.cost_price) }}</td>
                  <td class="tr">PKR {{ fmt(p.sale_price || p.price) }}</td>
                  <td class="tc">
                    <span v-if="p.stock <= p.reorder_level" class="badge badge-red">Low</span>
                    <span v-else class="badge badge-green">OK</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <div v-else class="empty-state"><div class="empty-icon">📦</div><p>No stock data available.</p></div>
    </div>

    <!-- ===== P&L ===== -->
    <div v-if="activeTab === 'pl'" class="tab-body">
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">Interval</label>
          <select v-model="plParams.type" @change="loadPL" class="filter-select">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div v-if="plParams.type !== 'yearly'" class="filter-group">
          <label class="filter-label">Year</label>
          <input v-model.number="plParams.year" type="number" min="2020" :max="currentYear" @change="loadPL" class="filter-input w-28" />
        </div>
        <div v-if="plParams.type === 'daily'" class="filter-group">
          <label class="filter-label">Month</label>
          <input v-model.number="plParams.month" type="number" min="1" max="12" @change="loadPL" class="filter-input w-20" />
        </div>
        <button @click="loadPL" :disabled="plLoading" class="btn-refresh">
          <span v-if="plLoading" class="btn-spinner"></span><span v-else>↻</span> Refresh
        </button>
      </div>

      <div v-if="plLoading" class="loading-state"><div class="loading-ring"></div><p>Loading P&amp;L data…</p></div>

      <template v-else-if="plData">
        <div class="kpi-grid">
          <div class="kpi-card kpi-green"><div class="kpi-icon">📈</div><div><div class="kpi-label">Revenue</div><div class="kpi-value">PKR {{ fmt(plData.totals.total_revenue) }}</div></div></div>
          <div class="kpi-card kpi-red"><div class="kpi-icon">📉</div><div><div class="kpi-label">Cost</div><div class="kpi-value">PKR {{ fmt(plData.totals.total_cost) }}</div></div></div>
          <div class="kpi-card kpi-indigo"><div class="kpi-icon">💼</div><div><div class="kpi-label">Gross Profit</div><div class="kpi-value">PKR {{ fmt(plData.totals.gross_profit) }}</div></div></div>
          <div class="kpi-card kpi-yellow"><div class="kpi-icon">↩️</div><div><div class="kpi-label">Returns Deducted</div><div class="kpi-value">PKR {{ fmt(plData.totals.returns_deducted) }}</div></div></div>
          <div :class="['kpi-card', plData.totals.net_profit >= 0 ? 'kpi-emerald' : 'kpi-red']">
            <div class="kpi-icon">{{ plData.totals.net_profit >= 0 ? '🟢' : '🔴' }}</div>
            <div><div class="kpi-label">Net Profit</div><div class="kpi-value">PKR {{ fmt(plData.totals.net_profit) }}</div></div>
          </div>
        </div>

        <div v-if="plData.rows.length" class="chart-card">
          <div class="chart-card-header">
            <span class="chart-title">Revenue vs Cost vs Profit</span>
            <span class="chart-badge">{{ plData.rows.length }} periods</span>
          </div>
          <div class="chart-wrap"><canvas ref="plChartRef" height="240"></canvas></div>
        </div>

        <div class="data-card">
          <div class="data-card-header">Period Breakdown</div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Period</th><th class="tr">Revenue</th><th class="tr">Cost</th><th class="tr">Gross Profit</th><th class="tr">Margin %</th></tr></thead>
              <tbody>
                <tr v-if="!plData.rows.length"><td colspan="5" class="empty-row">No data for this period</td></tr>
                <tr v-for="row in plData.rows" :key="row.period">
                  <td class="fw5">{{ row.period }}</td>
                  <td class="tr c-green fw6">PKR {{ fmt(row.revenue) }}</td>
                  <td class="tr c-red">PKR {{ fmt(row.cost) }}</td>
                  <td class="tr fw6" :class="row.gross_profit >= 0 ? 'c-indigo' : 'c-red'">PKR {{ fmt(row.gross_profit) }}</td>
                  <td class="tr c-muted">{{ row.revenue > 0 ? ((row.gross_profit / row.revenue) * 100).toFixed(1) + '%' : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <div v-else class="empty-state"><div class="empty-icon">📊</div><p>No P&amp;L data. Try adjusting filters.</p></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import reportsApi from '@/services/reportsApi'
import {
  Chart, BarController, LineController,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
} from 'chart.js'

Chart.register(BarController, LineController, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const currentYear = new Date().getFullYear()
const tabs = [
  { key: 'sales', label: 'Sales',         icon: '💰' },
  { key: 'stock', label: 'Stock',         icon: '📦' },
  { key: 'pl',    label: 'Profit & Loss', icon: '📊' },
]
const activeTab = ref('sales')

// chart refs
const salesChartRef = ref(null)
const plChartRef    = ref(null)
let salesChart = null
let plChart    = null

// ---- Sales ----
const salesLoading = ref(false)
const salesData    = ref(null)
const salesParams  = reactive({ type: 'monthly', year: currentYear, month: new Date().getMonth() + 1 })

async function loadSales() {
  salesLoading.value = true
  try {
    const res = await reportsApi.getSalesReport({ ...salesParams })
    salesData.value = res.data?.data ?? res.data ?? null
    await nextTick(); buildSalesChart()
  } catch { salesData.value = null } finally { salesLoading.value = false }
}

function buildSalesChart() {
  if (!salesChartRef.value || !salesData.value?.rows?.length) return
  salesChart?.destroy()
  const rows = salesData.value.rows
  salesChart = new Chart(salesChartRef.value, {
    type: 'bar',
    data: {
      labels: rows.map(r => r.period),
      datasets: [
        { label: 'Revenue',   data: rows.map(r => Number(r.revenue   || 0)), backgroundColor: 'rgba(99,102,241,0.82)', borderRadius: 6, order: 1 },
        { label: 'Discounts', data: rows.map(r => Number(r.discounts || 0)), backgroundColor: 'rgba(234,179,8,0.72)',  borderRadius: 6, order: 2 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12 } } },
        tooltip: { callbacks: { label: ctx => 'PKR ' + fmt(ctx.raw) } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => 'PKR ' + Number(v).toLocaleString() } },
      },
    },
  })
}

// ---- Stock ----
const stockLoading = ref(false)
const stockData    = ref(null)
const stockParams  = reactive({ low_stock_only: false, per_page: 100 })

async function loadStock() {
  stockLoading.value = true
  try {
    const res = await reportsApi.getStockReport({ ...stockParams })
    stockData.value = res.data?.data ?? res.data ?? null
  } catch { stockData.value = null } finally { stockLoading.value = false }
}

// ---- P&L ----
const plLoading = ref(false)
const plData    = ref(null)
const plParams  = reactive({ type: 'monthly', year: currentYear, month: new Date().getMonth() + 1 })

async function loadPL() {
  plLoading.value = true
  try {
    const res = await reportsApi.getProfitLoss({ ...plParams })
    plData.value = res.data?.data ?? res.data ?? null
    await nextTick(); buildPLChart()
  } catch { plData.value = null } finally { plLoading.value = false }
}

function buildPLChart() {
  if (!plChartRef.value || !plData.value?.rows?.length) return
  plChart?.destroy()
  const rows = plData.value.rows
  plChart = new Chart(plChartRef.value, {
    type: 'bar',
    data: {
      labels: rows.map(r => r.period),
      datasets: [
        { label: 'Revenue',      data: rows.map(r => Number(r.revenue      || 0)), backgroundColor: 'rgba(34,197,94,0.75)',  borderRadius: 6, order: 2 },
        { label: 'Cost',         data: rows.map(r => Number(r.cost         || 0)), backgroundColor: 'rgba(239,68,68,0.70)',   borderRadius: 6, order: 3 },
        { type: 'line', label: 'Gross Profit', data: rows.map(r => Number(r.gross_profit || 0)),
          borderColor: 'rgba(99,102,241,1)', backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true, tension: 0.4, pointRadius: 4, order: 1 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12 } } },
        tooltip: { callbacks: { label: ctx => 'PKR ' + fmt(ctx.raw) } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => 'PKR ' + Number(v).toLocaleString() } },
      },
    },
  })
}

watch(activeTab, async (tab) => {
  await nextTick()
  if (tab === 'sales' && salesData.value) buildSalesChart()
  if (tab === 'pl'    && plData.value)    buildPLChart()
})

const fmt = (v) => Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

onMounted(() => { loadSales(); loadStock(); loadPL() })
</script>

<style scoped>
.reports-root {
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  padding: 24px 28px;
  max-width: 1280px;
  background: #f8fafc;
  min-height: 100vh;
}
.rpt-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:22px; }
.rpt-title  { font-size:26px; font-weight:800; color:#0f172a; margin:0; }
.rpt-subtitle { font-size:13px; color:#64748b; margin:4px 0 0; }
.tab-select-mobile { display:none; padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:8px; font-size:14px; background:#fff; }

.tab-pills { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
.tab-pill  {
  display:inline-flex; align-items:center; gap:6px; padding:9px 18px;
  border-radius:10px; border:1.5px solid #e2e8f0; background:#fff;
  color:#475569; font-size:14px; font-weight:600; cursor:pointer; transition:all .18s;
}
.tab-pill:hover { border-color:#a5b4fc; color:#4f46e5; }
.tab-pill--active {
  background:linear-gradient(135deg,#4f46e5,#7c3aed);
  color:#fff; border-color:transparent;
  box-shadow:0 4px 14px rgba(79,70,229,.35);
}
.tab-pill-icon { font-size:16px; }
.tab-body { animation:fadeIn .2s ease; }
@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

.filter-bar {
  display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;
  background:#fff; border:1px solid #e2e8f0; border-radius:14px;
  padding:16px 18px; margin-bottom:20px; box-shadow:0 1px 4px rgba(0,0,0,.04);
}
.filter-group { display:flex; flex-direction:column; gap:4px; }
.filter-label { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }
.filter-select, .filter-input {
  padding:7px 10px; border:1.5px solid #cbd5e1; border-radius:8px;
  font-size:13px; outline:none; background:#f8fafc; transition:border-color .15s;
}
.filter-select:focus, .filter-input:focus { border-color:#6366f1; }
.w-28 { width:110px; } .w-20 { width:80px; }
.btn-refresh {
  display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
  background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff;
  border:none; border-radius:8px; font-size:13px; font-weight:600;
  cursor:pointer; transition:opacity .15s; align-self:flex-end;
}
.btn-refresh:disabled { opacity:.6; cursor:not-allowed; }
.btn-refresh:not(:disabled):hover { opacity:.9; }
.btn-spinner {
  display:inline-block; width:13px; height:13px;
  border:2px solid rgba(255,255,255,.35); border-top-color:#fff;
  border-radius:50%; animation:spin .6s linear infinite;
}

.filter-toggle { display:inline-flex; align-items:center; gap:10px; font-size:14px; font-weight:500; color:#374151; cursor:pointer; align-self:center; }
.filter-toggle input { display:none; }
.toggle-track { width:38px; height:22px; border-radius:11px; background:#cbd5e1; position:relative; transition:background .2s; }
.filter-toggle input:checked + .toggle-track { background:#4f46e5; }
.toggle-track::after { content:''; position:absolute; left:3px; top:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .2s; }
.filter-toggle input:checked + .toggle-track::after { left:19px; }

.kpi-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; margin-bottom:20px; }
.kpi-card { border-radius:14px; padding:18px; display:flex; align-items:flex-start; gap:14px; border:1px solid transparent; box-shadow:0 1px 6px rgba(0,0,0,.06); }
.kpi-icon { font-size:26px; line-height:1; }
.kpi-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
.kpi-value { font-size:20px; font-weight:800; line-height:1.1; }

.kpi-indigo { background:#eef2ff; border-color:#c7d2fe; } .kpi-indigo .kpi-label { color:#4338ca; } .kpi-indigo .kpi-value { color:#1e1b4b; }
.kpi-green  { background:#f0fdf4; border-color:#bbf7d0; } .kpi-green  .kpi-label { color:#16a34a; } .kpi-green  .kpi-value { color:#14532d; }
.kpi-yellow { background:#fefce8; border-color:#fde68a; } .kpi-yellow .kpi-label { color:#b45309; } .kpi-yellow .kpi-value { color:#713f12; }
.kpi-blue   { background:#eff6ff; border-color:#bfdbfe; } .kpi-blue   .kpi-label { color:#1d4ed8; } .kpi-blue   .kpi-value { color:#1e3a8a; }
.kpi-slate  { background:#f8fafc; border-color:#e2e8f0; } .kpi-slate  .kpi-label { color:#475569; } .kpi-slate  .kpi-value { color:#0f172a; }
.kpi-red    { background:#fff1f2; border-color:#fecdd3; } .kpi-red    .kpi-label { color:#b91c1c; } .kpi-red    .kpi-value { color:#7f1d1d; }
.kpi-emerald{ background:#ecfdf5; border-color:#a7f3d0; } .kpi-emerald.kpi-label { color:#059669; } .kpi-emerald.kpi-value { color:#064e3b; }

.chart-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; margin-bottom:20px; box-shadow:0 1px 6px rgba(0,0,0,.05); }
.chart-card-header { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
.chart-title { font-size:15px; font-weight:700; color:#1e293b; }
.chart-badge { font-size:11px; font-weight:600; background:#eef2ff; color:#4f46e5; border-radius:20px; padding:2px 10px; }
.chart-wrap { position:relative; height:260px; }

.data-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; box-shadow:0 1px 6px rgba(0,0,0,.05); margin-bottom:20px; }
.data-card-header { padding:14px 18px; font-size:14px; font-weight:700; color:#1e293b; background:#f8fafc; border-bottom:1px solid #e2e8f0; }
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:13px; }
.data-table thead tr { background:#f1f5f9; }
.data-table th { padding:11px 14px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#64748b; white-space:nowrap; }
.data-table td { padding:11px 14px; border-bottom:1px solid #f1f5f9; color:#334155; }
.data-table tbody tr:hover { background:#f8fafc; }
.data-table tbody tr:last-child td { border-bottom:none; }
.row-danger { background:#fff5f5 !important; }
.empty-row  { text-align:center; padding:40px; color:#94a3b8; }

.tr { text-align:right; }
.tc { text-align:center; }
.fw5 { font-weight:500; }
.fw6 { font-weight:600; }
.fw7 { font-weight:700; }
.c-green  { color:#16a34a; }
.c-red    { color:#dc2626; }
.c-blue   { color:#2563eb; }
.c-yellow { color:#d97706; }
.c-indigo { color:#4f46e5; }
.c-slate  { color:#475569; }
.c-muted  { color:#94a3b8; }
.mono     { font-family:'JetBrains Mono','Fira Mono',monospace; }
.text-xs  { font-size:11px; }
.badge { font-size:11px; font-weight:600; padding:2px 9px; border-radius:20px; }
.badge-red   { background:#fee2e2; color:#b91c1c; }
.badge-green { background:#dcfce7; color:#15803d; }

.loading-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:60px 0; color:#64748b; font-size:14px; }
.loading-ring  { width:36px; height:36px; border:3px solid #e2e8f0; border-top-color:#6366f1; border-radius:50%; animation:spin .7s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.empty-state { text-align:center; padding:60px 20px; color:#94a3b8; font-size:14px; }
.empty-icon  { font-size:48px; margin-bottom:12px; }

@media(max-width:640px){
  .reports-root { padding:16px; }
  .tab-pills { display:none; }
  .tab-select-mobile { display:block; width:100%; margin-bottom:16px; }
  .kpi-grid { grid-template-columns:1fr 1fr; }
}
</style>
