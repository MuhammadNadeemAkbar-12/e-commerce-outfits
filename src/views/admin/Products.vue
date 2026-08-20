<template>
  <div class="q-pa-md dark:bg-gray-900 transition-colors duration-300">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4 dark:text-white">All Products</div>
      <q-btn color="positive" icon="add" label="Add Product" unelevated @click="openCreateProduct" />
    </div>
    
    <!-- Bulk Actions -->
    <div v-if="selectedProducts.length > 0" class="row items-center q-mb-md q-pa-sm bg-blue-1 dark:bg-blue-900/30 rounded-borders">
      <div class="col-auto q-mr-md">
        <span class="text-weight-medium dark:text-white">{{ selectedProducts.length }} product(s) selected</span>
      </div>
      <div class="col">
        <div class="row q-gutter-sm">
          <q-btn
            @click="approveSelected"
            label="Approve Selected"
            color="positive"
            size="sm"
            unelevated
          />
          <q-btn
            @click="rejectSelected"
            label="Reject Selected"
            color="warning"
            size="sm"
            unelevated
          />
          <q-btn
            @click="deleteSelected"
            label="Delete Selected"
            color="negative"
            size="sm"
            unelevated
          />
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          @click="clearSelection"
          icon="clear"
          label="Clear Selection"
          color="grey"
          size="sm"
          flat
        />
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md dark:bg-gray-800 dark:border-gray-700">
      <q-card-section class="dark:bg-gray-800">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              placeholder="Search products..."
              dense
              outlined
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          
          <div class="col-12 col-md-4">
            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              label="Status"
              dense
              outlined
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="approvalFilter"
              :options="approvalOptions"
              label="Approval Status"
              dense
              outlined
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
    
    <q-card class="dark:bg-gray-800 dark:border-gray-700">
      <q-card-section class="dark:bg-gray-800">
        <!-- Debug info -->
        <div v-if="products.length > 0" class="q-mb-md text-caption text-grey-7 dark:text-gray-400">
          Loaded {{ products.length }} products
        </div>
        
        <q-table 
          :rows="filteredProducts" 
          :columns="columns" 
          row-key="id" 
          flat 
          bordered 
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
          selection="multiple"
          v-model:selected="selectedProducts"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <q-avatar size="48px">
                <img :src="getProductImage(props.row)" />
              </q-avatar>
            </q-td>
          </template>

          <template v-slot:body-cell-price="props">
            <q-td :props="props">
              ${{ formatCurrency(props.row.price) }}
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row)"
                text-color="white"
                size="sm"
              >
                {{ getStatusText(props.row) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-seller="props">
            <q-td :props="props">
              {{ props.row.seller?.user?.name || 'Unknown Seller' }}
            </q-td>
          </template>

          <template v-slot:body-cell-category="props">
            <q-td :props="props">
              {{ props.row.category?.name || 'No Category' }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="q-gutter-x-sm">
                <q-btn
                  @click="openEditProduct(props.row)"
                  icon="edit"
                  color="warning"
                  size="sm"
                  round
                  flat
                />
                <q-btn
                  v-if="!props.row.is_approved"
                  @click="approveProduct(props.row)"
                  label="Approve"
                  color="positive"
                  size="sm"
                  unelevated
                />
                <q-btn
                  v-if="props.row.is_approved"
                  @click="rejectProduct(props.row)"
                  label="Reject"
                  color="warning"
                  size="sm"
                  unelevated
                />
                <q-btn
                  @click="deleteProduct(props.row)"
                  icon="delete"
                  color="negative"
                  size="sm"
                  round
                  flat
                />
              </div>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey-7 dark:text-gray-400">
              <q-icon name="inventory_2" size="md" />
              <span class="q-ml-sm">No products found</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :type="confirmConfig.type"
      :confirm-label="confirmConfig.confirmLabel"
      :loading="confirmLoading"
      @confirm="handleConfirm"
    />

    <q-dialog v-model="showProductForm" persistent>
      <q-card style="min-width: 620px" class="dark:bg-gray-800 dark:border-gray-700">
        <q-card-section>
          <div class="text-h6 dark:text-white">{{ productFormMode === 'create' ? 'Add Product' : 'Edit Product' }}</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select v-model="productForm.seller_id" :options="sellerOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="Seller" />
            </div>
            <div class="col-12 col-md-6">
              <q-select v-model="productForm.category_id" :options="categoryOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="Category" />
            </div>
            <div class="col-12 col-md-6"><q-input v-model="productForm.name" dense outlined label="Product Name" /></div>
            <div class="col-12 col-md-6"><q-input v-model="productForm.sku" dense outlined label="SKU" /></div>
            <div class="col-12"><q-input v-model="productForm.description" dense outlined label="Description" type="textarea" autogrow /></div>
            <div class="col-12 col-md-4"><q-input v-model.number="productForm.price" dense outlined type="number" label="Price" /></div>
            <div class="col-12 col-md-4"><q-input v-model.number="productForm.stock" dense outlined type="number" label="Stock" /></div>
            <div class="col-12 col-md-4"><q-input v-model.number="productForm.reorder_level" dense outlined type="number" label="Reorder Level" /></div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn :loading="productFormLoading" unelevated color="primary" :label="productFormMode === 'create' ? 'Create' : 'Update'" @click="submitProductForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import adminApi from '@/services/adminApi'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import { resolveUrl } from '@/utils/imageUrl'

const $q = useQuasar()

const columns = [
  { name: 'image', label: 'Image', field: 'image', align: 'center' },
  { name: 'name', label: 'Product Name', field: 'name', align: 'left', sortable: true },
  { name: 'seller', label: 'Seller', field: 'seller', align: 'left', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'left' },
  { name: 'price', label: 'Price', field: 'price', align: 'right', sortable: true },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const selectedProducts = ref([])
const products = ref([]) 
const loading = ref(false)

// Confirm dialog state
const showConfirmDialog = ref(false)
const confirmLoading = ref(false)
const confirmConfig = ref({ title: '', message: '', type: 'danger', confirmLabel: 'Confirm', onConfirm: null })
const showProductForm = ref(false)
const productFormLoading = ref(false)
const productFormMode = ref('create')
const productFormId = ref(null)
const sellerOptions = ref([])
const categoryOptions = ref([])
const productForm = ref({
  seller_id: null,
  category_id: null,
  name: '',
  sku: '',
  description: '',
  price: 0,
  stock: 0,
  reorder_level: 0,
})

// Filter and search variables
const searchQuery = ref('')
const statusFilter = ref('all')
const approvalFilter = ref('all')

// Filter options
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
]

const approvalOptions = [
  { label: 'All Approval', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Not Approved', value: 'not_approved' }
]

// Computed property for filtered products
const filteredProducts = computed(() => {
  // Ensure we always work with an array
  let filtered = Array.isArray(products.value) ? [...products.value] : []

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product => 
      product?.name?.toLowerCase().includes(query) ||
      product?.category?.name?.toLowerCase().includes(query) ||
      product?.seller?.user?.name?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(product => {
      const status = getStatusText(product)
      return status.toLowerCase() === statusFilter.value.toLowerCase()
    })
  }

  // Approval filter
  if (approvalFilter.value !== 'all') {
    if (approvalFilter.value === 'approved') {
      filtered = filtered.filter(product => product?.is_approved)
    } else {
      filtered = filtered.filter(product => !product?.is_approved)
    }
  }

  return filtered
})

// Fetch products
const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await adminApi.getAllProducts()
    if (response.success) {
      // Extract the products array from the paginated response
      products.value = response.data?.data?.data || []
    } else {
      products.value = []
      $q.notify({
        type: 'negative',
        message: response.message || 'Failed to fetch products',
        position: 'top'
      })
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    products.value = []
    $q.notify({
      type: 'negative',
      message: 'Failed to fetch products',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const fetchFormOptions = async () => {
  const [sellersRes, categoriesRes] = await Promise.all([
    adminApi.getAdminSellers(),
    adminApi.getSellerCategories(),
  ])

  const sellers = sellersRes?.data?.data || []
  const categories = categoriesRes?.data?.data || []

  sellerOptions.value = sellers.map(s => ({ value: s.seller_id, label: s.name || s.email || `Seller #${s.seller_id}` }))
  categoryOptions.value = categories.map(c => ({ value: c.id, label: c.name }))
}

const resetProductForm = () => {
  productForm.value = {
    seller_id: null,
    category_id: null,
    name: '',
    sku: '',
    description: '',
    price: 0,
    stock: 0,
    reorder_level: 0,
  }
}

const openCreateProduct = async () => {
  productFormMode.value = 'create'
  productFormId.value = null
  resetProductForm()
  await fetchFormOptions()
  showProductForm.value = true
}

const openEditProduct = async (product) => {
  productFormMode.value = 'edit'
  productFormId.value = product.id
  productForm.value = {
    seller_id: product.seller_id || product.seller?.id || null,
    category_id: product.category_id || product.category?.id || null,
    name: product.name || '',
    sku: product.sku || '',
    description: product.description || '',
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    reorder_level: Number(product.reorder_level || 0),
  }
  await fetchFormOptions()
  showProductForm.value = true
}

const submitProductForm = async () => {
  productFormLoading.value = true
  try {
    const payload = { ...productForm.value }
    const response = productFormMode.value === 'create'
      ? await adminApi.createAdminProduct(payload)
      : await adminApi.updateAdminProduct(productFormId.value, payload)

    if (!response.success || response.data?.success === false) {
      throw new Error(response.message || response.data?.message || 'Save failed')
    }

    $q.notify({ type: 'positive', message: productFormMode.value === 'create' ? 'Product created successfully' : 'Product updated successfully', position: 'top' })
    showProductForm.value = false
    await fetchProducts()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message || 'Failed to save product', position: 'top' })
  } finally {
    productFormLoading.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount || 0)
}

const getProductImage = (product) => {
  const raw = product.images?.[0]?.url || product.image || ''
  return resolveUrl(raw) || 'https://cdn.quasar.dev/img/boy-avatar.png'
}

const getStatusColor = (product) => {
  if (product.is_blocked) return 'negative'
  if (product.is_approved) return 'positive'
  return 'orange'
}

const getStatusText = (product) => {
  if (product.is_blocked) return 'Blocked'
  if (product.is_approved) return 'Approved'
  return 'Pending'
}

const approveProduct = (product) => {
  confirmConfig.value = {
    title: 'Approve Product',
    message: `Approve "${product.name}"? It will be visible to customers.`,
    type: 'success',
    confirmLabel: 'Approve',
    onConfirm: async () => {
      const response = await adminApi.approveProduct(product.id)
      if (response.success) {
        $q.notify({ type: 'positive', message: 'Product approved successfully', position: 'top' })
        fetchProducts()
      } else {
        $q.notify({ type: 'negative', message: response.message || 'Failed to approve product', position: 'top' })
      }
    }
  }
  showConfirmDialog.value = true
}

const rejectProduct = (product) => {
  confirmConfig.value = {
    title: 'Reject Product',
    message: `Reject "${product.name}"? It will be hidden from customers.`,
    type: 'warning',
    confirmLabel: 'Reject',
    onConfirm: async () => {
      const response = await adminApi.rejectProduct(product.id)
      if (response.success) {
        $q.notify({ type: 'positive', message: 'Product rejected successfully', position: 'top' })
        fetchProducts()
      } else {
        $q.notify({ type: 'negative', message: response.message || 'Failed to reject product', position: 'top' })
      }
    }
  }
  showConfirmDialog.value = true
}

const deleteProduct = (product) => {
  confirmConfig.value = {
    title: 'Delete Product',
    message: `Permanently delete "${product.name}"? This cannot be undone.`,
    type: 'danger',
    confirmLabel: 'Delete',
    onConfirm: async () => {
      const response = await adminApi.deleteProduct(product.id)
      if (response.success) {
        $q.notify({ type: 'positive', message: 'Product deleted successfully', position: 'top' })
        fetchProducts()
      } else {
        $q.notify({ type: 'negative', message: response.message || 'Failed to delete product', position: 'top' })
      }
    }
  }
  showConfirmDialog.value = true
}

const approveSelected = () => {
  if (selectedProducts.value.length === 0) return
  confirmConfig.value = {
    title: 'Approve Selected',
    message: `Approve ${selectedProducts.value.length} product(s)? They will be visible to customers.`,
    type: 'success',
    confirmLabel: 'Approve All',
    onConfirm: async () => {
      const productIds = selectedProducts.value.map(p => p.id)
      const response = await adminApi.approveProductsBulk(productIds)
      if (response.success) {
        $q.notify({ type: 'positive', message: `${productIds.length} product(s) approved successfully`, position: 'top' })
        selectedProducts.value = []
        fetchProducts()
      } else {
        $q.notify({ type: 'negative', message: response.message || 'Failed to approve products', position: 'top' })
      }
    }
  }
  showConfirmDialog.value = true
}

const rejectSelected = () => {
  if (selectedProducts.value.length === 0) return
  confirmConfig.value = {
    title: 'Reject Selected',
    message: `Reject ${selectedProducts.value.length} product(s)? They will be hidden from customers.`,
    type: 'warning',
    confirmLabel: 'Reject All',
    onConfirm: async () => {
      const productIds = selectedProducts.value.map(p => p.id)
      const response = await adminApi.rejectProductsBulk(productIds)
      if (response.success) {
        $q.notify({ type: 'positive', message: `${productIds.length} product(s) rejected successfully`, position: 'top' })
        selectedProducts.value = []
        fetchProducts()
      } else {
        $q.notify({ type: 'negative', message: response.message || 'Failed to reject products', position: 'top' })
      }
    }
  }
  showConfirmDialog.value = true
}

const deleteSelected = () => {
  if (selectedProducts.value.length === 0) return
  confirmConfig.value = {
    title: 'Delete Selected',
    message: `Permanently delete ${selectedProducts.value.length} product(s)? This cannot be undone.`,
    type: 'danger',
    confirmLabel: 'Delete All',
    onConfirm: async () => {
      const productIds = selectedProducts.value.map(p => p.id)
      const response = await adminApi.deleteProductsBulk(productIds)
      if (response.success) {
        $q.notify({ type: 'positive', message: `${productIds.length} product(s) deleted successfully`, position: 'top' })
        selectedProducts.value = []
        fetchProducts()
      } else {
        $q.notify({ type: 'negative', message: response.message || 'Failed to delete products', position: 'top' })
      }
    }
  }
  showConfirmDialog.value = true
}

const handleConfirm = async () => {
  if (!confirmConfig.value.onConfirm) return
  confirmLoading.value = true
  try {
    await confirmConfig.value.onConfirm()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message || 'Action failed', position: 'top' })
  } finally {
    confirmLoading.value = false
    showConfirmDialog.value = false
  }
}

const clearSelection = () => {
  selectedProducts.value = []
}

onMounted(() => {
  fetchProducts()
})
</script>
