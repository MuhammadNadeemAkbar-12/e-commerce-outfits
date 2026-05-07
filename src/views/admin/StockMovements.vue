<template>
  <div class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold dark:text-white">Stock Movements</div>
        <div class="text-caption text-grey-6 dark:text-grey-4">All stock in / out / adjustment events</div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6 col-sm-3">
        <q-card flat bordered class="dark:bg-gray-800">
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Total Events</div>
            <div class="text-h6 text-weight-bold text-primary">{{ movements.length }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered class="dark:bg-gray-800">
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Stock In</div>
            <div class="text-h6 text-weight-bold text-positive">{{ kpi.in }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered class="dark:bg-gray-800">
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Stock Out</div>
            <div class="text-h6 text-weight-bold text-negative">{{ kpi.out }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-3">
        <q-card flat bordered class="dark:bg-gray-800">
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Adjustments</div>
            <div class="text-h6 text-weight-bold text-warning">{{ kpi.adj }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md dark:bg-gray-800">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-4 col-md-3">
            <q-select v-model="filters.movement_type" :options="typeOpts" label="Type" dense outlined emit-value map-options @update:model-value="fetch" />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-input v-model="filters.from_date" type="date" label="From" dense outlined @update:model-value="fetch" />
          </div>
          <div class="col-6 col-sm-3 col-md-2">
            <q-input v-model="filters.to_date" type="date" label="To" dense outlined @update:model-value="fetch" />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn flat icon="restart_alt" label="Reset" @click="resetFilters" dense />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-card flat bordered class="dark:bg-gray-800">
      <q-table
        :rows="movements"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 20 }"
        flat bordered
      >
        <template v-slot:loading><q-inner-loading showing color="primary" /></template>

        <template v-slot:body-cell-product="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.product?.name || '—' }}</div>
            <div class="text-caption text-grey-6">SKU: {{ props.row.product?.sku || '—' }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-badge :color="typeBadge(props.row.movement_type)" class="text-capitalize q-px-sm q-py-xs">
              {{ props.row.movement_type }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-qty="props">
          <q-td :props="props" class="text-center">
            <span :class="props.row.quantity > 0 ? 'text-positive' : 'text-negative'" class="text-weight-bold">
              {{ props.row.quantity > 0 ? '+' : '' }}{{ props.row.quantity }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-before="props">
          <q-td :props="props" class="text-center text-grey-7">{{ props.row.stock_before ?? '—' }}</q-td>
        </template>

        <template v-slot:body-cell-after="props">
          <q-td :props="props" class="text-center text-weight-medium">{{ props.row.stock_after ?? '—' }}</q-td>
        </template>

        <template v-slot:body-cell-reference="props">
          <q-td :props="props">
            <span v-if="props.row.reference_type" class="text-caption text-capitalize">
              {{ props.row.reference_type }} #{{ props.row.reference_id }}
            </span>
            <span v-else class="text-grey-4">—</span>
          </q-td>
        </template>

        <template v-slot:body-cell-by="props">
          <q-td :props="props">
            <div class="text-weight-medium text-sm">{{ props.row.creator?.name || '—' }}</div>
            <div class="text-caption text-grey-6">{{ formatDate(props.row.created_at) }}</div>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-lg text-grey-6">
            <q-icon name="inventory" size="md" class="q-mr-sm" />No stock movements found
          </div>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import stockLedgerApi from '@/services/stockLedgerApi'

const movements = ref([])
const loading = ref(false)
const filters = ref({ movement_type: '', from_date: '', to_date: '' })

const typeOpts = [
  { label: 'All Types', value: '' },
  { label: 'Stock In', value: 'in' },
  { label: 'Stock Out', value: 'out' },
  { label: 'Return', value: 'return' },
  { label: 'Adjustment', value: 'adjustment' },
]

const columns = [
  { name: 'product', label: 'Product', field: 'product', align: 'left' },
  { name: 'type', label: 'Type', field: 'movement_type', align: 'left' },
  { name: 'qty', label: 'Qty', field: 'quantity', align: 'center' },
  { name: 'before', label: 'Before', field: 'stock_before', align: 'center' },
  { name: 'after', label: 'After', field: 'stock_after', align: 'center' },
  { name: 'reference', label: 'Reference', field: 'reference_type', align: 'left' },
  { name: 'notes', label: 'Notes', field: 'notes', align: 'left' },
  { name: 'by', label: 'By / Date', field: 'created_at', align: 'left' },
]

const kpi = computed(() => ({
  in: movements.value.filter(m => m.movement_type === 'in').length,
  out: movements.value.filter(m => m.movement_type === 'out').length,
  adj: movements.value.filter(m => m.movement_type === 'adjustment').length,
}))

async function fetch() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.movement_type) params.movement_type = filters.value.movement_type
    if (filters.value.from_date) params.from_date = filters.value.from_date
    if (filters.value.to_date) params.to_date = filters.value.to_date
    params.per_page = 500
    const res = await stockLedgerApi.getMovements(params)
    const d = res.data?.data ?? res.data
    movements.value = Array.isArray(d) ? d : (d?.data ?? [])
  } catch {
    movements.value = []
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filters.value = { movement_type: '', from_date: '', to_date: '' }
  fetch()
}

function typeBadge(t) {
  return t === 'in' ? 'positive' : t === 'out' ? 'negative' : t === 'return' ? 'info' : 'warning'
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(fetch)
</script>
