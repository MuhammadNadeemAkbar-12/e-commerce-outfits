<template>
  <div :class="{ 'dark': $q.dark.isActive }" class="transition-colors duration-300">
    <q-layout view="lHh Lpr lff" class="admin-layout shadow-2 rounded-borders">
      <q-header elevated class="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg">
        <q-toolbar>
          <!-- Back button for mobile view -->
          <q-btn 
            v-if="isMobile" 
            flat 
            @click="handleBack" 
            round 
            dense 
            icon="arrow_back" 
            class="text-white hover:bg-blue-700 transition-colors duration-200" 
          />
          <q-toolbar-title class="text-white text-xl font-bold tracking-wide">Stock, Inventory &amp; Sales Management</q-toolbar-title>
          <q-btn flat @click="drawer = !drawer" round dense icon="menu" class="text-white hover:bg-blue-700 transition-colors duration-200 md:hidden" />
          <q-btn flat @click="toggleTheme" round dense icon="brightness_6" class="text-white hover:bg-blue-700 transition-colors duration-200" />
          <q-btn flat @click="handleLogout" round dense icon="logout" class="text-white hover:bg-blue-700 transition-colors duration-200" />
        </q-toolbar>
      </q-header>

      <!-- Mobile Overlay and Back Button -->
      <div 
        v-if="drawer && isMobile" 
        class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        @click="drawer = false"
      >
        <q-btn 
          @click="handleBack" 
          class="absolute top-4 left-4 bg-white text-black"
          label="Back"
        />
      </div>

      <q-drawer
        v-model="drawer"
        show-if-above
        :width="250"
        :breakpoint="768"
        bordered
        :class="[
          'bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
          'shadow-xl transition-all duration-300 ease-in-out'
        ]"
      >
        <q-scroll-area class="fit">
          <q-list padding>
            <!-- Buyers Section -->
            <q-item-label header class="text-weight-bold text-primary dark:text-blue-300">Buyers</q-item-label>
            
            <q-item clickable v-ripple to="/admin/users" class="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="people" color="primary" class="text-blue-600 dark:text-blue-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Manage Users</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Customer accounts</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/customer-orders" class="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="shopping_cart" color="primary" class="text-blue-600 dark:text-blue-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Customer Orders</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">All buyer orders</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator spaced />

            <!-- Sellers Section -->
            <q-item-label header class="text-weight-bold text-secondary dark:text-green-300">Sellers</q-item-label>
            
            <q-item clickable v-ripple to="/admin/sellers" class="hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="store" color="secondary" class="text-green-600 dark:text-green-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Manage Sellers</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Seller accounts</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/admin/seller-products" class="hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
              <q-icon name="inventory_2" color="secondary" class="text-green-600 dark:text-green-400" />
              </q-item-section>
              <q-item-section>
              <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Seller Products</q-item-label>
              <q-item-label caption class="text-gray-600 dark:text-gray-400">Product listings</q-item-label>
              </q-item-section>
            </q-item>


            <q-item clickable v-ripple to="/admin/seller-orders" class="hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="receipt_long" color="secondary" class="text-green-600 dark:text-green-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Seller Orders</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Order fulfillment</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator spaced />

            <!-- Products Section -->
            <q-item-label header class="text-weight-bold text-accent">Products</q-item-label>
            
            <q-item clickable v-ripple to="/admin/products" class="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="inventory" color="accent" class="text-purple-600 dark:text-purple-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">All Products</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Product catalog</q-item-label>
              </q-item-section>
            </q-item>


            <q-item clickable v-ripple to="/admin/categories" class="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="category" color="accent" class="text-purple-600 dark:text-purple-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Categories</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Product categories</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator spaced />

            <!-- Orders Section -->
            <q-item-label header class="text-weight-bold text-positive">Orders</q-item-label>
            
            <q-item clickable v-ripple to="/admin/orders" class="hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="list_alt" color="positive" class="text-orange-600 dark:text-orange-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">All Orders</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Order management</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/returns-refunds" class="hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="assignment_return" color="positive" class="text-orange-600 dark:text-orange-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Returns & Refunds</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Return requests</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator spaced />

            <!-- Analytics Section -->
            <q-item-label header class="text-weight-bold text-info">Analytics &amp; Reports</q-item-label>
            
            <q-item clickable v-ripple to="/admin/dashboard" class="hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="dashboard" color="info" class="text-cyan-600 dark:text-cyan-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Dashboard</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Platform overview</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/reports" class="hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="bar_chart" color="info" class="text-cyan-600 dark:text-cyan-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Reports</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Sales &amp; inventory reports</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/admin/platform-stats" class="hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="analytics" color="info" class="text-cyan-600 dark:text-cyan-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Platform Stats</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Advanced analytics</q-item-label>
              </q-item-section>
            </q-item>



            <!-- Settings & System -->
            <q-separator spaced />
            <q-item-label header class="text-weight-bold">System</q-item-label>

            <q-item clickable v-ripple to="/admin/settings" class="hover:bg-gray-100 dark:hover:bg-gray-800/30 hover:shadow-md transition-all duration-200 rounded-lg">
              <q-item-section avatar>
                <q-icon name="settings" class="text-gray-600 dark:text-gray-400" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="font-medium text-gray-800 dark:text-gray-200">Settings</q-item-label>
                <q-item-label caption class="text-gray-600 dark:text-gray-400">Platform configuration</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page :class="isMobile ? 'pt-16' : 'pt-20'" padding>
          <transition name="fade">
            <router-view />
          </transition>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const drawer = ref(false)
const screenWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

const isMobile = computed(() => {
  return screenWidth.value < 768
})

const onResize = () => {
  screenWidth.value = window.innerWidth
}

const toggleTheme = () => {
  $q.dark.toggle();
  localStorage.setItem('theme', $q.dark.isActive ? 'dark' : 'light'); // Save theme state
  $q.notify({
    type: 'info',
    message: $q.dark.isActive ? 'Dark mode enabled' : 'Light mode enabled',
    position: 'top-right',
    timeout: 1000
  });
}

// Load theme state from localStorage on mount
onMounted(() => {
  window.addEventListener('resize', onResize)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    $q.dark.set(true);
  } else {
    $q.dark.set(false);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
const handleBack = () => {
  router.back(); // Navigate to the previous page
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    $q.notify({
      type: 'positive',
      message: 'Logged out successfully',
      position: 'top'
    })
    router.push('/')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error logging out',
      position: 'top'
    })
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.q-item__section--avatar {
  min-width: 40px;
}
</style>
