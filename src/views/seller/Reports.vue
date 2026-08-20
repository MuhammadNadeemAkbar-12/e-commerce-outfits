<template>
  <div class="q-pa-md reports-page">
    <div class="row items-center justify-between q-mb-lg">
      <div><div class="text-h4 text-weight-bold">Reports & Analytics</div><div class="text-body2 text-grey-7">Finalized invoice sales, current inventory, and historical gross profit.</div></div>
      <q-btn flat icon="refresh" label="Refresh" :loading="loading" @click="loadActive" />
    </div>

    <q-tabs v-model="tab" dense align="left" active-color="primary" indicator-color="primary" class="bg-white rounded-borders q-mb-md" @update:model-value="loadActive">
      <q-tab name="sales" icon="receipt_long" label="Sales" /><q-tab name="inventory" icon="inventory_2" label="Inventory" /><q-tab name="profit" icon="trending_up" label="Gross Profit" />
    </q-tabs>
    <q-banner v-if="error" rounded class="bg-red-1 text-negative q-mb-md">{{ error }}</q-banner>

    <template v-if="tab === 'sales'">
      <q-card flat bordered class="q-mb-md"><q-card-section class="row q-col-gutter-sm items-end">
        <div class="col-12 col-sm-2"><q-select v-model="sales.type" dense outlined emit-value map-options label="Report" :options="periodOptions" @update:model-value="loadSales" /></div>
        <div v-if="sales.type === 'daily'" class="col-12 col-sm-2"><q-input v-model="sales.date" dense outlined type="date" label="Date" @update:model-value="loadSales" /></div>
        <div v-if="sales.type === 'monthly' || sales.type === 'yearly'" class="col-6 col-sm-2"><q-input v-model.number="sales.year" dense outlined type="number" label="Year" @update:model-value="loadSales" /></div>
        <div v-if="sales.type === 'monthly'" class="col-6 col-sm-2"><q-input v-model.number="sales.month" dense outlined type="number" min="1" max="12" label="Month" @update:model-value="loadSales" /></div>
        <div v-if="sales.type === 'custom'" class="col-6 col-sm-2"><q-input v-model="sales.from_date" dense outlined type="date" label="From" @update:model-value="loadSales" /></div>
        <div v-if="sales.type === 'custom'" class="col-6 col-sm-2"><q-input v-model="sales.to_date" dense outlined type="date" label="To" @update:model-value="loadSales" /></div>
        <div class="col-6 col-sm-2"><q-input v-model="sales.customer_id" dense outlined type="number" label="Customer ID" @update:model-value="loadSales" /></div>
        <div class="col-6 col-sm-2"><q-input v-model="sales.product_id" dense outlined type="number" label="Product ID" @update:model-value="loadSales" /></div>
        <div class="col-12 col-sm-2"><q-input v-model="sales.invoice_number" dense outlined label="Invoice #" @update:model-value="loadSales" /></div>
      </q-card-section></q-card>
      <ReportCards :cards="salesCards" />
      <q-card flat bordered class="q-mt-md"><q-card-section><div class="text-h6">Sales summary — {{ salesData?.period || 'Selected period' }}</div><ReportTable :rows="salesData?.rows" :columns="salesColumns" /></q-card-section></q-card>
    </template>

    <template v-if="tab === 'inventory'">
      <q-card flat bordered class="q-mb-md"><q-card-section class="row q-col-gutter-sm items-end">
        <div class="col-12 col-sm-3"><q-select v-model="inventory.stock_status" dense outlined emit-value map-options label="Stock status" :options="stockOptions" @update:model-value="loadInventory" /></div>
        <div class="col-12 col-sm-4"><q-input v-model="inventory.product" dense outlined label="Product name or SKU" @update:model-value="loadInventory" /></div>
        <div class="col-12 col-sm-2"><q-input v-model="inventory.category_id" dense outlined type="number" label="Category ID" @update:model-value="loadInventory" /></div>
      </q-card-section></q-card>
      <ReportCards :cards="inventoryCards" />
      <q-card flat bordered class="q-mt-md"><q-card-section><div class="text-h6">Inventory availability</div><div class="text-caption text-grey-7 q-mb-sm">{{ inventoryData?.valuation_basis }}</div>
        <q-table flat :rows="inventoryData?.products?.data || []" :columns="inventoryColumns" row-key="id" :loading="loading"><template #body-cell-stock_status="props"><q-td :props="props"><q-badge :color="props.value === 'IN STOCK' ? 'positive' : 'negative'">{{ props.value }}</q-badge></q-td></template><template #body-cell-stock_value="props"><q-td :props="props">{{ money(props.value) }}</q-td></template><template #body-cell-cost_price="props"><q-td :props="props">{{ money(props.value) }}</q-td></template></q-table>
      </q-card-section></q-card>
    </template>

    <template v-if="tab === 'profit'">
      <q-card flat bordered class="q-mb-md"><q-card-section class="row q-col-gutter-sm items-end">
        <div class="col-12 col-sm-2"><q-select v-model="profit.type" dense outlined emit-value map-options label="Report" :options="periodOptions" @update:model-value="loadProfit" /></div>
        <div v-if="profit.type === 'daily'" class="col-12 col-sm-2"><q-input v-model="profit.date" dense outlined type="date" label="Date" @update:model-value="loadProfit" /></div>
        <div v-if="profit.type === 'monthly' || profit.type === 'yearly'" class="col-6 col-sm-2"><q-input v-model.number="profit.year" dense outlined type="number" label="Year" @update:model-value="loadProfit" /></div>
        <div v-if="profit.type === 'monthly'" class="col-6 col-sm-2"><q-input v-model.number="profit.month" dense outlined type="number" min="1" max="12" label="Month" @update:model-value="loadProfit" /></div>
        <div v-if="profit.type === 'custom'" class="col-6 col-sm-2"><q-input v-model="profit.from_date" dense outlined type="date" label="From" @update:model-value="loadProfit" /></div>
        <div v-if="profit.type === 'custom'" class="col-6 col-sm-2"><q-input v-model="profit.to_date" dense outlined type="date" label="To" @update:model-value="loadProfit" /></div>
        <div class="col-6 col-sm-2"><q-input v-model="profit.product_id" dense outlined type="number" label="Product ID" @update:model-value="loadProfit" /></div>
        <div class="col-6 col-sm-2"><q-input v-model="profit.category_id" dense outlined type="number" label="Category ID" @update:model-value="loadProfit" /></div>
      </q-card-section></q-card>
      <ReportCards :cards="profitCards" />
      <q-card flat bordered class="q-mt-md"><q-card-section><div class="text-h6">Gross profit — {{ profitData?.period || 'Selected period' }}</div><div class="text-caption text-grey-7 q-mb-sm">{{ profitData?.definition }}</div><ReportTable :rows="profitData?.rows" :columns="profitColumns" /></q-card-section></q-card>
    </template>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { QCard, QCardSection, QTable } from 'quasar'
import reportsApi from '@/services/reportsApi'

const today = new Date().toISOString().slice(0, 10)
const year = new Date().getFullYear()
const month = new Date().getMonth() + 1
const tab = ref('sales'); const loading = ref(false); const error = ref('')
const salesData = ref(null); const inventoryData = ref(null); const profitData = ref(null)
const periodOptions = [{ label: 'Daily', value: 'daily' }, { label: 'Monthly', value: 'monthly' }, { label: 'Yearly', value: 'yearly' }, { label: 'Custom range', value: 'custom' }]
const stockOptions = [{ label: 'All products', value: 'all' }, { label: 'In stock', value: 'in_stock' }, { label: 'Low stock', value: 'low_stock' }, { label: 'Out of stock', value: 'out_of_stock' }]
const sales = reactive({ type: 'monthly', date: today, year, month, from_date: today, to_date: today, customer_id: '', product_id: '', invoice_number: '' })
const inventory = reactive({ stock_status: 'all', product: '', category_id: '', per_page: 100 })
const profit = reactive({ type: 'monthly', date: today, year, month, from_date: today, to_date: today, product_id: '', category_id: '' })
const unwrap = (result) => result.data?.data ?? result.data
const clean = (parameters) => Object.fromEntries(Object.entries(parameters).filter(([, value]) => value !== '' && value !== null))
const money = (value) => `PKR ${Number(value || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const salesCards = computed(() => { const t = salesData.value?.totals || {}; return [{ label: 'Gross Sales', value: money(t.gross_sales), color: 'primary' }, { label: 'Invoices', value: t.invoice_count || 0, color: 'indigo' }, { label: 'Discounts', value: money(t.total_discounts), color: 'orange' }, { label: 'Tax', value: money(t.total_tax), color: 'blue' }, { label: 'Net Sales', value: money(t.net_sales), color: 'positive' }, { label: 'Items Sold', value: t.items_sold || 0, color: 'teal' }] })
const inventoryCards = computed(() => { const t = inventoryData.value?.summary || {}; return [{ label: 'Products', value: t.total_products || 0, color: 'primary' }, { label: 'Units', value: t.total_units || 0, color: 'indigo' }, { label: 'Stock Value', value: money(t.total_cost_value), color: 'positive' }, { label: 'Low Stock', value: t.low_stock_count || 0, color: 'orange' }, { label: 'Out of Stock', value: t.out_of_stock_count || 0, color: 'negative' }] })
const profitCards = computed(() => { const t = profitData.value?.totals || {}; return [{ label: 'Gross Sales', value: money(t.gross_sales), color: 'primary' }, { label: 'Approved Returns', value: money(t.approved_returns), color: 'orange' }, { label: 'Net Sales', value: money(t.net_sales), color: 'positive' }, { label: 'COGS', value: money(t.cost_of_goods_sold), color: 'negative' }, { label: 'Gross Profit', value: money(t.gross_profit), color: t.gross_profit >= 0 ? 'positive' : 'negative' }] })
const salesColumns = [{ name: 'period', label: 'Period', field: 'period', align: 'left' }, { name: 'invoice_count', label: 'Invoices', field: 'invoice_count', align: 'right' }, { name: 'gross_sales', label: 'Gross Sales', field: row => money(row.gross_sales), align: 'right' }, { name: 'total_discounts', label: 'Discounts', field: row => money(row.total_discounts), align: 'right' }, { name: 'total_tax', label: 'Tax', field: row => money(row.total_tax), align: 'right' }, { name: 'net_sales', label: 'Net Sales', field: row => money(row.net_sales), align: 'right' }, { name: 'items_sold', label: 'Items', field: 'items_sold', align: 'right' }]
const profitColumns = [{ name: 'period', label: 'Period', field: 'period', align: 'left' }, { name: 'gross_sales', label: 'Gross Sales', field: row => money(row.gross_sales), align: 'right' }, { name: 'approved_returns', label: 'Returns', field: row => money(row.approved_returns), align: 'right' }, { name: 'net_sales', label: 'Net Sales', field: row => money(row.net_sales), align: 'right' }, { name: 'cost_of_goods_sold', label: 'COGS', field: row => money(row.cost_of_goods_sold), align: 'right' }, { name: 'gross_profit', label: 'Gross Profit', field: row => money(row.gross_profit), align: 'right' }]
const inventoryColumns = [{ name: 'name', label: 'Product', field: 'name', align: 'left' }, { name: 'category', label: 'Category', field: row => row.category?.name || '—', align: 'left' }, { name: 'sku', label: 'SKU', field: 'sku', align: 'left' }, { name: 'stock', label: 'Stock', field: 'stock', align: 'right' }, { name: 'reorder_level', label: 'Reorder Level', field: 'reorder_level', align: 'right' }, { name: 'cost_price', label: 'Unit Cost', field: 'cost_price', align: 'right' }, { name: 'stock_value', label: 'Stock Value', field: 'stock_value', align: 'right' }, { name: 'stock_status', label: 'Status', field: 'stock_status', align: 'center' }]
const ReportCards = defineComponent({
  props: { cards: { type: Array, default: () => [] } },
  setup: (props) => {
    return () => h('div', { class: 'row q-col-gutter-md' }, props.cards.map((card) => h(
      'div',
      { class: 'col-6 col-sm-4 col-md-2', key: card.label },
      [h(QCard, { flat: true, bordered: true }, {
        default: () => [h(QCardSection, null, {
          default: () => [
            h('div', { class: 'text-caption text-grey-7' }, card.label),
            h('div', { class: `text-h6 text-${card.color}` }, String(card.value)),
          ],
        })],
      })]
    )))
  },
})
const ReportTable = defineComponent({ props: { rows: { type: Array, default: () => [] }, columns: { type: Array, default: () => [] } }, setup: props => () => h(QTable, { flat: true, rows: props.rows, columns: props.columns, rowKey: 'period', hideBottom: true }) })
async function request(loader, target, parameters) { loading.value = true; error.value = ''; try { target.value = unwrap(await loader(clean(parameters))) } catch (e) { error.value = e?.response?.data?.message || 'Unable to load report data.' } finally { loading.value = false } }
const loadSales = () => request(reportsApi.getSalesReport, salesData, sales)
const loadInventory = () => request(reportsApi.getStockReport, inventoryData, inventory)
const loadProfit = () => request(reportsApi.getProfitLoss, profitData, profit)
const loadActive = () => ({ sales: loadSales, inventory: loadInventory, profit: loadProfit }[tab.value]())
onMounted(() => { loadSales(); loadInventory(); loadProfit() })
</script>
