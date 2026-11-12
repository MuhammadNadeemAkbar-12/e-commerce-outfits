<template>
  <div class="q-pa-md max-w-6xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Salesman Dashboard</div>
        <div class="text-caption text-grey-7">Your sales invoices and returns overview (amounts in Rs.)</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn unelevated color="primary" icon="add" label="New Invoice" :to="'/sales/invoices/create'" />
        <q-btn outline color="primary" icon="refresh" :loading="loading" @click="load" />
      </div>
    </div>

    <q-banner v-if="error" class="bg-red-1 text-negative q-mb-md" dense>{{ error }}</q-banner>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3" v-for="card in kpiCards" :key="card.label">
        <q-card flat bordered class="kpi-card">
          <q-card-section>
            <div class="text-caption text-grey-7">{{ card.label }}</div>
            <div class="text-h5 text-weight-bold q-mt-xs">{{ card.value }}</div>
            <div class="text-caption text-grey-6">{{ card.hint }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">Sales (last 7 days)</div>
            <div style="height: 280px" class="q-mt-md">
              <canvas ref="chartRef"></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-5">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Recent invoices</div>
            <q-list separator>
              <q-item v-for="inv in recentInvoices" :key="inv.id" clickable :to="`/sales/invoices`">
                <q-item-section>
                  <q-item-label>{{ inv.invoice_number }}</q-item-label>
                  <q-item-label caption>{{ inv.party }} · {{ inv.invoice_date }} · {{ inv.status }}</q-item-label>
                </q-item-section>
                <q-item-section side>{{ formatMoney(inv.grand_total) }}</q-item-section>
              </q-item>
              <q-item v-if="!recentInvoices.length">
                <q-item-section class="text-grey-6">No invoices yet. Create your first sales invoice.</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Chart from 'chart.js/auto'
import axios from '@/api/axios'
import { formatMoney } from '@/utils/currency'

const loading = ref(false)
const error = ref(null)
const data = ref(null)
const chartRef = ref(null)
let chartInstance = null

const sales = computed(() => data.value?.sales || {})
const recentInvoices = computed(() => data.value?.recent_invoices || [])

const kpiCards = computed(() => [
  { label: 'Sales today', value: formatMoney(sales.value.revenue_today || 0), hint: 'Finalized invoices' },
  { label: 'Sales this month', value: formatMoney(sales.value.revenue_this_month || 0), hint: 'Finalized invoices' },
  { label: 'My finalized invoices', value: String(sales.value.total_invoices || 0), hint: `${sales.value.draft_invoices || 0} draft` },
  { label: 'Pending returns', value: String(sales.value.pending_returns || 0), hint: `Low stock items: ${data.value?.inventory?.low_stock_count || 0}` },
])

async function renderChart(charts = {}) {
  await nextTick()
  const ctx = chartRef.value?.getContext('2d')
  if (!ctx) return
  chartInstance?.destroy()
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: charts.labels || [],
      datasets: [
        {
          label: 'Sales (Rs.)',
          data: charts.sales_last_7_days || [],
          backgroundColor: 'rgba(49, 95, 85, 0.35)',
          borderColor: '#315f55',
          borderWidth: 1,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (v) => formatMoney(v, { decimals: 0 }) },
        },
      },
    },
  })
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/sales/dashboard/stats')
    data.value = res.data?.data || res.data
    await renderChart(data.value?.charts || {})
  } catch (e) {
    error.value = e?.response?.data?.message || 'Unable to load salesman dashboard'
  } finally {
    loading.value = false
  }
}

onMounted(load)
onBeforeUnmount(() => chartInstance?.destroy())
</script>

<style scoped>
.kpi-card { border-radius: 12px; background: #fff; }
</style>
