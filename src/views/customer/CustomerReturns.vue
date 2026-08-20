<template>
  <div class="q-pa-md return-page">
    <div class="return-heading row items-center justify-between q-mb-lg q-col-gutter-sm">
      <div class="col">
        <h2 class="text-h4 text-weight-bold q-ma-none">My Return Requests</h2>
        <p class="text-body2 text-grey-7 q-mt-xs q-mb-none">Request a return for items on your finalized invoices and track its status.</p>
      </div>
      <div class="col-auto">
        <q-btn flat no-caps icon="receipt_long" label="My Orders" to="/customer/orders" />
      </div>
    </div>

    <q-banner v-if="error" rounded class="bg-red-1 text-negative q-mb-md">
      {{ error }}
      <template #action><q-btn flat color="negative" label="Retry" @click="load" /></template>
    </q-banner>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="row items-center justify-between q-pb-sm">
        <div>
          <div class="text-h6">Eligible invoices</div>
          <div class="text-caption text-grey-7">Only finalized invoices with remaining returnable items are listed.</div>
        </div>
        <q-spinner v-if="loadingInvoices" color="primary" size="24px" />
      </q-card-section>
      <q-separator />
      <q-card-section v-if="!loadingInvoices && !returnableInvoices.length" class="text-grey-7">
        There are no invoice items currently eligible for return.
      </q-card-section>
      <q-list v-else separator>
        <q-item v-for="invoice in returnableInvoices" :key="invoice.id">
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ invoice.invoice_number }}</q-item-label>
            <q-item-label caption>{{ formatDate(invoice.invoice_date || invoice.created_at) }} · {{ invoice.items.length }} item(s)</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn color="primary" no-caps label="Request Return" @click="openRequest(invoice)" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-card flat bordered>
      <q-card-section class="row items-center justify-between q-pb-sm">
        <div>
          <div class="text-h6">Return history</div>
          <div class="text-caption text-grey-7">Only your own requests appear here.</div>
        </div>
        <q-spinner v-if="loadingReturns" color="primary" size="24px" />
      </q-card-section>
      <q-separator />
      <q-card-section v-if="!loadingReturns && !returns.length" class="text-grey-7">You have not made a return request.</q-card-section>
      <q-list v-else separator>
        <q-expansion-item v-for="saleReturn in returns" :key="saleReturn.id" group="customer-returns">
          <template #header>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ saleReturn.return_number }}</q-item-label>
              <q-item-label caption>Invoice {{ saleReturn.invoice?.invoice_number || saleReturn.invoice_id }} · {{ formatDate(saleReturn.created_at) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip dense :color="statusColor(saleReturn.status)" text-color="white" class="text-capitalize">{{ saleReturn.status }}</q-chip>
            </q-item-section>
          </template>
          <q-card flat class="bg-grey-1">
            <q-card-section class="q-py-sm">
              <div class="text-body2"><strong>Reason:</strong> {{ saleReturn.reason }}</div>
              <div class="text-body2 q-mt-xs"><strong>Items:</strong> {{ itemSummary(saleReturn.items) }}</div>
              <div v-if="saleReturn.approved_at" class="text-body2 q-mt-xs"><strong>Processed:</strong> {{ formatDate(saleReturn.approved_at) }}<span v-if="saleReturn.processed_by"> by {{ saleReturn.processed_by.name }}</span></div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </q-card>

    <q-dialog v-model="requestDialog" persistent>
      <q-card style="width: 680px; max-width: 94vw">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-h6">Request return</div>
            <div class="text-caption text-grey-7">{{ selectedInvoice?.invoice_number }}</div>
          </div>
          <q-btn flat round icon="close" :disable="submitting" @click="closeRequest" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-list bordered separator>
            <q-item v-for="line in requestLines" :key="line.id">
              <q-item-section avatar top><q-checkbox v-model="line.selected" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ line.product_name }}</q-item-label>
                <q-item-label caption>{{ line.sku || 'No SKU' }} · {{ line.remaining_returnable_quantity }} available to return</q-item-label>
              </q-item-section>
              <q-item-section side top style="min-width: 112px">
                <q-input v-model.number="line.quantity" outlined dense type="number" min="1" :max="line.remaining_returnable_quantity" label="Quantity" :disable="!line.selected" />
              </q-item-section>
            </q-item>
          </q-list>
          <q-input v-model.trim="reason" class="q-mt-md" outlined type="textarea" autogrow maxlength="500" counter label="Return reason" :rules="[value => !!value || 'A return reason is required']" />
          <div v-if="requestError" class="text-negative text-body2 q-mt-sm">{{ requestError }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" :disable="submitting" @click="closeRequest" />
          <q-btn color="primary" no-caps label="Submit request" :loading="submitting" @click="submitRequest" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import returnsApi from '@/services/returnsApi'

const returnableInvoices = ref([])
const returns = ref([])
const loadingInvoices = ref(false)
const loadingReturns = ref(false)
const error = ref('')
const requestDialog = ref(false)
const selectedInvoice = ref(null)
const requestLines = ref([])
const reason = ref('')
const requestError = ref('')
const submitting = ref(false)

const unwrap = (response) => response.data?.data ?? response.data

const load = async () => {
  error.value = ''
  loadingInvoices.value = true
  loadingReturns.value = true
  try {
    const [invoicesResponse, returnsResponse] = await Promise.all([
      returnsApi.getReturnableInvoices(),
      returnsApi.getCustomerReturns(),
    ])
    returnableInvoices.value = unwrap(invoicesResponse) || []
    const data = unwrap(returnsResponse)
    returns.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (e) {
    error.value = e?.response?.data?.message || 'Unable to load return information.'
  } finally {
    loadingInvoices.value = false
    loadingReturns.value = false
  }
}

const openRequest = (invoice) => {
  selectedInvoice.value = invoice
  requestLines.value = (invoice.items || [])
    .filter((item) => Number(item.remaining_returnable_quantity) > 0)
    .map((item) => ({ ...item, selected: false, quantity: 1 }))
  reason.value = ''
  requestError.value = ''
  requestDialog.value = true
}

const closeRequest = () => {
  requestDialog.value = false
  selectedInvoice.value = null
  requestLines.value = []
  reason.value = ''
  requestError.value = ''
}

const submitRequest = async () => {
  const items = requestLines.value.filter((line) => line.selected).map((line) => ({
    invoice_item_id: line.id,
    quantity: Number(line.quantity),
  }))
  requestError.value = ''
  if (!reason.value) return void (requestError.value = 'A return reason is required.')
  if (!items.length) return void (requestError.value = 'Select at least one item.')
  const invalid = requestLines.value.find((line) => line.selected && (!Number.isInteger(Number(line.quantity)) || Number(line.quantity) < 1 || Number(line.quantity) > Number(line.remaining_returnable_quantity)))
  if (invalid) return void (requestError.value = `Enter a quantity from 1 to ${invalid.remaining_returnable_quantity} for ${invalid.product_name}.`)

  submitting.value = true
  try {
    await returnsApi.createCustomerReturn({ invoice_id: selectedInvoice.value.id, reason: reason.value, items })
    closeRequest()
    await load()
  } catch (e) {
    requestError.value = e?.response?.data?.message || 'Unable to submit the return request.'
  } finally {
    submitting.value = false
  }
}

const statusColor = (status) => ({ pending: 'orange-7', approved: 'positive', rejected: 'negative' }[status] || 'grey-7')
const itemSummary = (items = []) => items.map((item) => `${item.product_name} × ${item.quantity}`).join(', ')
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

onMounted(load)
</script>

<style scoped>
.return-page {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

@media (max-width: 599px) {
  .return-page {
    padding: 12px;
  }

  .return-heading {
    align-items: flex-start;
    gap: 8px;
  }

  .return-heading > .col,
  .return-heading > .col-auto {
    width: 100%;
    flex: 0 0 100%;
  }

  .return-heading .q-btn {
    width: 100%;
  }

  .return-page :deep(.q-item) {
    min-width: 0;
    flex-wrap: wrap;
    gap: 8px;
  }

  .return-page :deep(.q-item__section--side) {
    width: 100%;
    min-width: 0 !important;
    align-items: stretch;
    padding-left: 0;
  }

  .return-page :deep(.q-dialog__inner > .q-card) {
    max-height: 92vh;
  }
}
</style>
