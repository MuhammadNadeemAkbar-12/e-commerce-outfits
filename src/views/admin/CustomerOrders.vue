<template>
  <div class="q-pa-md">
    <div class="text-h4 q-mb-md">Customer Orders</div>

    <!-- Analytics Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Total Orders</div>
            <div class="text-h6 text-weight-bold text-primary">{{ analytics.total }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Processing</div>
            <div class="text-h6 text-weight-bold text-blue">{{ analytics.processing }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Shipped</div>
            <div class="text-h6 text-weight-bold text-cyan-8">{{ analytics.shipped }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Delivered</div>
            <div class="text-h6 text-weight-bold text-positive">{{ analytics.delivered }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Cancelled</div>
            <div class="text-h6 text-weight-bold text-negative">{{ analytics.cancelled }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-gutter-sm items-center">
        <q-input
          v-model="filters.q"
          dense outlined clearable
          placeholder="Search order #..."
          style="min-width:180px"
          @keyup.enter="load"
          @clear="load"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>

        <q-select
          v-model="filters.status"
          :options="statusOptions"
          label="Status"
          dense outlined clearable
          style="min-width:150px"
          emit-value map-options
          @update:model-value="load"
        />

        <q-input
          v-model="filters.date_from"
          dense outlined type="date"
          label="From"
          style="min-width:145px"
          @update:model-value="load"
        />
        <q-input
          v-model="filters.date_to"
          dense outlined type="date"
          label="To"
          style="min-width:145px"
          @update:model-value="load"
        />

        <q-btn icon="refresh" flat round dense :loading="loading" @click="load" />
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered>
      <q-table
        :rows="orders"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :rows-per-page-options="[10, 25, 50]"
        v-model:pagination="pagination"
        @request="onTableRequest"
      >
        <!-- Status badge -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="statusColor(props.value)" class="text-capitalize q-px-sm q-py-xs">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <!-- Date -->
        <template #body-cell-date="props">
          <q-td :props="props">
            {{ formatDate(props.row.created_at) }}
          </q-td>
        </template>

        <!-- Total -->
        <template #body-cell-total="props">
          <q-td :props="props">
            PKR {{ Number(props.value).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </q-td>
        </template>

        <!-- Actions -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" size="sm" color="primary" @click="openEdit(props.row)" />
            <q-btn flat round dense icon="visibility" size="sm" color="grey-7"  @click="openView(props.row)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Edit Status Dialog -->
    <q-dialog v-model="editDialog" persistent>
      <q-card style="min-width:380px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Update Order #{{ editOrder?.id }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="editForm.status"
            :options="statusOptions"
            label="Status"
            outlined dense
            emit-value map-options
          />
          <q-input v-model="editForm.tracking_id" label="Tracking ID" outlined dense clearable />
          <q-input v-model="editForm.notes"       label="Notes"       outlined dense type="textarea" rows="3" />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated color="primary" label="Save" :loading="saving" @click="saveStatus" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- View Order Dialog -->
    <q-dialog v-model="viewDialog">
      <q-card style="min-width:500px;max-width:700px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Order #{{ viewOrder?.id }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="viewOrder">
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-6">
              <div class="text-caption text-grey-6">Customer</div>
              <div class="text-weight-medium">{{ viewOrder.user?.name || '—' }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Email</div>
              <div class="text-weight-medium">{{ viewOrder.user?.email || '—' }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Date</div>
              <div>{{ formatDate(viewOrder.created_at) }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Status</div>
              <q-badge :color="statusColor(viewOrder.status)" class="text-capitalize">{{ viewOrder.status }}</q-badge>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Total</div>
              <div class="text-weight-bold">PKR {{ Number(viewOrder.total).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
            </div>
            <div class="col-6" v-if="viewOrder.tracking_id">
              <div class="text-caption text-grey-6">Tracking ID</div>
              <div>{{ viewOrder.tracking_id }}</div>
            </div>
          </div>

          <div class="text-subtitle2 q-mb-xs">Items</div>
          <q-list bordered separator dense>
            <q-item v-for="item in viewOrder.items" :key="item.id">
              <q-item-section>
                <q-item-label>{{ item.product?.name || 'Product #' + item.product_id }}</q-item-label>
                <q-item-label caption>Qty: {{ item.quantity }} × PKR {{ Number(item.price).toLocaleString() }}</q-item-label>
              </q-item-section>
              <q-item-section side class="text-weight-bold">
                PKR {{ Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from '@/api/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ── State ─────────────────────────────────────────────────────────────────────
const loading = ref(false)
const saving  = ref(false)
const orders  = ref([])

const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

const filters = reactive({ q: '', status: null, date_from: '', date_to: '' })

// Analytics
const analytics = ref({ total: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 })

const editDialog = ref(false)
const viewDialog = ref(false)
const editOrder  = ref(null)
const viewOrder  = ref(null)
const editForm   = reactive({ status: '', tracking_id: '', notes: '' })

// ── Constants ─────────────────────────────────────────────────────────────────
const statusOptions = [
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped',    value: 'shipped'    },
  { label: 'Delivered',  value: 'delivered'  },
  { label: 'Cancelled',  value: 'cancelled'  },
  { label: 'Refunded',   value: 'refunded'   },
  { label: 'Disputed',   value: 'disputed'   },
  { label: 'Returned',   value: 'returned'   },
]

const columns = [
  { name: 'id',       label: 'Order ID', field: 'id',     align: 'left',   sortable: true  },
  { name: 'customer', label: 'Customer', field: row => row.user?.name || '—', align: 'left' },
  { name: 'items',    label: 'Items',    field: row => row.items?.length ?? 0, align: 'center' },
  { name: 'total',    label: 'Total',    field: 'total',  align: 'right',  sortable: true  },
  { name: 'status',   label: 'Status',   field: 'status', align: 'center', sortable: true  },
  { name: 'date',     label: 'Date',     field: 'created_at', align: 'left', sortable: true },
  { name: 'actions',  label: 'Actions',  field: 'actions', align: 'center' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusColor(s) {
  const map = {
    processing: 'blue',
    shipped:    'cyan-8',
    delivered:  'positive',
    cancelled:  'negative',
    refunded:   'orange',
    disputed:   'red-9',
    returned:   'purple',
  }
  return map[s] || 'grey'
}

function formatDate(val) {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Data loading ──────────────────────────────────────────────────────────────
async function load(props) {
  loading.value = true
  const page       = props?.pagination?.page       ?? pagination.value.page
  const rowsPerPage = props?.pagination?.rowsPerPage ?? pagination.value.rowsPerPage

  try {
    const params = {
      page,
      per_page: rowsPerPage,
      ...(filters.q         && { q:         filters.q }),
      ...(filters.status    && { status:    filters.status }),
      ...(filters.date_from && { date_from: filters.date_from }),
      ...(filters.date_to   && { date_to:   filters.date_to }),
    }
    const res  = await axios.get('/admin/orders', { params })
    const page_data = res?.data?.data ?? res?.data ?? {}

    orders.value = Array.isArray(page_data?.data) ? page_data.data : (Array.isArray(page_data) ? page_data : [])
    pagination.value = {
      page:        page_data?.current_page  ?? page,
      rowsPerPage: page_data?.per_page      ?? rowsPerPage,
      rowsNumber:  page_data?.total         ?? orders.value.length,
    }
    // Compute analytics from loaded page
    const all = orders.value
    analytics.value = {
      total:       page_data?.total ?? all.length,
      processing:  all.filter(o => o.status === 'processing').length,
      shipped:     all.filter(o => o.status === 'shipped').length,
      delivered:   all.filter(o => o.status === 'delivered').length,
      cancelled:   all.filter(o => o.status === 'cancelled').length,
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || 'Failed to load orders' })
  } finally {
    loading.value = false
  }
}

function onTableRequest(props) {
  pagination.value = props.pagination
  load(props)
}

// ── Edit / View ───────────────────────────────────────────────────────────────
function openEdit(row) {
  editOrder.value      = row
  editForm.status      = row.status
  editForm.tracking_id = row.tracking_id || ''
  editForm.notes       = row.notes       || ''
  editDialog.value     = true
}

function openView(row) {
  viewOrder.value  = row
  viewDialog.value = true
}

async function saveStatus() {
  saving.value = true
  try {
    await axios.patch(`/admin/orders/${editOrder.value.id}`, {
      status:      editForm.status,
      tracking_id: editForm.tracking_id || null,
      notes:       editForm.notes       || null,
    })
    $q.notify({ type: 'positive', message: 'Order updated successfully' })
    editDialog.value = false
    load()
  } catch (e) {
    $q.notify({ type: 'negative', message: e?.response?.data?.message || 'Failed to update order' })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

