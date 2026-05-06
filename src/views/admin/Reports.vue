<template>
  <div class="q-pa-md reports-page">
    <div class="text-h4 q-mb-md">Reports</div>

    <!-- Controls -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-gutter-sm items-center">
        <q-btn-toggle
          v-model="reportType"
          toggle-color="primary"
          :options="[
            { label: 'Daily',   value: 'daily'   },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly',  value: 'yearly'  },
          ]"
          unelevated dense
          @update:model-value="loadAll"
        />
        <q-select
          v-model="selectedYear"
          :options="yearOptions"
          label="Year"
          dense outlined
          style="min-width:100px"
          @update:model-value="loadAll"
        />
        <q-select
          v-if="reportType === 'daily'"
          v-model="selectedMonth"
          :options="monthOptions"
          label="Month"
          dense outlined
          style="min-width:130px"
          @update:model-value="loadAll"
        />
        <q-btn icon="refresh" flat round dense :loading="loading" @click="loadAll" />
      </q-card-section>
    </q-card>

    <!-- Error -->
    <q-banner v-if="error" class="bg-red-1 text-red q-mb-md" rounded>
      <template #avatar><q-icon name="error_outline" /></template>
      {{ error }}
    </q-banner>

    <!-- Charts Row -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="chart-card">
          <q-card-section>
            <div class="text-h6 q-mb-sm">Revenue Report</div>
            <div class="chart-wrap">
              <q-skeleton v-if="loading" height="220px" />
              <canvas v-else ref="revenueChartRef"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="chart-card">
          <q-card-section>
            <div class="text-h6 q-mb-sm">Profit & Loss</div>
            <div class="chart-wrap">
              <q-skeleton v-if="loading" height="220px" />
              <canvas v-else ref="plChartRef"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6 col-md-3" v-for="card in summaryCards" :key="card.label">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-6">{{ card.label }}</div>
            <div class="text-h6 text-weight-bold" :class="card.color">
              <q-skeleton v-if="loading" width="80px" />
              <span v-else>{{ card.value }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Stock Section -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-sm">Stock Overview</div>
            <q-skeleton v-if="loading" height="120px" />
            <div v-else class="row q-col-gutter-md">
              <div class="col-6">
                <div class="text-caption text-grey-6">Total Products</div>
                <div class="text-h6">{{ stockSummary.total_products ?? 0 }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Total Units</div>
                <div class="text-h6">{{ stockSummary.total_units ?? 0 }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Stock Value (Cost)</div>
                <div class="text-h6">{{ formatCurrency(stockSummary.total_cost_value) }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6">Low Stock Items</div>
                <div class="text-h6 text-orange">{{ stockSummary.low_stock_count ?? 0 }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="chart-card">
          <q-card-section>
            <div class="text-h6 q-mb-sm">Stock Value Breakdown</div>
            <div class="chart-wrap">
              <q-skeleton v-if="loading" height="220px" />
              <canvas v-else ref="stockChartRef"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import axios from '@/api/axios';

// ── Controls ──────────────────────────────────────────────────────────────────
const reportType    = ref('monthly');
const selectedYear  = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);

const yearOptions  = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
const monthOptions = [
  { label: 'January', value: 1 }, { label: 'February', value: 2 },
  { label: 'March',   value: 3 }, { label: 'April',    value: 4 },
  { label: 'May',     value: 5 }, { label: 'June',     value: 6 },
  { label: 'July',    value: 7 }, { label: 'August',   value: 8 },
  { label: 'September', value: 9 }, { label: 'October', value: 10 },
  { label: 'November', value: 11 }, { label: 'December', value: 12 },
];

// ── State ─────────────────────────────────────────────────────────────────────
const loading      = ref(false);
const error        = ref(null);
const salesTotals  = ref({});
const plTotals     = ref({});
const stockSummary = ref({});

const revenueChartRef = ref(null);
const plChartRef      = ref(null);
const stockChartRef   = ref(null);
let revenueChart = null, plChart = null, stockChart = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(v) {
  return 'PKR ' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildParams() {
  const p = { type: reportType.value, year: selectedYear.value };
  if (reportType.value === 'daily') {
    p.month = typeof selectedMonth.value === 'object' ? selectedMonth.value.value : selectedMonth.value;
  }
  return p;
}

const summaryCards = computed(() => [
  { label: 'Total Revenue',  value: formatCurrency(salesTotals.value.total_revenue), color: 'text-primary' },
  { label: 'Total Invoices', value: salesTotals.value.total_invoices ?? 0,           color: '' },
  { label: 'Gross Profit',   value: formatCurrency(plTotals.value.gross_profit),     color: 'text-positive' },
  { label: 'Net Profit',     value: formatCurrency(plTotals.value.net_profit),
    color: (plTotals.value.net_profit >= 0) ? 'text-positive' : 'text-negative' },
]);

// ── Chart builders ────────────────────────────────────────────────────────────
function buildRevenueChart(rows) {
  revenueChart?.destroy();
  const ctx = revenueChartRef.value?.getContext('2d');
  if (!ctx) return;
  const sorted = [...rows].reverse();
  revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(r => r.period),
      datasets: [
        { label: 'Revenue',   data: sorted.map(r => Number(r.revenue   || 0)), backgroundColor: 'rgba(59,130,246,0.75)', borderRadius: 6 },
        { label: 'Discounts', data: sorted.map(r => Number(r.discounts || 0)), backgroundColor: 'rgba(249,115,22,0.65)', borderRadius: 6 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } },
  });
}

function buildPlChart(rows) {
  plChart?.destroy();
  const ctx = plChartRef.value?.getContext('2d');
  if (!ctx) return;
  const sorted = [...rows].reverse();
  plChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sorted.map(r => r.period),
      datasets: [
        { label: 'Revenue',      data: sorted.map(r => Number(r.revenue      || 0)), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)', fill: true, tension: 0.4, pointRadius: 4 },
        { label: 'Cost',         data: sorted.map(r => Number(r.cost         || 0)), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)',  fill: true, tension: 0.4, pointRadius: 4 },
        { label: 'Gross Profit', data: sorted.map(r => Number(r.gross_profit || 0)), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)',  fill: true, tension: 0.4, pointRadius: 4 },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } },
  });
}

function buildStockChart(summary) {
  stockChart?.destroy();
  const ctx = stockChartRef.value?.getContext('2d');
  if (!ctx) return;
  stockChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Cost Value', 'Sale Value'],
      datasets: [{ data: [Number(summary?.total_cost_value || 0), Number(summary?.total_sale_value || 0)], backgroundColor: ['#f59e0b', '#8b5cf6'], borderWidth: 2, borderColor: '#fff' }],
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom' } } },
  });
}

// ── Load data ─────────────────────────────────────────────────────────────────
async function loadAll() {
  loading.value = true;
  error.value   = null;
  const params  = buildParams();

  try {
    const [salesRes, plRes, stockRes] = await Promise.all([
      axios.get('/reports/sales',       { params }),
      axios.get('/reports/profit-loss', { params }),
      axios.get('/reports/stock'),
    ]);

    const salesData = salesRes?.data?.data ?? {};
    const plData    = plRes?.data?.data    ?? {};
    const stockData = stockRes?.data?.data ?? {};

    salesTotals.value  = salesData.totals  ?? {};
    plTotals.value     = plData.totals     ?? {};
    stockSummary.value = stockData.summary ?? {};

    await nextTick();
    buildRevenueChart(salesData.rows ?? []);
    buildPlChart(plData.rows ?? []);
    buildStockChart(stockData.summary ?? {});
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Failed to load reports';
    console.error('[Reports] load error', err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
onBeforeUnmount(() => { revenueChart?.destroy(); plChart?.destroy(); stockChart?.destroy(); });
</script>

<style scoped>
.chart-card .chart-wrap {
  position: relative;
  height: 220px;
}
</style>
