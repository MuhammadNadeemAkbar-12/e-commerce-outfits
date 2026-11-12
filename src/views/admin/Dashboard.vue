<template>
  <div class="q-pa-md">
    <div class="flex items-center justify-between q-mb-md">
      <div>
        <div class="text-h4 dark:text-white">Admin Dashboard</div>
        <div class="text-caption text-grey-7">Sales = finalized invoices · Purchases = received stock-in · Amounts in Rs.</div>
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="backup"
        label="Backup & Restore"
        @click="router.push('/admin/backups')"
      />
    </div>
    
    <!-- BMS Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
          <q-card-section class="text-center">
            <q-icon name="request_quote" size="2rem" class="text-orange-100 q-mb-sm" />
            <div class="text-h6 font-semibold">Total Sales</div>
            <div class="text-h5 font-bold">{{ stats.salesTotalFormatted }}</div>
            <div class="text-sm opacity-90">{{ stats.totalInvoices }} finalized invoices</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg">
          <q-card-section class="text-center">
            <q-icon name="shopping_cart_checkout" size="2rem" class="text-teal-100 q-mb-sm" />
            <div class="text-h6 font-semibold">Purchase Value</div>
            <div class="text-h5 font-bold">{{ stats.purchaseTotalFormatted }}</div>
            <div class="text-sm opacity-90">{{ stats.purchaseCount }} received purchases</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
          <q-card-section class="text-center">
            <q-icon name="inventory_2" size="2rem" class="text-purple-100 q-mb-sm" />
            <div class="text-h6 font-semibold">Inventory Products</div>
            <div class="text-h4 font-bold">{{ stats.totalProducts }}</div>
            <div class="text-sm opacity-90">{{ stats.totalStockUnits }} units in stock</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg">
          <q-card-section class="text-center">
            <q-icon name="warning" size="2rem" class="text-rose-100 q-mb-sm" />
            <div class="text-h6 font-semibold">Low Stock</div>
            <div class="text-h4 font-bold">{{ stats.lowStockCount }}</div>
            <div class="text-sm opacity-90">{{ stats.pendingReturns }} pending returns</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
          <q-card-section class="text-center">
            <q-icon name="trending_up" size="2rem" class="text-blue-100 q-mb-sm" />
            <div class="text-h6 font-semibold">Sales This Month</div>
            <div class="text-h5 font-bold">{{ stats.salesMonthFormatted }}</div>
            <div class="text-sm opacity-90">Today: {{ stats.revenueTodayFormatted }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <q-card-section class="text-center">
            <q-icon name="badge" size="2rem" class="text-green-100 q-mb-sm" />
            <div class="text-h6 font-semibold">Managers</div>
            <div class="text-h4 font-bold">{{ stats.totalManagers }}</div>
            <div class="text-sm opacity-90">{{ stats.approvedManagers }} approved</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Error Handling -->
    <div v-if="error" class="q-mb-md">
      <q-banner dense class="bg-red-5 text-white">
        {{ error }}
      </q-banner>
    </div>

    <div v-if="loading" class="q-mb-md text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-sm text-gray-600">Loading dashboard stats...</div>
    </div>

    <!-- Charts Section -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card class="shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800 dark:border dark:border-gray-700">
          <q-card-section>
            <div class="text-h6 font-semibold text-gray-800 dark:text-white">Monthly Sales Chart (Invoice Revenue)</div>
            <div class="q-mt-md">
              <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-800 rounded-lg p-4" style="height: 320px;">
                <canvas ref="revenueChartRef" style="height: 100%; width: 100%;"></canvas>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-md-4">
        <q-card class="shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800 dark:border dark:border-gray-700">
          <q-card-section>
            <div class="text-h6 font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</div>
            <q-list class="space-y-2">
              <q-item
                v-for="item in recentActivity"
                :key="`${item.type}-${item.id}`"
                class="bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
              >
                <q-item-section avatar>
                  <q-icon :name="iconForActivity(item.type)" :color="colorForActivity(item.type)" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-medium text-gray-800 dark:text-gray-200">{{ item.title }}</q-item-label>
                  <q-item-label caption class="text-gray-600 dark:text-gray-400">{{ item.meta }} • {{ timeAgo(item.created_at) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="!recentActivity.length" class="rounded-lg bg-slate-100">
                <q-item-section>
                  <q-item-label class="text-slate-500">No recent activity available</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="q-mt-md" v-if="lowStockProducts.length">
              <div class="text-subtitle2 text-gray-700 dark:text-gray-300 q-mb-xs">Low Stock Snapshot</div>
              <q-list dense bordered separator>
                <q-item v-for="item in lowStockProducts.slice(0, 5)" :key="item.id">
                  <q-item-section>{{ item.name }}</q-item-section>
                  <q-item-section side class="text-red-600 font-bold">{{ item.stock }}</q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-6">
        <q-card class="shadow-md dark:bg-gray-800">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Recent Sales Invoices</div>
            <q-list separator>
              <q-item v-for="inv in recentInvoices" :key="inv.id">
                <q-item-section>
                  <q-item-label>{{ inv.invoice_number }}</q-item-label>
                  <q-item-label caption>{{ inv.party }} · {{ inv.invoice_date }} · {{ inv.status }}</q-item-label>
                </q-item-section>
                <q-item-section side>{{ formatMoney(inv.grand_total) }}</q-item-section>
              </q-item>
              <q-item v-if="!recentInvoices.length"><q-item-section class="text-grey-6">No invoices yet</q-item-section></q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card class="shadow-md dark:bg-gray-800">
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Recent Purchases</div>
            <q-list separator>
              <q-item v-for="p in recentPurchases" :key="p.id">
                <q-item-section>
                  <q-item-label>{{ p.purchase_number }}</q-item-label>
                  <q-item-label caption>{{ p.supplier }} · {{ p.purchase_date }} · {{ p.status }}</q-item-label>
                </q-item-section>
                <q-item-section side>{{ formatMoney(p.grand_total) }}</q-item-section>
              </q-item>
              <q-item v-if="!recentPurchases.length"><q-item-section class="text-grey-6">No purchases yet</q-item-section></q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>

  <!-- ─── Platform Breakdown Charts ─────────────────────────── -->
  <div class="q-mt-lg q-px-md">
    <div class="text-h6 font-semibold text-gray-800 dark:text-white q-mb-md">Operations Breakdown</div>
    <div class="row q-col-gutter-md">

      <!-- Users Chart -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="shadow-md dark:bg-gray-800 dark:border dark:border-gray-700 rounded-xl">
          <q-card-section class="text-center q-pb-xs">
            <div class="text-subtitle2 font-semibold text-gray-700 dark:text-gray-200 q-mb-sm">
              <q-icon name="people" color="blue-6" class="q-mr-xs" />Users
            </div>
            <div style="position:relative;height:160px;display:flex;align-items:center;justify-content:center">
              <canvas ref="usersChartRef"></canvas>
            </div>
            <div class="q-mt-sm text-xs text-gray-500 dark:text-gray-400">
              <span class="text-blue-600 font-bold">{{ stats.usersNewLast7 }}</span> new this week &middot; <span class="font-bold text-gray-700 dark:text-gray-300">{{ stats.totalUsers }}</span> total
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Managers Chart -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="shadow-md dark:bg-gray-800 dark:border dark:border-gray-700 rounded-xl">
          <q-card-section class="text-center q-pb-xs">
            <div class="text-subtitle2 font-semibold text-gray-700 dark:text-gray-200 q-mb-sm">
              <q-icon name="badge" color="green-6" class="q-mr-xs" />Managers
            </div>
            <div style="position:relative;height:160px;display:flex;align-items:center;justify-content:center">
              <canvas ref="sellersChartRef"></canvas>
            </div>
            <div class="q-mt-sm text-xs text-gray-500 dark:text-gray-400">
              <span class="text-green-600 font-bold">{{ stats.approvedManagers }}</span> approved &middot; <span class="text-amber-600 font-bold">{{ stats.pendingManagers }}</span> pending
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Products Chart -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="shadow-md dark:bg-gray-800 dark:border dark:border-gray-700 rounded-xl">
          <q-card-section class="text-center q-pb-xs">
            <div class="text-subtitle2 font-semibold text-gray-700 dark:text-gray-200 q-mb-sm">
              <q-icon name="inventory" color="purple-6" class="q-mr-xs" />Products
            </div>
            <div style="position:relative;height:160px;display:flex;align-items:center;justify-content:center">
              <canvas ref="productsChartRef"></canvas>
            </div>
            <div class="q-mt-sm text-xs text-gray-500 dark:text-gray-400">
              <span class="text-purple-600 font-bold">{{ stats.approvedProducts }}</span> approved &middot; <span class="text-amber-600 font-bold">{{ stats.pendingProducts }}</span> pending
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sales Chart -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="shadow-md dark:bg-gray-800 dark:border dark:border-gray-700 rounded-xl">
          <q-card-section class="text-center q-pb-xs">
            <div class="text-subtitle2 font-semibold text-gray-700 dark:text-gray-200 q-mb-sm">
              <q-icon name="receipt_long" color="orange-6" class="q-mr-xs" />Finalized Sales
            </div>
            <div style="position:relative;height:160px;display:flex;align-items:center;justify-content:center">
              <canvas ref="ordersChartRef"></canvas>
            </div>
            <div class="q-mt-sm text-xs text-gray-500 dark:text-gray-400">
              <span class="font-bold text-gray-700 dark:text-gray-300">{{ stats.totalInvoices }}</span> invoices &middot; <span class="text-green-600 font-bold">{{ stats.revenueTodayFormatted }}</span> today
            </div>
          </q-card-section>
        </q-card>
      </div>

    </div>
  </div>

</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';
import AdminService from '@/services/adminApi';
import { useRouter } from 'vue-router';
import { formatMoney } from '@/utils/currency';

const router = useRouter();

const stats = ref({
  totalUsers: 0,
  totalManagers: 0,
  approvedManagers: 0,
  pendingManagers: 0,
  totalProducts: 0,
  totalStockUnits: 0,
  totalInvoices: 0,
  purchaseCount: 0,
  lowStockCount: 0,
  usersNewLast7: 0,
  approvedProducts: 0,
  pendingProducts: 0,
  ordersByStatus: {},
  revenueToday: 0,
  revenueTodayFormatted: formatMoney(0),
  salesMonthFormatted: formatMoney(0),
  salesTotalFormatted: formatMoney(0),
  purchaseTotalFormatted: formatMoney(0),
  pendingReturns: 0,
});
const loading = ref(true);
const error = ref(null);
const revenueChartRef = ref(null);
const usersChartRef    = ref(null);
const sellersChartRef  = ref(null);
const productsChartRef = ref(null);
const ordersChartRef   = ref(null);
const recentActivity = ref([]);
const lowStockProducts = ref([]);
const recentInvoices = ref([]);
const recentPurchases = ref([]);

let revenueChartInstance  = null;
let usersChartInstance    = null;
let sellersChartInstance  = null;
let productsChartInstance = null;
let ordersChartInstance   = null;

const destroyAll = () => {
  [revenueChartInstance, usersChartInstance, sellersChartInstance, productsChartInstance, ordersChartInstance].forEach(c => c?.destroy());
  revenueChartInstance = usersChartInstance = sellersChartInstance = productsChartInstance = ordersChartInstance = null;
};

const destroyRevenueChart = () => {
  if (revenueChartInstance) { revenueChartInstance.destroy(); revenueChartInstance = null; }
};

const doughnutDefaults = (labels, data, colors) => ({
  type: 'doughnut',
  data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 6 }] },
  options: {
    maintainAspectRatio: false,
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 }, padding: 8 } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}` } },
    },
  },
});

const renderBreakdownCharts = async (data) => {
  await nextTick();

  // Users chart: new last 7 days vs rest
  const ctxU = usersChartRef.value?.getContext('2d');
  if (ctxU) {
    usersChartInstance?.destroy();
    const newU = data.users?.new_last_7_days || 0;
    const rest = Math.max(0, (data.users?.total || 0) - newU);
    usersChartInstance = new Chart(ctxU, doughnutDefaults(
      ['New (7 days)', 'Existing'],
      [newU, rest],
      ['#3b82f6', '#bfdbfe']
    ));
  }

  // Sellers chart: approved / pending / blocked
  const ctxS = sellersChartRef.value?.getContext('2d');
  if (ctxS) {
    sellersChartInstance?.destroy();
    sellersChartInstance = new Chart(ctxS, doughnutDefaults(
      ['Approved', 'Pending', 'Blocked'],
      [data.sellers?.approved || 0, data.sellers?.pending || 0, data.sellers?.blocked || 0],
      ['#22c55e', '#f59e0b', '#ef4444']
    ));
  } // managers chart (legacy sellers payload)

  // Products chart: approved / pending / blocked
  const ctxP = productsChartRef.value?.getContext('2d');
  if (ctxP) {
    productsChartInstance?.destroy();
    productsChartInstance = new Chart(ctxP, doughnutDefaults(
      ['Approved', 'Pending', 'Blocked'],
      [data.products?.approved || 0, data.products?.pending || 0, data.products?.blocked || 0],
      ['#a855f7', '#f59e0b', '#ef4444']
    ));
  }

  // Orders by status chart
  const ctxO = ordersChartRef.value?.getContext('2d');
  if (ctxO) {
    ordersChartInstance?.destroy();
    const byStatus = data.sales?.by_status || {};
    const statusLabels = Object.keys(byStatus).map(s => s.charAt(0).toUpperCase() + s.slice(1));
    const statusData   = Object.values(byStatus).map(Number);
    const statusColors = ['#f97316','#22c55e','#3b82f6','#ef4444','#8b5cf6','#14b8a6','#f59e0b'];
    ordersChartInstance = new Chart(ctxO, doughnutDefaults(statusLabels, statusData, statusColors.slice(0, statusLabels.length)));
  }
};

const renderRevenueChart = async (charts) => {
  await nextTick();
  const ctx = revenueChartRef.value?.getContext('2d');
  if (!ctx) return;

  destroyRevenueChart();

  const labels = charts?.labels || [];
  const revenueSeries = charts?.revenue_last_7_days || [];
  const orderSeries = charts?.invoices_last_7_days || charts?.sales_last_7_days || charts?.orders_last_7_days || [];

  revenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Sales (Rs.)',
          data: revenueSeries,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.14)',
          tension: 0.35,
          fill: true,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Invoices',
          data: orderSeries,
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.25)',
          yAxisID: 'y1',
          borderRadius: 4,
          maxBarThickness: 22,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom' },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.2)' },
          ticks: {
            callback: (value) => formatMoney(value, { decimals: 0 }),
          },
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
        },
      },
    },
  });
};

const iconForActivity = (type) => {
  if (type === 'order' || type === 'invoice') return 'shopping_cart';
  if (type === 'user' || type === 'customer') return 'person_add';
  if (type === 'product') return 'inventory_2';
  if (type === 'sale_return') return 'assignment_return';
  return 'bolt';
};

const colorForActivity = (type) => {
  if (type === 'order' || type === 'invoice') return 'positive';
  if (type === 'user' || type === 'customer') return 'primary';
  if (type === 'product') return 'accent';
  if (type === 'sale_return') return 'warning';
  return 'secondary';
};

const timeAgo = (value) => {
  if (!value) return 'just now';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const fetchDashboardStats = async () => {
  try {
    const response = await AdminService.getDashboardStats();
    if (response.success) {
      const d = response.data?.data ?? response.data;
      // Map the API response to our expected format
      stats.value = {
        totalUsers:    d.users?.total        || 0,
        totalManagers: d.sellers?.total      || 0,
        approvedManagers: d.sellers?.approved || 0,
        pendingManagers: d.sellers?.pending || 0,
        totalProducts: d.products?.total     || 0,
        totalStockUnits: d.inventory?.total_stock_units || 0,
        totalInvoices: d.sales?.total_invoices || 0,
        purchaseCount: d.purchases?.received_count || 0,
        lowStockCount: d.products?.low_stock_count || d.inventory?.low_stock_count || 0,
        usersNewLast7:    d.users?.new_last_7_days  || 0,
        approvedProducts: d.products?.approved      || 0,
        pendingProducts:  d.products?.pending       || 0,
        ordersByStatus:   d.sales?.by_status        || {},
        revenueToday:     d.sales?.revenue_today    || 0,
        revenueTodayFormatted: formatMoney(d.sales?.revenue_today || 0),
        salesMonthFormatted: formatMoney(d.sales?.revenue_this_month || 0),
        salesTotalFormatted: formatMoney(d.sales?.revenue_total || 0),
        purchaseTotalFormatted: formatMoney(d.purchases?.value_total || 0),
        pendingReturns: d.sales?.pending_returns || 0,
      };

      recentActivity.value  = d.recent_activity || [];
      lowStockProducts.value = d.products?.low_stock_sample || [];
      recentInvoices.value = d.recent_invoices || [];
      recentPurchases.value = d.recent_purchases || [];

      await renderRevenueChart(d.charts || {});
      await renderBreakdownCharts(d);
    } else {
      error.value = response.message || 'Failed to fetch dashboard stats';
    }
  } catch (err) {
    error.value = 'Network error: Failed to connect to the server';
    console.error('Dashboard stats fetch error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardStats();
});

onBeforeUnmount(() => {
  destroyAll();
});

</script>
