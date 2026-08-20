<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h4 q-mb-xs">Seller Products</div>
        <div class="text-subtitle2 text-grey-7" v-if="sellerInfo">
          Products for: {{ sellerInfo.businessName || sellerInfo.name }}
        </div>
        <div class="text-subtitle2 text-grey-7" v-else>
          All Products from All Sellers
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn 
          @click="refreshProducts" 
          icon="refresh" 
          label="Refresh" 
          color="primary" 
          unelevated
          :loading="loading"
        />
        <q-btn 
          @click="goBackToSellers" 
          icon="arrow_back" 
          label="Back to Sellers" 
          color="primary" 
          unelevated
        />
      </div>
    </div>

    <!-- Analytics Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Total Products</div>
            <div class="text-h6 text-weight-bold text-primary">{{ productAnalytics.total }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Approved</div>
            <div class="text-h6 text-weight-bold text-positive">{{ productAnalytics.approved }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Pending</div>
            <div class="text-h6 text-weight-bold text-orange">{{ productAnalytics.pending }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Blocked</div>
            <div class="text-h6 text-weight-bold text-negative">{{ productAnalytics.blocked }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-sm-4 col-md-2">
        <q-card flat bordered>
          <q-card-section class="text-center q-pa-sm">
            <div class="text-caption text-grey-6">Out of Stock</div>
            <div class="text-h6 text-weight-bold text-grey-7">{{ productAnalytics.outOfStock }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedProducts.length > 0" class="row items-center q-mb-md q-pa-sm bg-blue-1 rounded-borders">
      <div class="col-auto q-mr-md">
        <span class="text-weight-medium">{{ selectedProducts.length }} product(s) selected</span>
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
            @click="blockSelected"
            label="Block Selected"
            color="negative"
            size="sm"
            unelevated
          />
          <q-btn
            @click="unblockSelected"
            label="Unblock Selected"
            color="positive"
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
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
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
    
    <q-card>
      <q-card-section>
        <q-table 
          :rows="filteredProducts" 
          :columns="columns" 
          row-key="id" 
          flat 
          bordered 
          :loading="loading"
          :pagination="{ rowsPerPage: 10, sortBy: 'id', descending: true }"
          selection="multiple"
          v-model:selected="selectedProducts"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <q-avatar size="48px">
                <img :src="resolveUrl(props.row.image) || 'https://cdn.quasar.dev/img/boy-avatar.png'" @error="e => e.target.src='https://cdn.quasar.dev/img/boy-avatar.png'" />
              </q-avatar>
            </q-td>
          </template>

          <template v-slot:body-cell-seller="props">
            <q-td :props="props">
              <div class="text-caption">{{ props.row.sellerName }}</div>
              <div class="text-grey-7 text-caption">{{ props.row.sellerEmail }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-price="props">
            <q-td :props="props">
              ${{ formatCurrency(props.row.price) }}
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.is_blocked ? 'negative' : props.row.is_approved ? 'positive' : 'orange'"
                class="text-capitalize q-px-sm q-py-xs"
              >
                {{ props.row.is_blocked ? 'Blocked' : props.row.is_approved ? 'Approved' : 'Pending' }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="q-gutter-x-sm">
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
                  @click="toggleBlockStatus(props.row)"
                  :label="props.row.is_blocked ? 'Unblock' : 'Block'"
                  :color="props.row.is_blocked ? 'positive' : 'negative'"
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
            <div class="full-width row flex-center q-pa-md text-grey-7">
              <q-icon name="inventory_2" size="md" />
              <span class="q-ml-sm" v-if="sellerId">No products found for this seller</span>
              <span class="q-ml-sm" v-else>No products found</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import adminApi from '@/services/adminApi'
import { resolveUrl } from '@/utils/imageUrl'

const $q = useQuasar()

const props = defineProps(['sellerId'])
const router = useRouter()
const route = useRoute()

// Get sellerId from props or route params
const sellerId = ref(props.sellerId || route.params.sellerId)

const columns = [
  { name: 'image', label: 'Image', field: 'image', align: 'center' },
  { name: 'name', label: 'Product Name', field: 'name', align: 'left', sortable: true },
  { name: 'seller', label: 'Seller', field: 'sellerName', align: 'left', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'left' },
  { name: 'price', label: 'Price', field: 'price', align: 'right', sortable: true },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center' }
]

const selectedProducts = ref([]) // Track selected products
const sellerProducts = ref([]) 
const sellerInfo = ref(null)
const loading = ref(false)

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
  { label: 'Rejected', value: 'rejected' },
  { label: 'Blocked', value: 'blocked' }
]

const approvalOptions = [
  { label: 'All Approval', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Not Approved', value: 'not_approved' }
]

// Computed property for filtered products
const filteredProducts = computed(() => {
  let filtered = sellerProducts.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.sellerName?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(product => product.status === statusFilter.value)
  }

  // Approval filter
  if (approvalFilter.value !== 'all') {
    if (approvalFilter.value === 'approved') {
      filtered = filtered.filter(product => product.is_approved)
    } else {
      filtered = filtered.filter(product => !product.is_approved)
    }
  }

  return filtered
})

const productAnalytics = computed(() => {
  const all = sellerProducts.value
  return {
    total:      all.length,
    approved:   all.filter(p => p.is_approved && !p.is_blocked).length,
    pending:    all.filter(p => !p.is_approved && !p.is_blocked).length,
    blocked:    all.filter(p => p.is_blocked).length,
    outOfStock: all.filter(p => (p.stock ?? 0) <= 0).length,
  }
})

// Refresh products method
const refreshProducts = () => {
  selectedProducts.value = []
  fetchProducts()
}

// ✅ Helper to extract products safely
const extractProducts = (response) => {
  if (!response || !response.success) {
    return []
  }
  
  if (Array.isArray(response.data)) {
    return response.data
  }
  
  if (Array.isArray(response.data?.data)) {
    return response.data.data
  }

  // Check if response.data.data.data is an array (pagination structure)
  if (Array.isArray(response.data?.data?.data)) {
    return response.data.data.data
  }

  // Check if response.data has a products array
  if (Array.isArray(response.data?.products)) {
    return response.data.products
  }

  // Check if response.data has an items array
  if (Array.isArray(response.data?.items)) {
    return response.data.items
  }

  // If no array found, try to extract any array from the response data
  if (response.data && typeof response.data === 'object') {
    for (const key in response.data) {
      if (Array.isArray(response.data[key])) {
        return response.data[key]
      }
    }
  }

  return []
}

  // ✅ Fetch products for one seller
  const fetchProductsForSeller = async (id) => {
    try {
      const response = await adminApi.getSellerProducts(id)

      const products = extractProducts(response)

      const processedProducts = products.map(product => {
        // Check for alternative status field names
        const status = product.status || product.product_status || 'pending';
        const is_approved = product.is_approved !== undefined ? product.is_approved : 
                           (status === 'approved' || status === 'active');
        const is_blocked = product.is_blocked !== undefined ? product.is_blocked : 
                          (status === 'blocked' || status === 'inactive');
        
        return {
          ...product,
          status,
          is_approved,
          is_blocked,
          sellerName: product.seller?.user?.name || product.seller?.company_name || 'Unknown Seller',
          sellerEmail: product.seller?.user?.email || '',
          category: product.category?.name || 'No Category'
        }
      })
      
      return processedProducts
    } catch (error) {
      return []
    }
  }

// ✅ Fetch products for all sellers
const fetchAllProducts = async () => {
  loading.value = true
  try {
    const sellersResponse = await adminApi.getAdminSellers()
    if (sellersResponse.success && sellersResponse.data) {
      const sellers = sellersResponse.data.data || sellersResponse.data
      const allProducts = []

      for (const seller of sellers) {
        const products = await fetchProductsForSeller(seller.seller_id || seller.id)
        allProducts.push(...products)
      }

      sellerProducts.value = allProducts
    } else {
      console.error('Failed to fetch sellers:', sellersResponse.message)
      sellerProducts.value = []
    }
  } catch (error) {
    console.error('Error fetching all products:', error)
    sellerProducts.value = []
  } finally {
    loading.value = false
  }
}

// ✅ Main fetch handler
const fetchProducts = async () => {
  if (sellerId.value) {
    loading.value = true
    try {
      const products = await fetchProductsForSeller(sellerId.value)
      sellerProducts.value = products

      // Get seller info from the first product if available
      if (products.length > 0 && products[0].seller) {
        sellerInfo.value = products[0].seller
      } else {
        // Fallback to API call if no seller data in products
        const sellerResponse = await adminApi.getSellerDetails(sellerId.value)
        sellerInfo.value = sellerResponse.success ? sellerResponse.data : null
      }
    } catch (error) {
      sellerProducts.value = []
    } finally {
      loading.value = false
    }
  } else {
    await fetchAllProducts()
  }
}

const goBackToSellers = () => {
  router.push({ name: 'ManageSellers' })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount || 0)
}

const getStatusColor = (status) => {
  const colors = {
    active: 'positive',
    inactive: 'grey',
    pending: 'orange',
    approved: 'positive',
    rejected: 'negative'
  }
  return colors[status?.toLowerCase()] || 'grey'
}

  // Product management methods
  const approveProduct = async (product) => {
    try {
      const response = await adminApi.approveProduct(product.id)
      
      if (response.success) {
        // Update local state
        const index = sellerProducts.value.findIndex(p => p.id === product.id)
        if (index !== -1) {
          sellerProducts.value[index].is_approved = true
          sellerProducts.value[index].status = 'approved'
        }
        $q.notify({
          type: 'positive',
          message: 'Product approved successfully',
          position: 'top'
        })
        
        // Force refresh after a short delay to see if the API returns the updated status
        setTimeout(() => {
          refreshProducts();
        }, 1000);
      } else {
        $q.notify({
          type: 'negative',
          message: response.message || 'Failed to approve product',
          position: 'top'
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to approve product',
        position: 'top'
      })
    }
  }

const rejectProduct = async (product) => {
  try {
    const response = await adminApi.rejectProduct(product.id)
    
    if (response.success) {
      // Update local state
      const index = sellerProducts.value.findIndex(p => p.id === product.id)
      if (index !== -1) {
        sellerProducts.value[index].is_approved = false
        sellerProducts.value[index].status = 'rejected'
      }
      $q.notify({
        type: 'positive',
        message: 'Product rejected successfully',
        position: 'top'
      })
      
      // Force refresh after a short delay to see if the API returns the updated status
      setTimeout(() => {
        refreshProducts();
      }, 1000);
    } else {
      $q.notify({
        type: 'negative',
        message: response.message || 'Failed to reject product',
        position: 'top'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to reject product',
      position: 'top'
    })
  }
}

const toggleBlockStatus = async (product) => {
  try {
    let response
    const wasBlocked = product.is_blocked // Store the original state
    
    if (wasBlocked) {
      response = await adminApi.unblockProduct(product.id)
    } else {
      response = await adminApi.blockProduct(product.id)
    }
    
    if (response.success) {
      // Update local state with the new status
      const index = sellerProducts.value.findIndex(p => p.id === product.id)
      if (index !== -1) {
        sellerProducts.value[index].is_blocked = !wasBlocked
        sellerProducts.value[index].status = wasBlocked ? 'active' : 'blocked'
      }
      $q.notify({
        type: 'positive',
        message: `Product ${wasBlocked ? 'unblocked' : 'blocked'} successfully`,
        position: 'top'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: response.message || `Failed to ${wasBlocked ? 'unblock' : 'block'} product`,
        position: 'top'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Failed to ${product.is_blocked ? 'unblock' : 'block'} product`,
      position: 'top'
    })
  }
}

const deleteProduct = async (product) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${product.name}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await adminApi.deleteProduct(product.id)
      if (response.success) {
        // Remove from local state
        sellerProducts.value = sellerProducts.value.filter(p => p.id !== product.id)
        $q.notify({
          type: 'positive',
          message: 'Product deleted successfully',
          position: 'top'
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.message || 'Failed to delete product',
          position: 'top'
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete product',
        position: 'top'
      })
    }
  })
}

// Bulk action methods
const approveSelected = async () => {
  if (selectedProducts.value.length === 0) return
  
  $q.dialog({
    title: 'Confirm Approval',
    message: `Are you sure you want to approve ${selectedProducts.value.length} product(s)?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const productIds = selectedProducts.value.map(p => p.id)
      const response = await adminApi.approveProductsBulk(productIds)
      
      if (response.success) {
        // Update local state
        selectedProducts.value.forEach(product => {
          const index = sellerProducts.value.findIndex(p => p.id === product.id)
          if (index !== -1) {
            sellerProducts.value[index].is_approved = true
            sellerProducts.value[index].status = 'approved'
          }
        })
        
        selectedProducts.value = []
        $q.notify({
          type: 'positive',
          message: `${productIds.length} product(s) approved successfully`,
          position: 'top'
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.message || 'Failed to approve products',
          position: 'top'
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to approve products',
        position: 'top'
      })
    }
  })
}

const rejectSelected = async () => {
  if (selectedProducts.value.length === 0) return
  
  $q.dialog({
    title: 'Confirm Rejection',
    message: `Are you sure you want to reject ${selectedProducts.value.length} product(s)?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const productIds = selectedProducts.value.map(p => p.id)
      const response = await adminApi.rejectProductsBulk(productIds)
      
      if (response.success) {
        // Update local state
        selectedProducts.value.forEach(product => {
          const index = sellerProducts.value.findIndex(p => p.id === product.id)
          if (index !== -1) {
            sellerProducts.value[index].is_approved = false
            sellerProducts.value[index].status = 'rejected'
          }
        })
        
        selectedProducts.value = []
        $q.notify({
          type: 'positive',
          message: `${productIds.length} product(s) rejected successfully`,
          position: 'top'
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.message || 'Failed to reject products',
          position: 'top'
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to reject products',
        position: 'top'
      })
    }
  })
}

const blockSelected = async () => {
  if (selectedProducts.value.length === 0) return
  
  $q.dialog({
    title: 'Confirm Block',
    message: `Are you sure you want to block ${selectedProducts.value.length} product(s)?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const productIds = selectedProducts.value.map(p => p.id)
      const response = await adminApi.blockProductsBulk(productIds)
      
      if (response.success) {
        // Update local state
        selectedProducts.value.forEach(product => {
          const index = sellerProducts.value.findIndex(p => p.id === product.id)
          if (index !== -1) {
            sellerProducts.value[index].is_blocked = true
            sellerProducts.value[index].status = 'blocked'
          }
        })
        
        selectedProducts.value = []
        $q.notify({
          type: 'positive',
          message: `${productIds.length} product(s) blocked successfully`,
          position: 'top'
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.message || 'Failed to block products',
          position: 'top'
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to block products',
        position: 'top'
      })
    }
  })
}

const unblockSelected = async () => {
  if (selectedProducts.value.length === 0) return
  
  $q.dialog({
    title: 'Confirm Unblock',
    message: `Are you sure you want to unblock ${selectedProducts.value.length} product(s)?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const productIds = selectedProducts.value.map(p => p.id)
      const response = await adminApi.unblockProductsBulk(productIds)
      
      if (response.success) {
        // Update local state
        selectedProducts.value.forEach(product => {
          const index = sellerProducts.value.findIndex(p => p.id === product.id)
          if (index !== -1) {
            sellerProducts.value[index].is_blocked = false
            sellerProducts.value[index].status = 'active'
          }
        })
        
        selectedProducts.value = []
        $q.notify({
          type: 'positive',
          message: `${productIds.length} product(s) unblocked successfully`,
          position: 'top'
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.message || 'Failed to unblock products',
          position: 'top'
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to unblock products',
        position: 'top'
      })
    }
  })
}

const deleteSelected = async () => {
  if (selectedProducts.value.length === 0) return
  
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete ${selectedProducts.value.length} product(s)?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const productIds = selectedProducts.value.map(p => p.id)
      const response = await adminApi.deleteProductsBulk(productIds)
      
      if (response.success) {
        // Remove from local state
        sellerProducts.value = sellerProducts.value.filter(p => !productIds.includes(p.id))
        selectedProducts.value = []
        $q.notify({
          type: 'positive',
          message: `${productIds.length} product(s) deleted successfully`,
          position: 'top'
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.message || 'Failed to delete products',
          position: 'top'
        })
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete products',
        position: 'top'
      })
    }
  })
}

const clearSelection = () => {
  selectedProducts.value = []
}

watch(() => props.sellerId, () => {
  fetchProducts()
})

onMounted(() => {
  fetchProducts()
})
</script>

