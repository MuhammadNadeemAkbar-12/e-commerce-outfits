<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
onMounted(() => router.replace({ name: 'AdminCustomerOrders' }))
</script>
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'date', label: 'Date', field: row => new Date(row.createdAt).toLocaleDateString(), align: 'left' }
]

const sellerOrders = ref([])

const fetchSellerOrders = async () => {
  loading.value = true
  try {
    const response = await orderStore.fetchAdminOrders() // 👈 or use fetchSellerOrders() if exists
    console.log("Seller Orders API response:", response?.data?.data)

    if (response.success) {
      const ordersPage = response?.data?.data
      // ✅ Extract array from paginated object
      sellerOrders.value = Array.isArray(ordersPage?.data) ? ordersPage.data : []
    } else {
      console.error('Failed to fetch seller orders:', response.message)
      sellerOrders.value = []
    }
  } catch (error) {
    console.error('Error fetching seller orders:', error)
    sellerOrders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSellerOrders()
})
</script>
