<template>
  <q-btn
    flat
    round
    dense
    icon="notifications_none"
    :class="buttonClass"
    :aria-label="unreadCount ? `${unreadCount} unread low-stock alerts` : 'Low-stock alerts'">
    <q-badge v-if="unreadCount" floating rounded color="negative" :label="displayCount" />
    <q-tooltip>Low-stock alerts</q-tooltip>

    <q-menu anchor="bottom right" self="top right" class="low-stock-menu" @before-show="refresh">
      <div class="alert-head">
        <div>
          <strong>Low-stock alerts</strong>
          <small>{{ activeCount }} active · {{ unreadCount }} unread</small>
        </div>
        <q-btn
          v-if="unreadCount"
          flat dense no-caps
          label="Mark all read"
          :loading="markingAll"
          @click="markAllRead" />
      </div>

      <q-separator />
      <div v-if="loading" class="alert-state"><q-spinner color="primary" size="26px" /></div>
      <div v-else-if="!alerts.length" class="alert-state">
        <q-icon name="inventory_2" size="28px" />
        <span>No active low-stock alerts</span>
      </div>
      <q-list v-else separator class="alert-list">
        <q-item
          v-for="alert in alerts"
          :key="alert.id"
          clickable
          :class="{ unread: !alert.read_at }"
          @click="openAlert(alert)">
          <q-item-section avatar>
            <q-avatar color="orange-1" text-color="orange-9" icon="warning_amber" size="38px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ alert.product?.name || 'Product' }}</q-item-label>
            <q-item-label caption>
              {{ alert.stock }} remaining · reorder at {{ alert.reorder_level }}
            </q-item-label>
          </q-item-section>
          <q-item-section v-if="!alert.read_at" side><span class="unread-dot" /></q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import alertsApi from '@/services/lowStockAlertsApi'

const props = defineProps({
  compact: { type: Boolean, default: false },
  role: { type: String, default: 'admin' },
})

const router = useRouter()
const alerts = ref([])
const activeCount = ref(0)
const unreadCount = ref(0)
const loading = ref(false)
const markingAll = ref(false)
let pollTimer

const displayCount = computed(() => unreadCount.value > 99 ? '99+' : String(unreadCount.value))
const buttonClass = computed(() => props.compact ? 'low-stock-button compact' : 'low-stock-button')

async function refresh() {
  loading.value = true
  try {
    const [listResponse, countResponse] = await Promise.all([
      alertsApi.list({ status: 'active', per_page: 8 }),
      alertsApi.counts(),
    ])
    alerts.value = listResponse.data?.data?.data || []
    activeCount.value = Number(countResponse.data?.data?.active || 0)
    unreadCount.value = Number(countResponse.data?.data?.unread || 0)
  } catch {
    alerts.value = []
  } finally {
    loading.value = false
  }
}

async function openAlert(alert) {
  if (!alert.read_at) {
    await alertsApi.markRead(alert.id)
    alert.read_at = new Date().toISOString()
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }
  await router.push(props.role === 'manager' ? '/seller/products' : '/admin/products')
}

async function markAllRead() {
  markingAll.value = true
  try {
    await alertsApi.markAllRead()
    alerts.value.forEach((alert) => { alert.read_at ||= new Date().toISOString() })
    unreadCount.value = 0
  } finally {
    markingAll.value = false
  }
}

onMounted(() => {
  refresh()
  pollTimer = window.setInterval(refresh, 60000)
})
onUnmounted(() => window.clearInterval(pollTimer))
</script>

<style scoped>
.low-stock-button { color: inherit; }
.alert-head { display: flex; min-width: 320px; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; }
.alert-head > div { display: flex; flex-direction: column; }
.alert-head strong { color: #18211d; font-size: 14px; }
.alert-head small { margin-top: 2px; color: #6d7871; font-size: 11px; }
.alert-list { width: min(360px, 92vw); max-height: 360px; overflow-y: auto; }
.alert-list :deep(.q-item) { min-height: 68px; }
.alert-list :deep(.q-item.unread) { background: #f7faf8; }
.unread-dot { width: 8px; height: 8px; border-radius: 999px; background: #c54845; }
.alert-state { display: flex; min-width: 320px; min-height: 120px; align-items: center; justify-content: center; gap: 10px; color: #6d7871; font-size: 13px; }
</style>
