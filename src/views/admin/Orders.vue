<template>
  <div class="q-pa-md">
    <div class="text-h4 q-mb-md">All Orders</div>
    
    <!-- Bulk Actions -->
    <div v-if="selectedOrders.length > 0" class="row items-center q-mb-md q-pa-sm bg-gray-800 text-white rounded-borders border border-gray-700">
      <div class="col-auto q-mr-md">
        <span class="text-weight-medium">{{ selectedOrders.length }} order(s) selected</span>
      </div>
      <div class="col">
        <div class="row q-gutter-sm">
          <q-select
            v-model="bulkStatus"
            :options="statusOptions.filter(opt => opt !== 'all')"
            label="Update Status"
            dense
            outlined
            style="min-width: 150px"
            class="bg-gray-700 text-white"
            popup-content-class="bg-gray-800 text-white border border-gray-600"
            dark
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                :class="{'bg-gray-600': scope.selected}"
                class="text-white"
              >
                <q-item-section>
                  <q-item-label>{{ scope.opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-btn
            @click="updateBulkStatus"
            label="Apply to Selected"
            color="blue-6"
            text-color="white"
            size="sm"
            unelevated
            :disable="!bulkStatus"
            class="hover:bg-blue-500 transition-colors"
          />
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          @click="clearSelection"
          icon="clear"
          label="Clear Selection"
          color="gray-400"
          text-color="white"
          size="sm"
          flat
          class="hover:bg-gray-700 transition-colors"
        />
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md dark:bg-gray-800 dark:border-gray-700">
      <q-card-section class="dark:bg-gray-800">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input 
              v-model="search" 
              placeholder="Search orders..." 
              dense 
              outlined
              class="dark:bg-gray-700 dark:text-white"
              dark
            >
              <template v-slot:append>
                <q-icon name="search" class="text-gray-400" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select 
              v-model="filterStatus" 
              :options="statusOptions" 
              label="Filter by status" 
              dense 
              outlined
              class="dark:bg-gray-700 dark:text-white"
              popup-content-class="dark:bg-gray-800 dark:text-white border border-gray-600"
              dark
            >
              <template v-slot:option="scope">
                <q-item
                  v-bind="scope.itemProps"
                  v-on="scope.itemEvents"
                  :class="{'bg-gray-600': scope.selected}"
                  class="text-white"
                >
                  <q-item-section>
                    <q-item-label>{{ scope.opt }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-3">
            <q-select 
              v-model="filterType" 
              :options="typeOptions" 
              label="Filter by type" 
              dense 
              outlined
              class="dark:bg-gray-700 dark:text-white"
              popup-content-class="dark:bg-gray-800 dark:text-white border border-gray-600"
              dark
            >
              <template v-slot:option="scope">
                <q-item
                  v-bind="scope.itemProps"
                  v-on="scope.itemEvents"
                  :class="{'bg-gray-600': scope.selected}"
                  class="text-white"
                >
                  <q-item-section>
                    <q-item-label>{{ scope.opt }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>
    
    <q-card>
      <q-card-section>
        <q-table
          :rows="filteredOrders"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="orderStore.adminLoading"
          selection="multiple"
          v-model:selected="selectedOrders"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)">
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </template>
          
          <template v-slot:body-cell-total="props">
            <q-td :props="props">
              ${{ props.row.total }}
            </q-td>
          </template>
          
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round color="primary" icon="visibility" @click="viewOrder(props.row)" />
              <q-btn flat round color="primary" icon="edit" @click="editOrder(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Order Detail Modal -->
   <OrderDetailModal
    v-model="showOrderModal"
    :order-id="selectedOrderId"
    :editMode="openInEditMode"
    @editOrder="handleEditOrder"
  />

  <!-- Bulk Status Confirm Dialog -->
  <ConfirmDialog
    v-model="showBulkConfirm"
    title="Update Order Status"
    :message="`Update ${selectedOrders.length} order(s) to &quot;${bulkStatus}&quot; status?`"
    type="warning"
    confirm-label="Update"
    :loading="confirmLoading"
    @confirm="executeBulkStatusUpdate"
  />

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useQuasar } from 'quasar'
import OrderDetailModal from '@/components/admin/OrderDetailModal.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'

const $q = useQuasar()
const orderStore = useOrderStore()

const search = ref('')
const filterStatus = ref('all')
const filterType = ref('all')
const showOrderModal = ref(false)
const selectedOrderId = ref(null)
const openInEditMode = ref(false)
const showBulkConfirm = ref(false)
const confirmLoading = ref(false)

const statusOptions = ['all', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'disputed']
const typeOptions = ['all', 'customer', 'seller']

const columns = [
  { name: 'id', label: 'Order ID', field: 'id', align: 'left' },
  { name: 'order_number', label: 'Order Number', field: 'order_number', align: 'left' },
  { name: 'customer', label: 'Customer', field: row => row.user.name, align: 'left' },
  { name: 'subtotal', label: 'Subtotal', field: 'subtotal', align: 'right' },
  { name: 'shipping', label: 'Shipping', field: 'shipping', align: 'right' },
  { name: 'tax', label: 'Tax', field: 'tax', align: 'right' },
  { name: 'total', label: 'Total', field: 'total', align: 'right' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'date', label: 'Order Date', field: row => new Date(row.created_at).toLocaleDateString(), align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const selectedOrders = ref([])
const bulkStatus = ref('')

const filteredOrders = computed(() => {
  let filtered = orderStore.adminOrders.data || []

  // Filter by search
  if (search.value) {
    filtered = filtered.filter(order => 
      order.id.toLowerCase().includes(search.value.toLowerCase()) ||
      (order.customer?.name || order.customer)?.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  // Filter by status
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(order => order.status === filterStatus.value)
  }

  // Filter by type
  if (filterType.value !== 'all') {
    filtered = filtered.filter(order => order.type === filterType.value)
  }

  return filtered
})

const updateBulkStatus = () => {
  if (selectedOrders.value.length === 0 || !bulkStatus.value) return
  showBulkConfirm.value = true
}

const executeBulkStatusUpdate = async () => {
  confirmLoading.value = true
  try {
    const orderIds = selectedOrders.value.map(order => order.id)
    const response = await orderStore.bulkUpdateOrders(orderIds, { status: bulkStatus.value })
    
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: `${orderIds.length} order(s) updated to ${bulkStatus.value} successfully`,
        position: 'top'
      })
    }
    selectedOrders.value = []
    bulkStatus.value = ''
    await fetchOrders()
  } catch (error) {
    await fetchOrders()
  } finally {
    confirmLoading.value = false
    showBulkConfirm.value = false
  }
}

const clearSelection = () => {
  selectedOrders.value = []
  bulkStatus.value = ''
}

const getStatusColor = (status) => {
  const colors = {
    // pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'positive',
    cancelled: 'negative',
    refunded: 'orange',
    disputed: 'purple',
    returned: 'teal'
  }
  return colors[status] || 'grey'
}

const viewOrder = async (order) => {
  selectedOrderId.value = order.id
  showOrderModal.value = true
}

const editOrder = (order) => {
  selectedOrderId.value = order.id
  openInEditMode.value = true
  showOrderModal.value = true
}

const handleEditOrder = async () => {
  await fetchOrders() // refresh after edit
}

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await orderStore.updateAdminOrder(orderId, { status: newStatus })
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: 'Order status updated successfully'
      })
    }
    await fetchOrders()
  } catch (error) {
    await fetchOrders()
  }
}

const processRefund = async (orderId) => {
  try {
    const response = await orderStore.processAdminRefund(orderId, {})
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: 'Refund processed successfully'
      })
    }
    await fetchOrders()
  } catch (error) {
    await fetchOrders()
  }
}

// Watch for filter changes
watch([search, filterStatus, filterType], () => {
  fetchOrders()
})

const fetchOrders = async () => {
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (filterStatus.value !== 'all') params.status = filterStatus.value
    if (filterType.value !== 'all') params.type = filterType.value
    
    await orderStore.fetchAdminOrders(params)
  } catch (error) {
    // silent fail
  }
}

// Watch for modal close to reset edit mode and refresh orders
watch(showOrderModal, (newValue) => {
  if (!newValue) {
    openInEditMode.value = false
    fetchOrders()
  }
})

onMounted(() => {
  fetchOrders()
})
</script>
