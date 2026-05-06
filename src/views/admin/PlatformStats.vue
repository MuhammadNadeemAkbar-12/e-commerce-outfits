<template>
  <div class="q-pa-md platform-stats-page">
    <div class="text-h4 q-mb-md dark:text-white">Platform Stats</div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-card flat bordered class="stats-card">
          <q-card-section>
            <div class="text-caption text-grey-6">Total Users</div>
            <div class="text-h5 text-weight-bold">{{ stats.totalUsers }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="stats-card">
          <q-card-section>
            <div class="text-caption text-grey-6">Total Sellers</div>
            <div class="text-h5 text-weight-bold">{{ stats.totalSellers }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="stats-card">
          <q-card-section>
            <div class="text-caption text-grey-6">Total Products</div>
            <div class="text-h5 text-weight-bold">{{ stats.totalProducts }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat bordered class="stats-card">
          <q-card-section>
            <div class="text-caption text-grey-6">Total Orders</div>
            <div class="text-h5 text-weight-bold">{{ stats.totalOrders }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-6">
        <q-card flat bordered class="chart-card">
          <q-card-section>
            <div class="text-h6 text-weight-medium q-mb-sm">User vs Seller Growth</div>
            <div class="chart-wrap"><canvas ref="growthChartRef"></canvas></div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered class="chart-card">
          <q-card-section>
            <div class="text-h6 text-weight-medium q-mb-sm">Approval Breakdown</div>
            <div class="chart-wrap"><canvas ref="approvalChartRef"></canvas></div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered class="chart-card">
          <q-card-section>
            <div class="text-h6 text-weight-medium q-mb-sm">Orders by Status</div>
            <div class="chart-wrap"><canvas ref="ordersChartRef"></canvas></div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered class="chart-card">
          <q-card-section>
            <div class="text-h6 text-weight-medium q-mb-sm">Products Overview</div>
            <div class="chart-wrap"><canvas ref="productsChartRef"></canvas></div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';
import adminApi from '@/services/adminApi';

const stats = ref({
  totalUsers: 0,
  totalSellers: 0,
  totalProducts: 0,
  totalOrders: 0,
  approvedSellers: 0,
  pendingSellers: 0,
  blockedSellers: 0,
  approvedProducts: 0,
  pendingProducts: 0,
  blockedProducts: 0,
  usersNewLast7: 0,
  ordersByStatus: {},
});

const growthChartRef = ref(null);
const approvalChartRef = ref(null);
const ordersChartRef = ref(null);
const productsChartRef = ref(null);

let growthChart = null;
let approvalChart = null;
let ordersChart = null;
let productsChart = null;

const createCharts = async () => {
  await nextTick();

  growthChart?.destroy();
  approvalChart?.destroy();
  ordersChart?.destroy();
  productsChart?.destroy();

  const growthCtx = growthChartRef.value?.getContext('2d');
  if (growthCtx) {
    growthChart = new Chart(growthCtx, {
      type: 'bar',
      data: {
        labels: ['Users', 'New Users (7d)', 'Sellers'],
        datasets: [{
          data: [stats.value.totalUsers, stats.value.usersNewLast7, stats.value.totalSellers],
          backgroundColor: ['#3b82f6', '#22c55e', '#a855f7'],
          borderRadius: 8,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
    });
  }

  const approvalCtx = approvalChartRef.value?.getContext('2d');
  if (approvalCtx) {
    approvalChart = new Chart(approvalCtx, {
      type: 'doughnut',
      data: {
        labels: ['Approved Sellers', 'Pending Sellers', 'Blocked Sellers'],
        datasets: [{
          data: [stats.value.approvedSellers, stats.value.pendingSellers, stats.value.blockedSellers],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#fff',
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '62%' },
    });
  }

  const ordersCtx = ordersChartRef.value?.getContext('2d');
  if (ordersCtx) {
    const labels = Object.keys(stats.value.ordersByStatus || {}).map((s) => s.charAt(0).toUpperCase() + s.slice(1));
    const values = Object.values(stats.value.ordersByStatus || {}).map(Number);
    ordersChart = new Chart(ordersCtx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Pending', 'Delivered', 'Cancelled'],
        datasets: [{
          data: values.length ? values : [0, 0, 0],
          backgroundColor: '#06b6d4',
          borderRadius: 8,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
    });
  }

  const productsCtx = productsChartRef.value?.getContext('2d');
  if (productsCtx) {
    productsChart = new Chart(productsCtx, {
      type: 'pie',
      data: {
        labels: ['Approved Products', 'Pending Products', 'Blocked Products'],
        datasets: [{
          data: [stats.value.approvedProducts, stats.value.pendingProducts, stats.value.blockedProducts],
          backgroundColor: ['#8b5cf6', '#f59e0b', '#ef4444'],
        }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }
};

const loadStats = async () => {
  const response = await adminApi.getDashboardStats();
  const data = response?.data?.data || {};

  stats.value = {
    totalUsers: data.users?.total || 0,
    totalSellers: data.sellers?.total || 0,
    totalProducts: data.products?.total || 0,
    totalOrders: data.orders?.total || 0,
    approvedSellers: data.sellers?.approved || 0,
    pendingSellers: data.sellers?.pending || 0,
    blockedSellers: data.sellers?.blocked || 0,
    approvedProducts: data.products?.approved || 0,
    pendingProducts: data.products?.pending || 0,
    blockedProducts: data.products?.blocked || 0,
    usersNewLast7: data.users?.new_last_7_days || 0,
    ordersByStatus: data.orders?.by_status || {},
  };

  await createCharts();
};

onMounted(async () => {
  await loadStats();
});

onBeforeUnmount(() => {
  growthChart?.destroy();
  approvalChart?.destroy();
  ordersChart?.destroy();
  productsChart?.destroy();
});
</script>

<style scoped>
.platform-stats-page {
  background: #f3f4f6;
}

.stats-card,
.chart-card {
  border-radius: 14px;
  background: #fff;
}

.chart-wrap {
  position: relative;
  height: 320px;
}
</style>
