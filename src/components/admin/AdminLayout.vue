<template>
  <div :class="{ dark: $q.dark.isActive }" class="admin-shell">
    <q-layout view="lHh Lpr lff" class="admin-layout">
      <q-header class="admin-header">
        <q-toolbar class="admin-toolbar">
          <q-btn
            flat round dense icon="menu"
            class="admin-header-btn lt-md"
            aria-label="Toggle navigation"
            @click="drawer = !drawer" />

          <q-toolbar-title class="admin-title">
            <span class="admin-title-mark">S</span>
            <span class="admin-title-copy">
              <strong>StyleHub</strong>
              <small>Operations</small>
            </span>
          </q-toolbar-title>

          <LowStockAlertsMenu class="admin-header-btn" role="admin" />
          <q-btn flat round dense icon="brightness_6" class="admin-header-btn" aria-label="Toggle color theme" @click="toggleTheme">
            <q-tooltip>Toggle theme</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="logout" class="admin-header-btn" aria-label="Log out" @click="handleLogout">
            <q-tooltip>Log out</q-tooltip>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="drawer"
        show-if-above
        :width="260"
        :breakpoint="900"
        bordered
        class="admin-drawer">
        <q-scroll-area class="fit">
          <div class="admin-drawer-intro">
            <span>Workspace</span>
            <strong>Administration</strong>
            <small>Business control centre</small>
          </div>

          <q-list padding class="admin-nav">
            <template v-for="group in navigation" :key="group.label">
              <q-item-label header>{{ group.label }}</q-item-label>
              <q-item
                v-for="item in group.items"
                :key="item.to"
                clickable
                v-ripple
                :to="item.to"
                active-class="admin-nav-active">
                <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.label }}</q-item-label>
                  <q-item-label caption>{{ item.caption }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator spaced />
            </template>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page class="admin-page">
          <router-view />
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LowStockAlertsMenu from '@/components/common/LowStockAlertsMenu.vue'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const drawer = ref(false)

const navigation = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', caption: 'Business overview', icon: 'space_dashboard', to: '/admin/dashboard' },
      { label: 'Reports', caption: 'Sales and inventory', icon: 'query_stats', to: '/admin/reports' },
      { label: 'Platform Stats', caption: 'Operational metrics', icon: 'insights', to: '/admin/platform-stats' },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Users', caption: 'Customer accounts', icon: 'group', to: '/admin/users' },
      { label: 'Sellers', caption: 'Seller accounts', icon: 'storefront', to: '/admin/sellers' },
      { label: 'Business Customers', caption: 'B2B accounts', icon: 'apartment', to: '/admin/biz-customers' },
      { label: 'Suppliers', caption: 'Supplier records', icon: 'local_shipping', to: '/admin/suppliers' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Products', caption: 'Product catalogue', icon: 'inventory_2', to: '/admin/products' },
      { label: 'Product Approval', caption: 'Review listings', icon: 'fact_check', to: '/admin/product-approval' },
      { label: 'Categories', caption: 'Catalogue structure', icon: 'category', to: '/admin/categories' },
      { label: 'Customer Orders', caption: 'Online purchases', icon: 'shopping_bag', to: '/admin/customer-orders' },
      { label: 'Seller Orders', caption: 'Seller fulfilment', icon: 'receipt_long', to: '/admin/seller-orders' },
      { label: 'Invoices', caption: 'Sales records', icon: 'request_quote', to: '/admin/invoices' },
      { label: 'Returns', caption: 'Returns and refunds', icon: 'assignment_return', to: '/admin/sale-returns' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { label: 'Purchases', caption: 'Purchasing and stock-in', icon: 'shopping_cart_checkout', to: '/admin/purchases' },
      { label: 'Stock Movements', caption: 'Inventory activity', icon: 'swap_vert', to: '/admin/stock-movements' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Activity Logs', caption: 'Administrative audit trail', icon: 'manage_history', to: '/admin/audit-logs' },
      { label: 'Backup & Restore', caption: 'Protected archives', icon: 'cloud_sync', to: '/admin/backups' },
      { label: 'Settings', caption: 'Platform configuration', icon: 'settings', to: '/admin/settings' },
    ],
  },
]

function toggleTheme() {
  $q.dark.toggle()
  localStorage.setItem('theme', $q.dark.isActive ? 'dark' : 'light')
}

async function handleLogout() {
  try {
    await authStore.logout()
    $q.notify({ type: 'positive', message: 'Logged out successfully', position: 'top' })
    await router.push('/')
  } catch {
    $q.notify({ type: 'negative', message: 'Unable to log out', position: 'top' })
  }
}

onMounted(() => {
  $q.dark.set(localStorage.getItem('theme') === 'dark')
})
</script>

<style scoped>
.admin-shell,
.admin-layout,
.admin-layout :deep(.q-page-container),
.admin-layout :deep(.q-page),
.admin-layout :deep(.q-toolbar) {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.admin-layout { min-height: 100vh; overflow-x: clip; background: var(--sh-canvas); }
.admin-header { border-bottom: 1px solid var(--sh-border); background: rgba(255,255,255,.94); color: var(--sh-ink); box-shadow: 0 4px 20px rgba(24,33,29,.055); backdrop-filter: blur(14px); }
.admin-toolbar { min-height: 64px; padding: 0 18px; }
.admin-title { display: flex; min-width: 0; align-items: center; gap: 11px; color: var(--sh-ink); font-size: 15px; }
.admin-title-mark { display: grid; width: 34px; height: 34px; flex: 0 0 auto; place-items: center; border-radius: 9px; background: var(--sh-primary); color: #fff; font-family: Georgia, serif; font-size: 18px; font-weight: 700; }
.admin-title-copy { display: flex; min-width: 0; flex-direction: column; line-height: 1.08; }
.admin-title-copy strong { letter-spacing: -.01em; }
.admin-title-copy small { margin-top: 3px; color: var(--sh-muted); font-size: 10px; font-weight: 650; letter-spacing: .12em; text-transform: uppercase; }
.admin-header-btn { color: #4c5b54; }
.admin-header-btn:hover { background: #edf2ef; color: var(--sh-primary); }

.admin-drawer { border-right: 0 !important; background: #17241f !important; color: #e9efeb; box-shadow: 8px 0 28px rgba(15,24,20,.12); }
.admin-drawer-intro { display: flex; flex-direction: column; margin: 18px 14px 8px; border-bottom: 1px solid rgba(255,255,255,.1); padding: 4px 8px 18px; }
.admin-drawer-intro span { color: #bda991; font-size: 10px; font-weight: 750; letter-spacing: .14em; text-transform: uppercase; }
.admin-drawer-intro strong { margin-top: 4px; color: #fff; font-size: 17px; letter-spacing: -.015em; }
.admin-drawer-intro small { margin-top: 3px; color: #95a49c; font-size: 11px; }
.admin-nav :deep(.q-item__label--header) { padding: 18px 12px 6px; color: #92a199 !important; font-size: 10px; font-weight: 750; letter-spacing: .13em; text-transform: uppercase; }
.admin-nav :deep(.q-separator) { background: rgba(255,255,255,.08); }
.admin-nav :deep(.q-item) { min-height: 48px; margin: 3px 6px; border-radius: 9px; color: #d6dfda; }
.admin-nav :deep(.q-item:hover) { background: rgba(255,255,255,.065) !important; }
.admin-nav :deep(.admin-nav-active) { background: rgba(178,204,190,.14) !important; color: #fff; }
.admin-nav :deep(.admin-nav-active)::before { position: absolute; top: 12px; bottom: 12px; left: 0; width: 3px; border-radius: 4px; background: #bda991; content: ''; }
.admin-nav :deep(.q-item__section--avatar) { min-width: 40px; }
.admin-nav :deep(.q-item__label) { color: inherit !important; font-size: 13px; font-weight: 620; }
.admin-nav :deep(.q-item__label--caption) { margin-top: 2px; color: #8fa098 !important; font-size: 10px; font-weight: 450; }
.admin-nav :deep(.q-icon) { color: #b8c7bf !important; font-size: 20px; }
.admin-nav :deep(.admin-nav-active .q-icon) { color: #d5bea3 !important; }
.admin-page { min-height: 100vh; padding: clamp(20px,3vw,34px); background: var(--sh-canvas); }

.dark .admin-header { background: rgba(25,34,30,.95); }

@media (max-width: 899px) {
  .admin-toolbar { padding-inline: 8px; }
  .admin-title-copy small { display: none; }
  .admin-title-mark { width: 31px; height: 31px; }
  .admin-page { padding: 16px !important; }
}
</style>
