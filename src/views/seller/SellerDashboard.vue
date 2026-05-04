<template>
  <div class="seller-dashboard min-h-screen p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <header
      class="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      <div>
        <h1
          class="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900"
        >
          Manager Dashboard
        </h1>
        <p class="text-sm text-slate-500 mt-1 max-w-2xl">
          Products, stock alerts, invoices & revenue overview
        </p>
      </div>

      <div class="flex items-center gap-3">
        <q-btn
          unelevated
          color="primary"
          @click="openCreateProduct"
          aria-label="Create product"
        >
          <q-icon name="add" />
          <span class="ml-2 hidden sm:inline">New product</span>
        </q-btn>

        <q-btn
          outline
          color="primary"
          :loading="loading"
          @click="refreshStats"
          aria-label="Refresh"
        >
          <q-icon name="refresh" />
          <span class="ml-2 hidden sm:inline">{{
            loading ? "Refreshing…" : "Refresh"
          }}</span>
        </q-btn>
      </div>
    </header>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 text-red-700">
      {{ error }} —
      <button @click="refreshStats" class="underline">Retry</button>
    </div>

    <!-- KPI Grid -->
    <section class="grid grid-cols-1 lg:grid-cols-6 gap-5 mb-6">
      <div class="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          v-if="loading"
          class="h-36 rounded-xl bg-gradient-to-r from-slate-50 to-white animate-pulse"
        ></div>
        <div v-else class="card-kpi">
          <div class="kpi-head">
            <div class="icon circle-indigo" aria-hidden="true">
              <q-icon name="inventory_2" />
            </div>
            <div>
              <div class="label">Total products</div>
              <div class="value" aria-live="polite">{{ displayed.total }}</div>
              <div class="sub">All items in your catalog</div>
            </div>
          </div>
          <div class="kpi-footer">
            <div class="badge">Total: {{ stats.products.total }}</div>
            <div class="muted">
              Approved: {{ stats.products.approved }} · Pending:
              {{ stats.products.pending }}
            </div>
          </div>
        </div>

        <div v-if="!loading" class="card-kpi">
          <div class="kpi-head">
            <div class="icon circle-emerald">
              <q-icon name="check_circle" />
            </div>
            <div>
              <div class="label">Approved</div>
              <div class="value" aria-live="polite">
                {{ displayed.approved }}
              </div>
              <div class="sub">Live on marketplace</div>
            </div>
          </div>
          <div class="kpi-footer">
            <div class="badge success">Live: {{ stats.products.approved }}</div>
            <div class="muted">Approved: {{ approvedPct }}%</div>
          </div>
        </div>

        <div v-if="!loading" class="card-kpi">
          <div class="kpi-head">
            <div class="icon circle-amber"><q-icon name="hourglass_top" /></div>
            <div>
              <div class="label">Pending approval</div>
              <div class="value" aria-live="polite">
                {{ displayed.pending }}
              </div>
              <div class="sub">Awaiting admin review</div>
            </div>
          </div>
          <div class="kpi-footer">
            <div class="badge warn">Pending: {{ stats.products.pending }}</div>
            <div class="muted">Action required</div>
          </div>
        </div>
      </div>

      <!-- Revenue / donut -->
      <aside
        class="lg:col-span-2 p-4 rounded-xl bg-white shadow-sm flex flex-col gap-3"
      >
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <div class="text-xs text-slate-400">Revenue (this month)</div>
            <div class="text-xl font-semibold mt-1">
              {{ formatCurrency(stats.orders.revenue_this_month) }}
            </div>
            <div class="text-xs text-slate-400 mt-1">
              All time: {{ formatCurrency(stats.orders.revenue_total) }}
            </div>
          </div>

          <div class="w-28 h-28 flex items-center justify-center">
            <svg viewBox="0 0 36 36" class="w-24 h-24">
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#eef2ff"
                stroke-width="6"
              ></circle>
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                :stroke="revenueColor"
                stroke-width="6"
                stroke-linecap="round"
                stroke-dasharray="100"
                :stroke-dashoffset="100 - revenuePct"
                transform="rotate(-90 18 18)"
              />
              <text
                x="18"
                y="20.5"
                text-anchor="middle"
                font-size="6"
                fill="#0b1220"
              >
                {{ revenuePct }}%
              </text>
            </svg>
          </div>
        </div>

        <div>
          <div class="text-xs text-slate-500 mb-1">Revenue trend</div>
          <div class="w-full h-12">
            <svg
              class="w-full h-12"
              viewBox="0 0 120 32"
              preserveAspectRatio="none"
              role="img"
              aria-label="Revenue sparkline"
            >
              <polyline
                :points="sparklinePoints"
                fill="none"
                stroke="#3b82f6"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2">
          <q-btn flat color="primary" label="View orders" @click="goToOrders" />
          <q-btn
            outline
            color="primary"
            label="Export CSV"
            @click="exportCSV"
          />
        </div>
      </aside>
    </section>

    <!-- Summaries -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="summary-card">
        <div class="summary-label">Orders</div>
        <div class="summary-value">{{ stats.orders.orders_count }}</div>
        <div class="summary-sub">Total orders received</div>
      </div>

      <div class="summary-card">
        <div class="summary-label">Revenue (total)</div>
        <div class="summary-value">
          {{ formatCurrency(stats.orders.revenue_total) }}
        </div>
        <div class="summary-sub">All time</div>
      </div>

      <div class="summary-card">
        <div class="summary-label">Revenue (this month)</div>
        <div class="summary-value">
          {{ formatCurrency(stats.orders.revenue_this_month) }}
        </div>
        <div class="summary-sub">This month</div>
      </div>
    </section>

    <!-- Charts + Recent Transactions -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
      <div class="bg-white rounded-2xl shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b">
          <h2 class="text-lg font-semibold">Stock In/Out (Last 7 Days)</h2>
          <div class="text-sm text-slate-500">Movement trend by day</div>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-7 gap-2 items-end h-44">
            <div v-for="(label, idx) in stats.charts.labels" :key="label" class="flex flex-col items-center gap-2">
              <div class="w-full flex items-end justify-center gap-1 h-32">
                <div
                  class="w-3 bg-emerald-400 rounded-t"
                  :style="{ height: normalizeBar(stats.charts.stock_in_last_7_days[idx] || 0, maxStockBar) + 'px' }"
                  :title="'In: ' + (stats.charts.stock_in_last_7_days[idx] || 0)"
                />
                <div
                  class="w-3 bg-rose-400 rounded-t"
                  :style="{ height: normalizeBar(stats.charts.stock_out_last_7_days[idx] || 0, maxStockBar) + 'px' }"
                  :title="'Out: ' + (stats.charts.stock_out_last_7_days[idx] || 0)"
                />
              </div>
              <div class="text-[11px] text-slate-500">{{ label }}</div>
            </div>
          </div>
          <div class="mt-3 text-xs text-slate-500 flex items-center gap-4">
            <span class="inline-flex items-center gap-1"><span class="w-2 h-2 bg-emerald-400 rounded-full"></span>Stock In</span>
            <span class="inline-flex items-center gap-1"><span class="w-2 h-2 bg-rose-400 rounded-full"></span>Stock Out</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b">
          <h2 class="text-lg font-semibold">Recent Transactions</h2>
          <div class="text-sm text-slate-500">Latest invoices, returns and stock actions</div>
        </div>
        <div class="p-2">
          <div v-if="!stats.recent_transactions.length" class="text-sm text-slate-400 text-center py-8">No recent transactions.</div>
          <div v-else class="divide-y divide-slate-100">
            <div v-for="tx in stats.recent_transactions" :key="`${tx.type}-${tx.id}`" class="px-4 py-3 flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-medium text-slate-800">{{ tx.title }}</div>
                <div class="text-xs text-slate-500 capitalize">{{ tx.type.replace('_', ' ') }} · {{ tx.status }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold" :class="tx.type === 'sale_return' ? 'text-amber-700' : 'text-slate-800'">
                  {{ tx.type === 'stock_movement' ? tx.amount : formatCurrency(tx.amount) }}
                </div>
                <div class="text-xs text-slate-400">{{ formatDate(tx.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Low-stock table -->
    <section class="mb-6">
      <div class="bg-white rounded-2xl shadow-md overflow-hidden">
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Low stock products</h2>
            <div class="text-sm text-slate-500">
              {{ stats.products.low_stock_list.length }} alert(s)
            </div>
          </div>
          <div>
            <q-btn dense flat label="Refresh" @click="refreshStats" />
          </div>
        </div>

        <div v-if="loading" class="p-6 animate-pulse">
          <div class="h-4 bg-slate-100 rounded mb-3 w-1/3"></div>
          <div class="h-4 bg-slate-100 rounded mb-3 w-2/3"></div>
        </div>

        <div v-else>
          <table class="min-w-full table-fixed">
            <thead class="bg-slate-50">
              <tr>
                <th class="py-3 px-4 text-left text-xs text-slate-500">
                  Product
                </th>
                <th class="py-3 px-4 text-left text-xs text-slate-500">ID</th>
                <th class="py-3 px-4 text-left text-xs text-slate-500">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="stats.products.low_stock_list.length === 0">
                <td colspan="4" class="py-6 text-center text-sm text-slate-500">
                  No low-stock items.
                </td>
              </tr>

              <tr
                v-for="p in stats.products.low_stock_list"
                :key="p.id"
                class="hover:bg-slate-50 transition"
              >
                <td class="py-3 px-4">
                  <div class="font-medium">{{ p.name }}</div>
                </td>
                <td class="py-3 px-4 text-sm text-slate-600">{{ p.id }}</td>
                <td class="py-3 px-4">
                  <span
                    class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200"
                    >{{ p.stock }}</span
                  >
                </td>
                <!-- <td class="py-3 px-4 text-right"> -->
                  <!-- <q-btn dense flat label="Edit" @click="goToProduct(p.id)" /> -->
                  <!-- <q-btn
                    dense
                    unelevated
                    color="positive"
                    class="ml-2"
                    label="Restock"
                    @click="openRestock(p.id)"
                  /> -->
                <!-- </td> -->
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <footer class="text-xs text-slate-400">
      Data generated at: <strong>{{ displayFetchedAt }}</strong>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import axios from "@/api/axios";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar();
const router = useRouter();

const loading = ref(false);
const error = ref("");
const fetchedAt = ref("");

const stats = ref({
  products: { total: 0, approved: 0, pending: 0, low_stock_list: [] },
  orders: { orders_count: 0, revenue_total: 0, revenue_this_month: 0 },
  charts: { labels: [], sales_last_7_days: [], stock_in_last_7_days: [], stock_out_last_7_days: [] },
  recent_transactions: [],
  insights: { top_products: [] },
});

// display counters
const displayed = ref({ total: 0, approved: 0, pending: 0 });
let rafHandles = {};

function animateNumber(key, to, ms = 700) {
  cancelAnimationFrame(rafHandles[key] || 0);
  const start = displayed.value[key] ?? 0;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min(1, (now - startTime) / ms);
    const eased = 1 - Math.pow(1 - t, 3);
    displayed.value[key] = Math.round(start + (to - start) * eased);
    if (t < 1) rafHandles[key] = requestAnimationFrame(step);
  }
  rafHandles[key] = requestAnimationFrame(step);
}

// computations
const approvedPct = computed(() => {
  const total = Number(stats.value.products.total || 0);
  const approved = Number(stats.value.products.approved || 0);
  return total > 0 ? Math.round((approved / total) * 100) : 0;
});

const revenuePct = computed(() => {
  const total = Number(stats.value.orders.revenue_total || 0);
  const month = Number(stats.value.orders.revenue_this_month || 0);
  if (total <= 0 && month > 0) return 100;
  return total > 0 ? Math.round((month / total) * 100) : 0;
});

const revenueColor = computed(() =>
  revenuePct.value > 50 ? "#10b981" : "#3b82f6"
);

const displayFetchedAt = computed(() => {
  if (!fetchedAt.value) return "—";
  try {
    return new Date(fetchedAt.value).toLocaleString();
  } catch {
    return fetchedAt.value;
  }
});

// simple mock sparkline points (non-critical)
const sparklinePoints = computed(() => {
  const values = (stats.value.charts?.sales_last_7_days || []).map((v) => Number(v || 0));
  if (!values.length) return "";
  const max = Math.max(...values, 1);
  const step = 120 / (values.length - 1);
  return values
    .map(
      (v, i) => `${(i * step).toFixed(1)},${(32 - (v / max) * 24).toFixed(1)}`
    )
    .join(" ");
});

function formatCurrency(n) {
  if (n == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(Number(n));
  } catch {
    return n;
  }
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

const maxStockBar = computed(() => {
  const a = stats.value.charts?.stock_in_last_7_days || [];
  const b = stats.value.charts?.stock_out_last_7_days || [];
  return Math.max(...a, ...b, 1);
});

function normalizeBar(value, max) {
  const n = Number(value || 0);
  if (max <= 0 || n <= 0) return 0;
  return Math.max(6, Math.round((n / max) * 120));
}

async function fetchDashboardStats() {
  loading.value = true;
  error.value = "";
  try {
    const res = await axios.get("/seller/dashboard/stats");
    const d = res?.data ?? {};
    const payload = d?.data ?? d;

    if (payload?.products) {
      stats.value.products.total =
        payload.products.total ?? stats.value.products.total;
      stats.value.products.approved =
        payload.products.approved ?? stats.value.products.approved;
      stats.value.products.pending =
        payload.products.pending ?? stats.value.products.pending;
      stats.value.products.low_stock_list = Array.isArray(
        payload.products.low_stock_list
      )
        ? payload.products.low_stock_list
        : [];
    }

    if (payload?.orders) {
      stats.value.orders.orders_count =
        payload.orders.orders_count ??
        payload.orders.orders ??
        stats.value.orders.orders_count;
      stats.value.orders.revenue_total =
        payload.orders.revenue_total ??
        payload.orders.revenue ??
        stats.value.orders.revenue_total;
      stats.value.orders.revenue_this_month =
        payload.orders.revenue_this_month ??
        stats.value.orders.revenue_this_month;
    }

    if (payload?.insights) {
      stats.value.insights.top_products = payload.insights.top_products ?? [];
    }

    if (payload?.charts) {
      stats.value.charts.labels = payload.charts.labels ?? [];
      stats.value.charts.sales_last_7_days = payload.charts.sales_last_7_days ?? [];
      stats.value.charts.stock_in_last_7_days = payload.charts.stock_in_last_7_days ?? [];
      stats.value.charts.stock_out_last_7_days = payload.charts.stock_out_last_7_days ?? [];
    }

    stats.value.recent_transactions = Array.isArray(payload?.recent_transactions)
      ? payload.recent_transactions
      : [];

    fetchedAt.value = d?.meta?.generated_at ?? new Date().toISOString();

    await nextTick();
    animateNumber("total", stats.value.products.total);
    animateNumber("approved", stats.value.products.approved);
    animateNumber("pending", stats.value.products.pending);
  } catch (err) {
    console.error("fetchDashboardStats", err);
    error.value =
      err?.response?.data?.message ?? err?.message ?? "Failed to load stats";
  } finally {
    loading.value = false;
  }
}

function refreshStats() {
  fetchDashboardStats();
}
function goToProduct(id) {
  router.push(`/seller/products/${id}/edit`).catch(() => {});
}
function openCreateProduct() {
  router.push("/seller/products").catch(() => {});
}
function openRestock(id) {
  goToProduct(id);
}
function goToOrders() {
  router.push("/seller/orders").catch(() => {});
}
function exportCSV() {
  $q.notify({ type: "info", message: "Export not implemented in this demo" });
}

onMounted(fetchDashboardStats);

watch(
  () => [
    stats.value.products.total,
    stats.value.products.approved,
    stats.value.products.pending,
  ],
  () => {
    animateNumber("total", stats.value.products.total);
    animateNumber("approved", stats.value.products.approved);
    animateNumber("pending", stats.value.products.pending);
  }
);
</script>

<style scoped>
.seller-dashboard {
  background: linear-gradient(180deg, #fbfdff 0%, #f8fafc 100%);
}

/* KPI */
.card-kpi {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 28px rgba(8, 15, 30, 0.06);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}
.card-kpi:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 44px rgba(8, 15, 30, 0.09);
}
.kpi-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 18px;
}
.circle-indigo {
  background: #eef2ff;
  color: #3740ff;
}
.circle-emerald {
  background: #ecfdf5;
  color: #059669;
}
.circle-amber {
  background: #fff7ed;
  color: #b45309;
}
.label {
  font-size: 12px;
  color: #6b7280;
}
.value {
  font-size: 28px;
  font-weight: 700;
  color: #0b1220;
  margin-top: 4px;
}
.sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}
.kpi-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  gap: 8px;
  align-items: center;
}
.badge {
  background: #f1f5f9;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: #0b1220;
}
.badge.success {
  background: #ecfdf5;
  color: #065f46;
}
.badge.warn {
  background: #fffbeb;
  color: #92400e;
}
.muted {
  color: #64748b;
  font-size: 13px;
}

/* summary */
.summary-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(12, 20, 40, 0.04);
}
.summary-label {
  font-size: 12px;
  color: #6b7280;
}
.summary-value {
  font-size: 20px;
  font-weight: 700;
  margin-top: 6px;
  color: #0b1220;
}
.summary-sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}

/* table */
table {
  width: 100%;
  border-collapse: collapse;
}
thead th {
  font-weight: 600;
  font-size: 12px;
  color: #6b7280;
  text-align: left;
  padding: 12px 16px;
}
tbody td {
  padding: 12px 16px;
  border-top: 1px solid #f1f5f9;
}

/* responsive */
@media (max-width: 768px) {
  .value {
    font-size: 22px;
  }
  .card-kpi {
    padding: 14px;
  }
}

/* pulse */
.animate-pulse {
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
