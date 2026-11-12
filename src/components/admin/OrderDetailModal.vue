<template>
  <q-dialog v-model="showModal" persistent>
    <q-card style="width: 700px; max-width: 90vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ isEditing ? 'Edit Order' : 'Order Details' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section v-if="loading" class="text-center">
        <q-spinner size="3em" color="primary" />
        <div class="q-mt-md">Loading order details...</div>
      </q-card-section>

      <q-card-section v-else-if="order" class="q-pt-none">
        <!-- Edit Mode Toggle -->
        <div class="q-mb-md text-right">
          <q-btn 
            v-if="!isEditing"
            label="Edit Order" 
            color="primary" 
            @click="isEditing = true"
          />
          <q-btn 
            v-else
            label="Cancel Edit" 
            color="negative" 
            @click="isEditing = false"
            class="q-mr-sm"
          />
        </div>

        <!-- Order Summary -->
        <div class="q-mb-md">
          <div class="text-subtitle1 q-mb-sm">Order Information</div>
          <q-separator />
          <div class="row q-mt-sm">
            <div class="col-6">
              <strong>Order ID:</strong> {{ order.id }}
            </div>
            <div class="col-6">
              <strong>Order Number:</strong> {{ order.order_number }}
            </div>
          </div>
          <div class="row q-mt-sm">
            <div class="col-6">
              <strong>Status:</strong>
              <template v-if="isEditing">
                <q-select
                  v-model="editedOrder.status"
                  :options="statusOptions"
                  dense
                  outlined
                  label="Order Status"
                />
              </template>
              <template v-else>
                <q-badge :color="getStatusColor(order.status)" class="q-ml-sm">
                  {{ order.status }}
                </q-badge>
              </template>
            </div>
            <div class="col-6">
              <strong>Order Date:</strong> {{ formatDate(order.created_at) }}
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="q-mb-md">
          <div class="text-subtitle1 q-mb-sm">Customer Information</div>
          <q-separator />
          <div class="row q-mt-sm">
            <div class="col-6">
              <strong>Name:</strong> {{ order.user?.name || 'N/A' }}
            </div>
            <div class="col-6">
              <strong>Email:</strong> {{ order.user?.email || 'N/A' }}
            </div>
          </div>
          <div class="row q-mt-sm" v-if="order.shipping_address">
            <div class="col-12">
              <strong>Shipping Address:</strong><br>
              {{ order.shipping_address.line1 }}, {{ order.shipping_address.city }}<br>
              {{ order.shipping_address.postal_code }}<br>
              {{ order.shipping_address.country }}
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="q-mb-md">
          <div class="text-subtitle1 q-mb-sm">Order Items</div>
          <q-separator />
          <q-table
            :rows="order.items || []"
            :columns="itemColumns"
            row-key="id"
            flat
            bordered
            hide-pagination
            :rows-per-page-options="[0]"
          >
            <template v-slot:body-cell-price="props">
              <q-td :props="props">
                {{ formatMoney(props.row.price) }}
              </q-td>
            </template>
            <template v-slot:body-cell-total="props">
              <q-td :props="props">
                {{ formatMoney(props.row.price * props.row.quantity) }}
              </q-td>
            </template>
          </q-table>
        </div>

        <!-- Order Totals -->
        <div class="q-mb-md">
          <div class="text-subtitle1 q-mb-sm">Order Summary</div>
          <q-separator />
          <div class="row q-mt-sm">
            <div class="col-6">
              <strong>Subtotal:</strong>
            </div>
            <div class="col-6 text-right">
              {{ formatMoney(order.subtotal || 0) }}
            </div>
          </div>
          <div class="row q-mt-sm">
            <div class="col-6">
              <strong>Shipping:</strong>
            </div>
            <div class="col-6 text-right">
              {{ formatMoney(order.shipping || 0) }}
            </div>
          </div>
          <div class="row q-mt-sm">
            <div class="col-6">
              <strong>Tax:</strong>
            </div>
            <div class="col-6 text-right">
              {{ formatMoney(order.tax || 0) }}
            </div>
          </div>
          <div class="row q-mt-sm text-h6">
            <div class="col-6">
              <strong>Total:</strong>
            </div>
            <div class="col-6 text-right">
              {{ formatMoney(order.total || 0) }}
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div v-if="order.payment" class="q-mb-md">
          <div class="text-subtitle1 q-mb-sm">Payment Information</div>
          <q-separator />
          <div class="row q-mt-sm">
            <div class="col-6">
              <strong>Payment Method:</strong> {{ order.payment.method }}
            </div>
            <div class="col-6">
              <strong>Payment Status:</strong>
              <q-badge :color="getPaymentStatusColor(order.payment.status)" class="q-ml-sm">
                {{ order.payment.status }}
              </q-badge>
            </div>
          </div>
          <div class="row q-mt-sm" v-if="order.payment.transaction_id">
            <div class="col-12">
              <strong>Transaction ID:</strong> {{ order.payment.transaction_id }}
            </div>
          </div>
        </div>

        <!-- Save Changes Button (only in edit mode) -->
        <div v-if="isEditing" class="q-mt-md text-right">
          <q-btn 
            label="Save Changes" 
            color="positive" 
            @click="saveChanges"
            :loading="saving"
          />
        </div>
      </q-card-section>

      <q-card-section v-else class="text-center text-negative">
        Failed to load order details
      </q-card-section>

      <q-card-actions align="right" v-if="!isEditing">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useQuasar } from 'quasar'
import { formatMoney } from '@/utils/currency'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: String,
    default: null
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'editOrder'])

const $q = useQuasar()
const orderStore = useOrderStore()

// modal open/close binding
const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// local state
const order = computed(() => orderStore.adminOrder)
const loading = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const editedOrder = ref({})

// status select options
const statusOptions = [
  // 'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'disputed',
  'returned'
]

// table columns for items
const itemColumns = [
  { name: 'product', label: 'Product', field: row => row.product?.name || 'N/A', align: 'left' },
  { name: 'quantity', label: 'Qty', field: 'quantity', align: 'center' },
  { name: 'price', label: 'Price', field: 'price', align: 'right' },
  { name: 'total', label: 'Total', field: row => (row.price * row.quantity).toFixed(2), align: 'right' }
]

// update editedOrder when order changes
watch(order, (newOrder) => {
  if (newOrder) {
    editedOrder.value = { ...newOrder }
  }
}, { immediate: true })

// helpers
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

const getPaymentStatusColor = (status) => {
  const colors = {
    // pending: 'warning',
    completed: 'positive',
    failed: 'negative',
    refunded: 'orange'
  }
  return colors[status] || 'grey'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// fetch a fresh order
const fetchOrder = async () => {
  if (!props.orderId) return
  loading.value = true
  try {
    await orderStore.fetchAdminOrder(props.orderId)
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to load order details'
    })
  } finally {
    loading.value = false
  }
}

const saveChanges = async () => {
  saving.value = true
  try {
    let response
    
    // Special handling for returned status
    if (editedOrder.value.status === 'returned') {
      const note = prompt('Please enter a note for the return:')
      if (!note) {
        saving.value = false
        return
      }
      response = await orderStore.returnOrder(order.value.id, note)
    } else {
      response = await orderStore.updateAdminOrder(order.value.id, {
        status: editedOrder.value.status
      })
    }

    // ✅ Re-fetch updated order from API
    await fetchOrder()

    // Close modal and reset edit mode
    showModal.value = false
    isEditing.value = false

    if (response?.success) {
      $q.notify({
        type: 'positive',
        message: 'Order updated successfully'
      })
      // No need to emit event - parent will refresh when modal closes
    }

  } catch (error) {
    showModal.value = false
    isEditing.value = false
  } finally {
    saving.value = false
  }
}



// keep isEditing synced with prop
watch(() => props.editMode, (newEditMode) => {
  isEditing.value = newEditMode
}, { immediate: true })

// whenever modal opens, fetch order
watch(showModal, async (newValue) => {
  if (newValue && props.orderId) {
    await fetchOrder()
  }
})
</script>
