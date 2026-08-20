<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div><h1 class="text-2xl font-bold text-slate-900">Purchases & Stock-In</h1><p class="text-sm text-slate-500">Draft purchases do not change inventory until received.</p></div>
      <q-btn unelevated color="primary" icon="add" label="New Purchase" @click="openCreate" />
    </div>
    <div class="bg-white border rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
      <input v-model="filters.purchase_number" class="input-base" placeholder="Purchase number" @change="load" />
      <select v-model="filters.supplier_id" class="input-base" @change="load"><option value="">All suppliers</option><option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option></select>
      <select v-model="filters.status" class="input-base" @change="load"><option value="">All statuses</option><option value="draft">Draft</option><option value="received">Received</option><option value="cancelled">Cancelled</option></select>
      <q-btn flat label="Reset" @click="reset" />
    </div>
    <div v-if="loading" class="flex justify-center py-14"><q-spinner-dots size="44px" color="primary" /></div>
    <div v-else class="bg-white border rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-slate-50"><tr><th>Purchase #</th><th>Supplier</th><th>Date</th><th class="text-right">Total</th><th>Status</th><th></th></tr></thead><tbody><tr v-for="p in purchases" :key="p.id" class="border-t"><td>{{ p.purchase_number }}</td><td>{{ p.supplier?.name }}</td><td>{{ p.purchase_date }}</td><td class="text-right">PKR {{ money(p.grand_total) }}</td><td><q-badge :color="p.status === 'received' ? 'positive' : p.status === 'cancelled' ? 'negative' : 'grey'">{{ p.status }}</q-badge></td><td><q-btn flat dense label="View" @click="view(p)" /><q-btn v-if="p.status === 'draft'" flat dense color="positive" label="Receive" @click="receive(p)" /></td></tr><tr v-if="!purchases.length"><td colspan="6" class="text-center py-10 text-slate-400">No purchases found</td></tr></tbody></table></div></div>

    <q-dialog v-model="showForm" persistent><q-card style="min-width:760px;max-width:95vw"><q-card-section><div class="text-lg font-bold">Create Purchase</div></q-card-section><q-card-section class="space-y-3"><div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><select v-model="form.supplier_id" class="input-base"><option value="">Select supplier</option><option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option></select><input v-model="form.purchase_date" type="date" class="input-base"/><select v-model="form.status" class="input-base"><option value="draft">Draft</option><option value="received">Receive now</option></select></div><table class="w-full text-sm"><thead><tr><th>Product</th><th>Qty</th><th>Unit Cost</th><th>Total</th><th></th></tr></thead><tbody><tr v-for="(item,index) in form.items" :key="index"><td><select v-model="item.product_id" class="input-base"><option value="">Select product</option><option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option></select></td><td><input v-model.number="item.quantity" min="1" type="number" class="input-base" /></td><td><input v-model.number="item.unit_cost" min="0" type="number" class="input-base" /></td><td>PKR {{ money(item.quantity * item.unit_cost) }}</td><td><q-btn flat dense icon="delete" @click="form.items.splice(index,1)" /></td></tr></tbody></table><q-btn flat icon="add" label="Add product" @click="form.items.push(blankItem())"/><div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><input v-model.number="form.discount_amount" type="number" min="0" class="input-base" placeholder="Discount"/><input v-model.number="form.tax_amount" type="number" min="0" class="input-base" placeholder="Tax"/><div class="font-bold py-2">Grand total: PKR {{ money(grandTotal) }}</div></div><textarea v-model="form.notes" class="input-base" placeholder="Notes"></textarea><div v-if="formError" class="text-red-600 text-sm">{{ formError }}</div></q-card-section><q-card-actions align="right"><q-btn flat label="Cancel" @click="showForm=false"/><q-btn unelevated color="primary" label="Save Purchase" :loading="saving" @click="save"/></q-card-actions></q-card></q-dialog>
    <q-dialog v-model="showDetail"><q-card style="min-width:650px;max-width:95vw" v-if="selected"><q-card-section><div class="text-lg font-bold">{{ selected.purchase_number }}</div><div class="text-caption">{{ selected.supplier?.name }} · {{ selected.purchase_date }} · {{ selected.creator?.name }}</div></q-card-section><q-card-section><table class="w-full text-sm"><tr v-for="item in selected.items" :key="item.id"><td>{{ item.product_name }}</td><td>{{ item.quantity }}</td><td>PKR {{ money(item.unit_cost) }}</td><td class="text-right">PKR {{ money(item.line_total) }}</td></tr></table><div class="text-right font-bold mt-3">Total: PKR {{ money(selected.grand_total) }}</div></q-card-section><q-card-actions align="right"><q-btn flat label="Close" v-close-popup /></q-card-actions></q-card></q-dialog>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import axios from '@/api/axios'
import purchasesApi from '@/services/purchasesApi'
import suppliersApi from '@/services/suppliersApi'
const purchases=ref([]), suppliers=ref([]), products=ref([]), loading=ref(false), saving=ref(false), showForm=ref(false), showDetail=ref(false), selected=ref(null), formError=ref('')
const filters=reactive({ purchase_number:'', supplier_id:'', status:'' })
const form=reactive({ supplier_id:'', purchase_date:new Date().toISOString().slice(0,10), status:'draft', discount_amount:0, tax_amount:0, notes:'', items:[] })
const blankItem=()=>({ product_id:'', quantity:1, unit_cost:0 })
const money=v=>Number(v||0).toLocaleString('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2})
const grandTotal=computed(()=>Math.max(0,form.items.reduce((sum,i)=>sum+Number(i.quantity||0)*Number(i.unit_cost||0),0)+Number(form.tax_amount||0)-Number(form.discount_amount||0)))
async function load(){ loading.value=true; try { const r=await purchasesApi.getPurchases(filters); const d=r.data?.data??r.data; purchases.value=d?.data??d??[] } finally { loading.value=false } }
async function loadOptions(){ const [s,p]=await Promise.all([suppliersApi.getSuppliers({active_only:true,per_page:100}),axios.get('/products',{params:{per_page:100}})]); const sd=s.data?.data??s.data, pd=p.data?.data??p.data; suppliers.value=sd?.data??sd??[]; products.value=pd?.data??pd??[] }
function reset(){ Object.assign(filters,{purchase_number:'',supplier_id:'',status:''}); load() }
function openCreate(){ Object.assign(form,{supplier_id:'',purchase_date:new Date().toISOString().slice(0,10),status:'draft',discount_amount:0,tax_amount:0,notes:'',items:[blankItem()]});formError.value='';showForm.value=true }
async function save(){ if(!form.supplier_id||!form.items.length){formError.value='Supplier and at least one item are required.';return} saving.value=true;formError.value='';try{await purchasesApi.createPurchase({...form,items:form.items.map(i=>({...i,product_id:Number(i.product_id)}))});showForm.value=false;load()}catch(e){formError.value=e?.response?.data?.message||'Unable to save purchase.'}finally{saving.value=false} }
async function view(p){const r=await purchasesApi.getPurchase(p.id);selected.value=r.data?.data??r.data;showDetail.value=true}
async function receive(p){if(!confirm(`Receive ${p.purchase_number}? Stock will increase once.`))return;try{await purchasesApi.updateStatus(p.id,{status:'received'});load()}catch(e){alert(e?.response?.data?.message||'Unable to receive purchase.')}}
onMounted(async()=>{await loadOptions();await load()})
</script>
<style scoped>th,td{@apply px-3 py-3 text-left}.input-base{@apply w-full px-3 py-2 border border-slate-300 rounded-lg text-sm}</style>
