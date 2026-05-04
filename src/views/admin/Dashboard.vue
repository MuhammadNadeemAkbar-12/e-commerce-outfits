<template>
  <div class="q-pa-md">
    <div class="flex items-center justify-between q-mb-md">
      <div class="text-h4 dark:text-white">Admin Dashboard</div>
      <q-btn
        unelevated
        color="primary"
        icon="download"
        label="Download Backup"
        :loading="backupLoading"
        @click="downloadBackup"
      />
    </div>
    
    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <q-card-section class="text-center">
            <div class="flex justify-center mb-2">
              <q-icon name="people" size="2rem" class="text-blue-100" />
            </div>
            <div class="text-h6 font-semibold">Total Users</div>
            <div class="text-h4 font-bold">{{ stats.totalUsers }}</div>
            <div class="text-sm opacity-90">Active customers</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-md-3">
        <q-card class="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <q-card-section class="text-center">
            <div class="flex justify-center mb-2">
              <q-icon name="store" size="2rem" class="text-green-100" />
            </div>
            <div class="text-h6 font-semibold">Total Sellers</div>
            <div class="text-h4 font-bold">{{ stats.totalSellers }}</div>
            <div class="text-sm opacity-90">Active sellers</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-md-3">
        <q-card class="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <q-card-section class="text-center">
            <div class="flex justify-center mb-2">
              <q-icon name="inventory" size="2rem" class="text-purple-100" />
            </div>
            <div class="text-h6 font-semibold">Total Products</div>
            <div class="text-h4 font-bold">{{ stats.totalProducts }}</div>
            <div class="text-sm opacity-90">Active listings</div>
          </q-card-section>
        </q-card>
      </div>
      
      <div class="col-12 col-md-3">
        <q-card class="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
          <q-card-section class="text-center">
            <div class="flex justify-center mb-2">
              <q-icon name="shopping_cart" size="2rem" class="text-orange-100" />
            </div>
            <div class="text-h6 font-semibold">Total Orders</div>
            <div class="text-h4 font-bold">{{ stats.totalOrders }}</div>
            <div class="text-sm opacity-90">This month</div>
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
            <div class="text-h6 font-semibold text-gray-800 dark:text-white">Revenue Overview</div>
            <div class="q-mt-md">
              <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-800 rounded-lg p-4" style="height: 300px; display: flex; align-items: center; justify-content: center;">
                <div class="text-center">
                  <q-icon name="bar_chart" size="3rem" class="text-blue-400 dark:text-blue-300 mb-2" />
                  <div class="text-gray-600 dark:text-gray-300 font-medium">Revenue Chart Placeholder</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">Chart.js integration coming soon</div>
                </div>
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
              <q-item class="bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200">
                <q-item-section avatar>
                  <q-icon name="shopping_cart" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-medium text-gray-800 dark:text-gray-200">New order #1234</q-item-label>
                  <q-item-label caption class="text-gray-600 dark:text-gray-400">2 minutes ago</q-item-label>
                </q-item-section>
              </q-item>
              <q-item class="bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200">
                <q-item-section avatar>
                  <q-icon name="person_add" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-medium text-gray-800 dark:text-gray-200">New user registered</q-item-label>
                  <q-item-label caption class="text-gray-600 dark:text-gray-400">5 minutes ago</q-item-label>
                </q-item-section>
              </q-item>
              <q-item class="bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200">
                <q-item-section avatar>
                  <q-icon name="check_circle" color="accent" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Product approved</q-item-label>
                  <q-item-label caption class="text-gray-600 dark:text-gray-400">10 minutes ago</q-item-label>
                </q-item-section>
              </q-item>
              <q-item class="bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200">
                <q-item-section avatar>
                  <q-icon name="trending_up" color="warning" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Revenue increased</q-item-label>
                  <q-item-label caption class="text-gray-600 dark:text-gray-400">15 minutes ago</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminService from '@/services/adminApi';

const stats = ref({
  totalUsers: 0,
  totalSellers: 0,
  totalProducts: 0,
  totalOrders: 0,
});
const loading = ref(true);
const backupLoading = ref(false);
const error = ref(null);

const fetchDashboardStats = async () => {
  try {
    const response = await AdminService.getDashboardStats();
    if (response.success) {
      // Map the API response to our expected format
      stats.value = {
        totalUsers: response.data.users?.total || 0,
        totalSellers: response.data.sellers?.total || 0,
        totalProducts: response.data.products?.total || 0,
        totalOrders: response.data.orders?.total || 0
      };
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

const downloadBackup = async () => {
  backupLoading.value = true;
  try {
    const response = await AdminService.exportSystemBackup();
    if (!response.success) {
      throw new Error(response.message || 'Failed to export backup');
    }

    const blob = new Blob([response.data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = url;
    link.download = `inventory-backup-${ts}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    error.value = err?.message || 'Failed to download backup';
  } finally {
    backupLoading.value = false;
  }
};

onMounted(() => {
  fetchDashboardStats();
});

</script>
