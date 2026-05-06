<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
onMounted(() => router.replace({ name: 'SellerProductsList' }))
</script>
          <template v-slot:body-cell-image="props">
            <q-td :props="props">
              <q-avatar>
                <img :src="props.row.image || 'https://via.placeholder.com/50'" />
              </q-avatar>
            </q-td>
          </template>
          
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat round color="positive" icon="check" @click="approveProduct(props.row)" />
              <q-btn flat round color="negative" icon="close" @click="rejectProduct(props.row)" />
              <q-btn flat round color="primary" icon="visibility" @click="viewProduct(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      :title="pendingAction === 'approve' ? 'Approve Product' : 'Reject Product'"
      :message="pendingProduct ? (pendingAction === 'approve' ? `Approve &quot;${pendingProduct.name}&quot;? It will be visible to customers.` : `Reject &quot;${pendingProduct.name}&quot;? It will not be listed.`) : ''"
      :type="pendingAction === 'approve' ? 'success' : 'warning'"
      :confirm-label="pendingAction === 'approve' ? 'Approve' : 'Reject'"
      :loading="confirmLoading"
      @confirm="executeConfirmedAction"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import adminApi from '@/services/adminApi'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'

const $q = useQuasar()

const columns = [
  { name: 'image', label: 'Image', field: 'image', align: 'center' },
  { name: 'name', label: 'Product Name', field: 'name', align: 'left' },
  { name: 'seller', label: 'Seller', field: 'seller', align: 'left' },
  { name: 'category', label: 'Category', field: 'category', align: 'left' },
  { name: 'price', label: 'Price', field: 'price', align: 'right' },
  { name: 'submitted', label: 'Submitted', field: 'submitted', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const pendingProducts = ref([])
const loading = ref(false)

// Confirm dialog state
const showConfirmDialog = ref(false)
const confirmLoading = ref(false)
const pendingAction = ref(null)  // 'approve' | 'reject'
const pendingProduct = ref(null)

const fetchPendingProducts = async () => {
  loading.value = true
  try {
    const response = await adminApi.getPendingProducts()
    if (response.success) {
      pendingProducts.value = response.data || []
    } else {
      pendingProducts.value = []
    }
  } catch (error) {
    pendingProducts.value = []
  } finally {
    loading.value = false
  }
}

const approveProduct = (product) => {
  pendingProduct.value = product
  pendingAction.value = 'approve'
  showConfirmDialog.value = true
}

const rejectProduct = (product) => {
  pendingProduct.value = product
  pendingAction.value = 'reject'
  showConfirmDialog.value = true
}

const executeConfirmedAction = async () => {
  const product = pendingProduct.value
  const action = pendingAction.value
  if (!product || !action) return
  confirmLoading.value = true
  try {
    let response
    if (action === 'approve') {
      response = await adminApi.approveProduct(product.id)
      if (response.success) {
        $q.notify({ type: 'positive', message: 'Product approved successfully', position: 'top' })
        pendingProducts.value = pendingProducts.value.filter(p => p.id !== product.id)
      } else {
        $q.notify({ type: 'negative', message: response.message || 'Failed to approve product', position: 'top' })
      }
    } else {
      response = await adminApi.rejectProduct(product.id)
      if (response.success) {
        $q.notify({ type: 'positive', message: 'Product rejected successfully', position: 'top' })
        pendingProducts.value = pendingProducts.value.filter(p => p.id !== product.id)
      } else {
        $q.notify({ type: 'negative', message: response.message || 'Failed to reject product', position: 'top' })
      }
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message || 'Action failed', position: 'top' })
  } finally {
    confirmLoading.value = false
    showConfirmDialog.value = false
    pendingProduct.value = null
    pendingAction.value = null
  }
}

const viewProduct = (product) => {
  console.log('View product:', product)
}

onMounted(() => {
  fetchPendingProducts()
})
</script>
