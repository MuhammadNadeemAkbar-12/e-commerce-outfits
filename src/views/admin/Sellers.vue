<template>
  <q-page class="q-pa-md body--dark transition-colors duration-300">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h1 class="text-h4 text-weight-bold  dark:text-white">Seller Management</h1>
        <p class="text-subtitle2 text-grey-7 dark:text-gray-400">Manage and monitor all platform sellers</p>
      </div>
      <div class="row q-gutter-sm">
        <q-btn 
          @click="openCreateSeller" 
          icon="add_business" 
          label="Add Seller" 
          color="positive" 
          unelevated
          class="hover:scale-105 transition-transform duration-200"
        />
        <q-btn 
          @click="refreshSellers" 
          icon="refresh" 
          label="Refresh" 
          color="primary" 
          unelevated
          :loading="loading"
          class="hover:scale-105 transition-transform duration-200"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-card flat bordered class="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <q-card-section>
            <div class="row items-center">
              <q-avatar color="blue-1" text-color="primary" icon="store" class="dark:bg-blue-900 dark:text-blue-200" />
              <div class="q-ml-md">
                <div class="text-h6 text-weight-bold dark:text-white">{{ totalSellers }}</div>
                <div class="text-caption text-grey-7 dark:text-gray-400">Total Sellers</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <q-card-section>
            <div class="row items-center">
              <q-avatar color="green-1" text-color="positive" icon="verified" class="dark:bg-green-900 dark:text-green-200" />
              <div class="q-ml-md">
                <div class="text-h6 text-weight-bold dark:text-white">{{ verifiedSellers }}</div>
                <div class="text-caption text-grey-7 dark:text-gray-400">Verified Sellers</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <q-card-section>
            <div class="row items-center">
              <q-avatar color="orange-1" text-color="orange" icon="pending" class="dark:bg-orange-900 dark:text-orange-200" />
              <div class="q-ml-md">
                <div class="text-h6 text-weight-bold dark:text-white">{{ pendingSellers }}</div>
                <div class="text-caption text-grey-7 dark:text-gray-400">Pending Approval</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card flat bordered class="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <q-card-section>
            <div class="row items-center">
              <q-avatar color="red-1" text-color="negative" icon="block" class="dark:bg-red-900 dark:text-red-200" />
              <div class="q-ml-md">
                <div class="text-h6 text-weight-bold dark:text-white">{{ suspendedSellers }}</div>
                <div class="text-caption text-grey-7 dark:text-gray-400">Suspended</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md dark:bg-gray-800 dark:border-gray-700">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="searchQuery"
              placeholder="Search sellers..."
              dense
              outlined
              clearable
              class="dark:bg-gray-700 dark:text-white"
            >
              <template v-slot:prepend>
                <q-icon name="search" class="dark:text-gray-300" />
              </template>
            </q-input>
          </div>
          
          <div class="col-12 col-md-3">
            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              label="Status"
              dense
              outlined
              emit-value
              map-options
              class="dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="businessTypeFilter"
              :options="businessTypeOptions"
              label="Business Type"
              dense
              outlined
              emit-value
              map-options
              class="dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="sortBy"
              :options="sortOptions"
              label="Sort By"
              dense
              outlined
              emit-value
              map-options
              class="dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Sellers Table -->
    <q-card flat bordered class="dark:bg-gray-800 dark:border-gray-700">
      <q-card-section>
        <q-table
          :rows="paginatedSellers"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :filter="searchQuery"
          :pagination="pagination"
          flat
          bordered
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <template v-slot:body-cell-avatar="props">
            <q-td :props="props">
              <div class="row items-center no-wrap q-gutter-x-sm">
                <q-avatar size="38px" class="shadow-sm">
                  <img
                    :src="normalizeAvatarUrl(props.row.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(props.row.name || 'S')}&background=6366f1&color=fff&size=80`"
                    :alt="props.row.name"
                    @error="(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(props.row.name || 'S')}&background=6366f1&color=fff&size=80`"
                  />
                </q-avatar>
                <div>
                  <div class="text-weight-medium text-sm dark:text-white" style="white-space:nowrap">{{ props.row.name }}</div>
                  <div class="text-caption text-grey-6" style="white-space:nowrap">{{ props.row.businessName !== props.row.name ? props.row.businessName : '' }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <span :class="[
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold gap-1',
                props.row.status === 'verified'  ? 'status-verified'  :
                props.row.status === 'suspended' ? 'status-suspended' :
                props.row.status === 'rejected'  ? 'status-rejected'  :
                'status-pending'
              ]">
                <span class="w-1.5 h-1.5 rounded-full inline-block" :class="[
                  props.row.status === 'verified'  ? 'bg-green-500'  :
                  props.row.status === 'suspended' ? 'bg-red-500'    :
                  props.row.status === 'rejected'  ? 'bg-gray-500'   :
                  'bg-amber-500'
                ]"></span>
                {{ props.row.status }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-revenue="props">
            <q-td :props="props">
              ${{ formatCurrency(props.row.revenue || 0) }}
            </q-td>
          </template>

          <template v-slot:body-cell-createdAt="props">
            <q-td :props="props">
              <span class="text-sm text-grey-8 dark:text-gray-300">{{ formatDate(props.row.createdAt) }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn icon="more_horiz" flat round dense color="grey-7">
                <q-menu anchor="bottom right" self="top right" class="shadow-lg rounded-xl" style="min-width:170px">
                  <q-list dense padding>
                    <!-- View Profile -->
                    <q-item clickable v-close-popup @click="viewSellerDetails(props.row)" class="rounded-lg">
                      <q-item-section avatar>
                        <q-icon name="visibility" color="blue-6" size="18px" />
                      </q-item-section>
                      <q-item-section class="text-sm text-grey-9">View Profile</q-item-section>
                    </q-item>

                    <!-- View Products -->
                    <q-item clickable v-close-popup @click="viewSellerProducts(props.row)" class="rounded-lg">
                      <q-item-section avatar>
                        <q-icon name="inventory_2" color="indigo-5" size="18px" />
                      </q-item-section>
                      <q-item-section class="text-sm text-grey-9">Products</q-item-section>
                    </q-item>

                    <q-separator spaced />

                    <q-item clickable v-close-popup @click="openEditSeller(props.row)" class="rounded-lg">
                      <q-item-section avatar>
                        <q-icon name="edit" color="warning" size="18px" />
                      </q-item-section>
                      <q-item-section class="text-sm text-warning font-medium">Edit</q-item-section>
                    </q-item>

                    <!-- Approve (only if not yet approved) -->
                    <q-item v-if="!props.row.is_approved" clickable v-close-popup @click="approveSeller(props.row)" class="rounded-lg">
                      <q-item-section avatar>
                        <q-icon name="check_circle" color="positive" size="18px" />
                      </q-item-section>
                      <q-item-section class="text-sm text-positive font-medium">Approve</q-item-section>
                    </q-item>

                    <!-- Decline / Unapprove (only if approved) -->
                    <q-item v-if="props.row.is_approved" clickable v-close-popup @click="unapproveSeller(props.row)" class="rounded-lg">
                      <q-item-section avatar>
                        <q-icon name="cancel" color="negative" size="18px" />
                      </q-item-section>
                      <q-item-section class="text-sm text-negative font-medium">Decline</q-item-section>
                    </q-item>

                    <!-- Block / Unblock (only if approved) -->
                    <q-item v-if="props.row.is_approved" clickable v-close-popup @click="toggleBlockStatus(props.row)" class="rounded-lg">
                      <q-item-section avatar>
                        <q-icon :name="props.row.is_blocked ? 'lock_open' : 'block'" :color="props.row.is_blocked ? 'positive' : 'warning'" size="18px" />
                      </q-item-section>
                      <q-item-section :class="['text-sm font-medium', props.row.is_blocked ? 'text-positive' : 'text-warning']">
                        {{ props.row.is_blocked ? 'Unblock' : 'Suspend' }}
                      </q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="askDeleteSeller(props.row)" class="rounded-lg">
                      <q-item-section avatar>
                        <q-icon name="delete" color="negative" size="18px" />
                      </q-item-section>
                      <q-item-section class="text-sm text-negative font-medium">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md">
              <q-icon name="warning" size="md" color="warning" />
              <span class="q-ml-sm">No sellers found</span>
            </div>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="between">
        <div class="text-caption text-grey-7 dark:text-gray-400">
          Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredSellers.length) }} of {{ filteredSellers.length }} results
        </div>
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="5"
          direction-links
          boundary-links
          @update:model-value="onPageChange"
          class="dark:text-white"
        />
      </q-card-actions>
    </q-card>

    <!-- Confirmation Dialog -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      :title="pendingAction === 'approve' ? 'Approve Seller' : pendingAction === 'unapprove' ? 'Unapprove Seller' : pendingAction === 'block' ? 'Block Seller' : pendingAction === 'delete' ? 'Delete Seller' : 'Unblock Seller'"
      :message="pendingAction === 'approve' ? 'Approve this seller? They will be able to list products.' : pendingAction === 'unapprove' ? 'Unapprove this seller? Their products will be hidden.' : pendingAction === 'block' ? 'Block this seller? They will not be able to access the platform.' : pendingAction === 'delete' ? 'Delete this seller account permanently?' : 'Unblock this seller? They will regain access to the platform.'"
      :type="pendingAction === 'approve' || pendingAction === 'unblock' ? 'success' : pendingAction === 'unapprove' ? 'warning' : 'danger'"
      :confirm-label="pendingAction === 'approve' ? 'Approve' : pendingAction === 'unapprove' ? 'Unapprove' : pendingAction === 'block' ? 'Block' : pendingAction === 'delete' ? 'Delete' : 'Unblock'"
      :loading="confirmLoading"
      @confirm="executeConfirmedAction"
    />

    <q-dialog v-model="showSellerForm" persistent>
      <q-card style="min-width: 560px" class="dark:bg-gray-800 dark:border-gray-700">
        <q-card-section>
          <div class="text-h6 dark:text-white">{{ sellerFormMode === 'create' ? 'Add Seller' : 'Edit Seller' }}</div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Avatar Upload -->
            <div class="col-12 flex flex-center">
              <div class="column items-center q-gutter-xs">
                <q-avatar size="80px" class="border-2 border-gray-300">
                  <img :src="sellerFormAvatarPreview || 'https://cdn.quasar.dev/img/boy-avatar.png'" />
                </q-avatar>
                <q-btn flat dense size="sm" color="primary" icon="photo_camera" label="Choose Avatar"
                  @click="$refs.sellerAvatarInput.click()" />
                <input ref="sellerAvatarInput" type="file" accept="image/*" style="display:none"
                  @change="onSellerAvatarSelected" />
              </div>
            </div>
            <div class="col-12 col-md-6"><q-input v-model="sellerForm.name" label="Name" dense outlined /></div>
            <div class="col-12 col-md-6"><q-input v-model="sellerForm.email" label="Email" type="email" dense outlined /></div>
            <div class="col-12 col-md-6"><q-input v-model="sellerForm.password" :label="sellerFormMode === 'create' ? 'Password' : 'Password (optional)'" type="password" dense outlined /></div>
            <div class="col-12 col-md-6"><q-input v-model="sellerForm.company_name" label="Company Name" dense outlined /></div>
            <div class="col-12 col-md-6"><q-input v-model="sellerForm.phone" label="Phone" dense outlined /></div>
            <div class="col-12"><q-input v-model="sellerForm.address" label="Address" dense outlined /></div>
            <div class="col-12 col-md-4"><q-input v-model="sellerForm.city" label="City" dense outlined /></div>
            <div class="col-12 col-md-4"><q-input v-model="sellerForm.state" label="State" dense outlined /></div>
            <div class="col-12 col-md-4"><q-input v-model="sellerForm.postal_code" label="Postal Code" dense outlined /></div>
            <div class="col-12"><q-input v-model="sellerForm.country" label="Country" dense outlined /></div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn :loading="sellerFormLoading" unelevated color="primary" :label="sellerFormMode === 'create' ? 'Create' : 'Update'" @click="submitSellerForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Seller Details Dialog -->
    <q-dialog v-model="showSellerDetails" persistent>
      <q-card style="min-width: 500px" class="dark:bg-gray-800 dark:border-gray-700">
        <q-card-section>
          <div class="text-h6 dark:text-white">Seller Details</div>
        </q-card-section>

        <q-card-section v-if="selectedSeller">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-avatar size="100px" class="q-mx-auto block">
                <img :src="normalizeAvatarUrl(selectedSeller.avatar) || 'https://cdn.quasar.dev/img/boy-avatar.png'" @error="(e) => e.target.src = 'https://cdn.quasar.dev/img/boy-avatar.png'" />
              </q-avatar>
            </div>
            <div class="col-12">
              <div class="text-h6 text-center dark:text-white">{{ selectedSeller.businessName }}</div>
              <div class="text-subtitle2 text-center text-grey-7 dark:text-gray-400">{{ selectedSeller.email }}</div>
            </div>
            <div class="col-12">
              <q-list dense class="dark:bg-gray-700">
                <q-item class="dark:bg-gray-700">
                  <q-item-section>
                    <q-item-label caption class="dark:text-gray-300">Business Name</q-item-label>
                    <q-item-label class="dark:text-white">{{ selectedSeller.businessName }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item class="dark:bg-gray-700">
                  <q-item-section>
                    <q-item-label caption class="dark:text-gray-300">Email</q-item-label>
                    <q-item-label class="dark:text-white">{{ selectedSeller.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item class="dark:bg-gray-700">
                  <q-item-section>
                    <q-item-label caption class="dark:text-gray-300">Phone</q-item-label>
                    <q-item-label class="dark:text-white">{{ selectedSeller.phone || 'N/A' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item class="dark:bg-gray-700">
                  <q-item-section>
                    <q-item-label caption class="dark:text-gray-300">Business Type</q-item-label>
                    <q-item-label class="dark:text-white">{{ selectedSeller.businessType || 'N/A' }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item class="dark:bg-gray-700">
                  <q-item-section>
                    <q-item-label caption class="dark:text-gray-300">Status</q-item-label>
                    <q-item-label>
                      <span :class="[
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold gap-1',
                        selectedSeller.status === 'verified'  ? 'status-verified'  :
                        selectedSeller.status === 'suspended' ? 'status-suspended' :
                        selectedSeller.status === 'rejected'  ? 'status-rejected'  :
                        'status-pending'
                      ]">
                        <span class="w-1.5 h-1.5 rounded-full inline-block" :class="[
                          selectedSeller.status === 'verified'  ? 'bg-green-500'  :
                          selectedSeller.status === 'suspended' ? 'bg-red-500'    :
                          selectedSeller.status === 'rejected'  ? 'bg-gray-500'   :
                          'bg-amber-500'
                        ]"></span>
                        {{ selectedSeller.status }}
                      </span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item class="dark:bg-gray-700">
                  <q-item-label caption class="dark:text-gray-300">Products</q-item-label>
                  <q-item-label class="dark:text-white">{{ selectedSeller.productCount || 0 }}</q-item-label>
                </q-item>
                <q-item class="dark:bg-gray-700">
                  <q-item-label caption class="dark:text-gray-300">Revenue</q-item-label>
                  <q-item-label class="dark:text-white">${{ formatCurrency(selectedSeller.revenue || 0) }}</q-item-label>
                </q-item>
                <q-item class="dark:bg-gray-700">
                  <q-item-label caption class="dark:text-gray-300">Joined</q-item-label>
                  <q-item-label class="dark:text-white">{{ formatDate(selectedSeller.createdAt) }}</q-item-label>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup class="dark:text-white" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import adminApi from '@/services/adminApi'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import axios from '@/api/axios'
import { resolveUrl, getInitials, getAvatarColor } from '@/utils/imageUrl'

const normalizeAvatarUrl = resolveUrl

const $q = useQuasar()

// Reactive data
const sellers = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const businessTypeFilter = ref('all')
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Dialog states
const showSellerDetails = ref(false)
const selectedSeller = ref(null)
const showConfirmDialog = ref(false)
const confirmLoading = ref(false)
const pendingAction = ref(null)  // 'approve' | 'unapprove' | 'block' | 'unblock'
const pendingTarget = ref(null)
const showSellerForm = ref(false)
const sellerFormLoading = ref(false)
const sellerFormMode = ref('create')
const sellerFormId = ref(null)
const sellerFormAvatarFile = ref(null)
const sellerFormAvatarPreview = ref('')
const sellerForm = ref({
  name: '',
  email: '',
  password: '',
  company_name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
})

// Table columns
const columns = [
  { name: 'avatar',      label: 'Seller',       field: 'name',         align: 'left' },
  { name: 'email',       label: 'Email',         field: 'email',        align: 'left',   sortable: true },
  { name: 'phone',       label: 'Phone',         field: 'phone',        align: 'left' },
  { name: 'businessType',label: 'Business Type', field: 'businessType', align: 'center' },
  { name: 'products',    label: 'Products',      field: 'productCount', align: 'center' },
  { name: 'revenue',     label: 'Revenue',       field: 'revenue',      align: 'right',  sortable: true },
  { name: 'status',      label: 'Status',        field: 'status',       align: 'center', sortable: true },
  { name: 'createdAt',   label: 'Joined Date',   field: 'createdAt',    align: 'center', sortable: true },
  { name: 'actions',     label: 'Action',        align: 'center' }
]

// Filter options
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Verified', value: 'verified' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected', value: 'rejected' }
]

const businessTypeOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Individual', value: 'individual' },
  { label: 'LLC', value: 'llc' },
  { label: 'Corporation', value: 'corporation' },
  { label: 'Partnership', value: 'partnership' }
]

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Name A-Z', value: 'name' },
  { label: 'Revenue High-Low', value: 'revenue' }
]

// Computed properties
const totalSellers = computed(() => sellers.value.length)
const verifiedSellers = computed(() => sellers.value.filter(s => s.status === 'verified').length)
const pendingSellers = computed(() => sellers.value.filter(s => s.status === 'pending').length)
const suspendedSellers = computed(() => sellers.value.filter(s => s.status === 'suspended').length)

const filteredSellers = computed(() => {
  let filtered = sellers.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(seller => 
      seller.businessName?.toLowerCase().includes(query) ||
      seller.email?.toLowerCase().includes(query) ||
      seller.phone?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(seller => seller.status === statusFilter.value)
  }

  // Business type filter
  if (businessTypeFilter.value !== 'all') {
    filtered = filtered.filter(seller => seller.businessType === businessTypeFilter.value)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'name':
        return (a.businessName || '').localeCompare(b.businessName || '')
      case 'revenue':
        return (b.revenue || 0) - (a.revenue || 0)
      default:
        return 0
    }
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredSellers.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)
const paginatedSellers = computed(() => filteredSellers.value.slice(startIndex.value, endIndex.value))

const pagination = ref({
  rowsPerPage: itemsPerPage.value
})

// Confirmation dialog
const confirmIcon = computed(() => 'check_circle')
const confirmColor = computed(() => 'positive')
const confirmMessage = computed(() => {
  if (!selectedSeller.value) return ''
  return `Are you sure you want to approve ${selectedSeller.value.businessName}?`
})
const confirmAction = computed(() => 'Approve')

// Methods
const fetchSellers = async () => {
  loading.value = true
  try {
    const response = await adminApi.getAdminSellers()
    if (response.success && response.data) {
      // Extract sellers from response.data.data and map fields
      const apiSellers = response.data.data || []
      sellers.value = apiSellers.map(seller => ({
        id: seller.seller_id,
        user_id: seller.user_id,
        name: seller.name,
        email: seller.email,
        is_approved: seller.is_approved,
        is_blocked: seller.is_blocked,
        businessName: seller.profile?.company_name || seller.name || 'N/A',
        phone: seller.profile?.phone || 'N/A',
        businessType: 'N/A',
        productCount: 0,
        revenue: 0,
        status: getSellerStatus(seller.is_approved, seller.is_blocked),
        createdAt: seller.created_at || null,
        logo: seller.avatar || null,
        profile: seller.profile || {}
      }))
    } else {
      sellers.value = []
    }
  } catch (error) {
    console.error('Error fetching sellers:', error)
    sellers.value = []
    $q.notify({
      type: 'negative',
      message: 'Failed to fetch sellers',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Helper function to determine seller status based on API flags
const getSellerStatus = (isApproved, isBlocked) => {
  if (isBlocked) return 'suspended'
  if (isApproved) return 'verified'
  return 'pending'
}

const refreshSellers = () => {
  currentPage.value = 1
  fetchSellers()
}

const viewSellerDetails = (seller) => {
  selectedSeller.value = seller
  showSellerDetails.value = true
}

const onSellerAvatarSelected = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  sellerFormAvatarFile.value = file
  sellerFormAvatarPreview.value = URL.createObjectURL(file)
}

const resetSellerForm = () => {
  sellerFormAvatarFile.value = null
  sellerFormAvatarPreview.value = ''
  sellerForm.value = {
    name: '',
    email: '',
    password: '',
    company_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  }
}

const openCreateSeller = () => {
  sellerFormMode.value = 'create'
  sellerFormId.value = null
  resetSellerForm()
  showSellerForm.value = true
}

const openEditSeller = (seller) => {
  sellerFormMode.value = 'edit'
  sellerFormId.value = seller.id
  sellerFormAvatarFile.value = null
  sellerFormAvatarPreview.value = normalizeAvatarUrl(seller.avatar) || ''
  sellerForm.value = {
    name: seller.name || '',
    email: seller.email || '',
    password: '',
    company_name: seller.profile?.company_name || seller.businessName || '',
    phone: seller.profile?.phone || '',
    address: seller.profile?.address || '',
    city: seller.profile?.city || '',
    state: seller.profile?.state || '',
    postal_code: seller.profile?.postal_code || '',
    country: seller.profile?.country || '',
  }
  showSellerForm.value = true
}

const submitSellerForm = async () => {
  sellerFormLoading.value = true
  try {
    let response
    if (sellerFormAvatarFile.value) {
      const fd = new FormData()
      if (sellerFormMode.value === 'edit') fd.append('_method', 'PATCH')
      Object.entries(sellerForm.value).forEach(([k, v]) => { if (k !== 'password' || v) fd.append(k, v) })
      fd.append('avatar', sellerFormAvatarFile.value)
      const url = sellerFormMode.value === 'create' ? '/admin/sellers' : `/admin/sellers/${sellerFormId.value}`
      const res = await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      response = { success: true, data: res.data }
    } else {
      const payload = { ...sellerForm.value }
      if (sellerFormMode.value === 'edit' && !payload.password) {
        delete payload.password
      }
      response = sellerFormMode.value === 'create'
        ? await adminApi.createAdminSeller(payload)
        : await adminApi.updateAdminSeller(sellerFormId.value, payload)
    }

    if (!response.success || response.data?.success === false) {
      throw new Error(response.message || response.data?.message || 'Save failed')
    }

    $q.notify({ type: 'positive', message: sellerFormMode.value === 'create' ? 'Seller created successfully' : 'Seller updated successfully', position: 'top' })
    showSellerForm.value = false
    await fetchSellers()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message || 'Failed to save seller', position: 'top' })
  } finally {
    sellerFormLoading.value = false
  }
}

const askDeleteSeller = (seller) => {
  pendingTarget.value = seller
  pendingAction.value = 'delete'
  showConfirmDialog.value = true
}

const approveSeller = (seller) => {
  pendingTarget.value = seller
  pendingAction.value = 'approve'
  showConfirmDialog.value = true
}

const unapproveSeller = (seller) => {
  pendingTarget.value = seller
  pendingAction.value = 'unapprove'
  showConfirmDialog.value = true
}

const toggleBlockStatus = (seller) => {
  pendingTarget.value = seller
  pendingAction.value = seller.is_blocked ? 'unblock' : 'block'
  showConfirmDialog.value = true
}

const executeConfirmedAction = async () => {
  const seller = pendingTarget.value
  const action = pendingAction.value
  if (!seller || !action) return
  confirmLoading.value = true
  try {
    let response
    if (action === 'approve') {
      response = await adminApi.approveSeller(seller.id, true)
      if (response.success) {
        const idx = sellers.value.findIndex(s => s.id === seller.id)
        if (idx !== -1) { sellers.value[idx].is_approved = true; sellers.value[idx].status = 'verified'; sellers.value[idx].is_blocked = false }
        $q.notify({ type: 'positive', message: 'Seller approved successfully', position: 'top' })
      }
    } else if (action === 'unapprove') {
      response = await adminApi.approveSeller(seller.id, false)
      if (response.success) {
        const idx = sellers.value.findIndex(s => s.id === seller.id)
        if (idx !== -1) { sellers.value[idx].is_approved = false; sellers.value[idx].status = 'pending'; sellers.value[idx].is_blocked = false }
        $q.notify({ type: 'positive', message: 'Seller unapproved successfully', position: 'top' })
      }
    } else if (action === 'block' || action === 'unblock') {
      const block = action === 'block'
      response = await adminApi.blockSeller(seller.id, block)
      if (response.success) {
        const idx = sellers.value.findIndex(s => s.id === seller.id)
        if (idx !== -1) { sellers.value[idx].is_blocked = block; sellers.value[idx].status = block ? 'suspended' : 'verified' }
        $q.notify({ type: 'positive', message: `Seller ${block ? 'blocked' : 'unblocked'} successfully`, position: 'top' })
      }
    } else if (action === 'delete') {
      response = await adminApi.deleteAdminSeller(seller.id)
      if (response.success && response.data?.success !== false) {
        sellers.value = sellers.value.filter(s => s.id !== seller.id)
        $q.notify({ type: 'positive', message: 'Seller deleted successfully', position: 'top' })
      }
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: `Action failed: ${error.message || 'Unknown error'}`, position: 'top' })
  } finally {
    confirmLoading.value = false
    showConfirmDialog.value = false
    pendingTarget.value = null
    pendingAction.value = null
  }
}

const viewSellerProducts = (seller) => {
  // Navigate to seller products view
  if (seller && seller.id) {
    router.push({ name: 'SellerProducts', params: { sellerId: seller.id } });
  } else {
    console.error('Seller ID is missing');
  }
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    verified: 'positive',
    suspended: 'negative',
    rejected: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusAction = (seller) => {
  if (!seller.is_approved) {
    return 'Approve'
  } else {
    return seller.is_blocked ? 'Unblock' : 'Block'
  }
}

const getStatusActionColor = (seller) => {
  if (!seller.is_approved) {
    return 'positive'
  } else {
    return seller.is_blocked ? 'positive' : 'negative'
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, ' ')
}

const onPageChange = (page) => {
  currentPage.value = page
}

// Watchers
watch([searchQuery, statusFilter, businessTypeFilter, sortBy], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  fetchSellers()
})
</script>

<style scoped>
.q-page {
  background: none;
}

/* Status badge styles */
.status-verified {
  background-color: #dcfce7;
  color: #15803d;
  text-transform: capitalize;
}
.status-suspended {
  background-color: #fee2e2;
  color: #b91c1c;
  text-transform: capitalize;
}
.status-pending {
  background-color: #fef3c7;
  color: #b45309;
  text-transform: capitalize;
}
.status-rejected {
  background-color: #f3f4f6;
  color: #4b5563;
  text-transform: capitalize;
}
</style>

