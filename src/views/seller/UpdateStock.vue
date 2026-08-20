<template>
	<q-page class="q-pa-lg bg-gray-50 min-h-screen">
		<!-- Header -->
		<div class="flex items-center justify-between mb-6">
			<div>
				<h2 class="text-2xl font-bold text-gray-800">Update Stock</h2>
				<p class="text-sm text-gray-500">Quickly update seller product stock.</p>
			</div>

			<div class="flex items-center gap-2">
				<q-btn
					dense
					outline
					color="primary"
					:loading="loading"
					@click="fetchProducts"
					icon="refresh"
					label="Refresh"
					class="rounded-xl px-4"
				/>
			</div>
		</div>

		<!-- Products Table -->
		<div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
			<q-table
				:rows="products"
				:columns="columns"
				row-key="id"
				flat
				hide-bottom
				separator="horizontal"
				table-class="text-gray-700"
			>
				<!-- Product Name -->
				<template v-slot:body-cell-name="props">
					<td class="py-3 px-4 align-middle">
						<div class="font-semibold text-gray-800">{{ props.row.name }}</div>
						<div v-if="props.row.sku" class="text-xs text-gray-500">
							{{ props.row.sku }}
						</div>
					</td>
				</template>

				<!-- Stock Input -->
				<template v-slot:body-cell-stock="props">
					<td class="py-3 px-4 text-center align-middle">
						<q-input
							dense
							outlined
							type="number"
							min="0"
							v-model.number="props.row._newStock"
							class="w-24 text-center rounded-md"
						/>
					</td>
				</template>

				<!-- Update Button -->
				<template v-slot:body-cell-update="props">
					<td class="py-3 px-4 text-right align-middle">
						<q-btn
							dense
							unelevated
							color="primary"
							class="rounded-lg px-4 shadow-sm"
							:loading="props.row._saving"
							@click="updateStock(props.row)"
							label="Update"
						/>
					</td>
				</template>
			</q-table>

			<!-- Empty / Loading States -->
			<div
				v-if="!products.length && !loading"
				class="p-6 text-center text-sm text-gray-500"
			>
				No products found.
			</div>

			<div v-if="loading && products.length === 0" class="p-6 text-center">
				<q-spinner-dots color="primary" size="32px" />
			</div>
		</div>
	</q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "@/api/axios";

const $q = useQuasar();

const columns = [
	{ name: "name", label: "Product", field: "name", align: "left" },
	{ name: "stock", label: "Stock", field: "_newStock", align: "center" },
	{ name: "update", label: "Action", field: "update", align: "right" },
];

const products = ref([]);
const loading = ref(false);

function normalizeProducts(arr) {
	return (arr || []).map((p) => {
		const copy = { ...p };
		copy._newStock = Number(copy.stock ?? copy.quantity ?? 0);
		copy._saving = false;
		return copy;
	});
}

async function fetchProducts() {
	loading.value = true;
	try {
		const res = await axios.get("/seller/products", { params: { per_page: 100 } });
		const d = res?.data ?? res;
		const payload = d?.data ?? d;
		const list = Array.isArray(payload)
			? payload
			: payload?.products ?? payload?.data ?? [];
		products.value = normalizeProducts(list);
	} catch (err) {
		console.error("fetch products error", err);
		$q.notify({
			type: "negative",
			message: err?.response?.data?.message ?? "Failed to load products",
		});
	} finally {
		loading.value = false;
	}
}

async function updateStock(row) {
	if (!row || row._saving) return;
	const id = row.id;
	const newStock = Number(row._newStock);
	if (Number.isNaN(newStock) || newStock < 0) {
		$q.notify({
			type: "negative",
			message: "Enter a valid stock number (0 or greater).",
		});
		return;
	}

	row._saving = true;
	try {
		const payload = { stock: newStock };
		const res = await axios.patch(`/seller/products/${id}/stock`, payload);
		const updated = res?.data?.data ?? res?.data ?? res;
		row.stock = updated?.stock ?? updated?.quantity ?? newStock;
		row._newStock = row.stock;
		$q.notify({ type: "positive", message: "Stock updated successfully" });
	} catch (err) {
		console.error("update stock error", err);
		const msg =
			err?.response?.data?.message ??
			err?.message ??
			"Failed to update stock";
		$q.notify({ type: "negative", message: msg });
	} finally {
		row._saving = false;
	}
}

onMounted(fetchProducts);
</script>

<style scoped>
.q-table th {
	background: #f9fafb;
	font-weight: 600;
	font-size: 14px;
	color: #374151;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	text-align: center;
}
.q-table td {
	font-size: 14px;
	vertical-align: middle !important;
}
</style>
